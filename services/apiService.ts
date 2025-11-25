
import { AddressResult, PermitRecord, RDCoordinate } from "../types";
import { rdToWgs84 } from "./geoService";

const PDOK_SUGGEST_URL = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest";
const PDOK_LOOKUP_URL = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup";
const OVERHEID_SRU_URL = "https://repository.overheid.nl/sru";

// --- Caching Logic ---

interface CacheEntry<T> {
    timestamp: number;
    data: T;
}

const CACHE_PREFIX = "vr_cache_";

function getFromCache<T>(key: string, ttlSeconds: number): T | null {
    try {
        const fullKey = CACHE_PREFIX + key;
        const item = localStorage.getItem(fullKey);
        if (!item) return null;

        const entry: CacheEntry<T> = JSON.parse(item);
        const now = Date.now();
        const ageSeconds = (now - entry.timestamp) / 1000;

        if (ageSeconds < ttlSeconds) {
            return entry.data;
        } else {
            localStorage.removeItem(fullKey);
            return null;
        }
    } catch (e) {
        return null;
    }
}

function saveToCache<T>(key: string, data: T) {
    try {
        const fullKey = CACHE_PREFIX + key;
        const entry: CacheEntry<T> = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (e) {
        console.warn("Failed to save to cache (Quota exceeded?)", e);
    }
}

// Helper to cycle through proxies if one fails
const fetchWithProxy = async (targetUrl: string): Promise<string> => {
    const proxies = [
        (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url: string) => `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`
    ];

    let lastError: unknown;

    for (const proxyFn of proxies) {
        try {
            const finalUrl = proxyFn(targetUrl);
            const response = await fetch(finalUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (e) {
            console.warn(`Proxy attempt failed: ${e}`);
            lastError = e;
        }
    }
    const err = lastError || new Error("Network request failed via all proxies");
    console.error(`All proxies failed`, err);
    throw err;
};

export const searchAddress = async (query: string): Promise<AddressResult[]> => {
    if (query.length < 3) return [];
    const cacheKey = `suggest_${query.toLowerCase()}`;
    const cached = getFromCache<AddressResult[]>(cacheKey, 3600);
    if (cached) return cached;

    const url = `${PDOK_SUGGEST_URL}?q=${encodeURIComponent(query)}&fq=gemeentenaam:Amsterdam&rows=7&wt=json`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const results = data.response.docs.map((doc: any) => ({
            id: doc.id,
            weergavenaam: doc.weergavenaam
        }));
        saveToCache(cacheKey, results);
        return results;
    } catch (error) {
        console.error("PDOK Search error", error);
        return [];
    }
};

export const lookupAddress = async (id: string): Promise<AddressResult | null> => {
    const cacheKey = `lookup_${id}`;
    const cached = getFromCache<AddressResult>(cacheKey, 7 * 24 * 3600);
    if (cached) return cached;

    const url = `${PDOK_LOOKUP_URL}?id=${encodeURIComponent(id)}&fl=id,weergavenaam,centroide_rd,centroide_ll&wt=json`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const result = data.response.docs.length > 0 ? data.response.docs[0] : null;
        if (result) saveToCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error("PDOK Lookup error", error);
        return null;
    }
};

export const fetchRecentPermits = async (): Promise<PermitRecord[]> => {
    const cacheKey = `recent_permits_v2`;
    const cached = getFromCache<PermitRecord[]>(cacheKey, 6 * 3600);
    if (cached) return cached;

    const center = { x: 121500, y: 487000 }; 
    const radiusKm = 15; 
    
    const startDate = "2024-01-01"; 
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    const currentYear = today.getFullYear();

    const spatialClause = `w.locatiepunt within/rijksdriehoek "${center.x} ${center.y} ${radiusKm}"`;

    const cqlQuery = `
        c.product-area="officielepublicaties" 
        AND ${spatialClause} 
        AND dt.creator=="Amsterdam" 
        AND dt.modified>=${startDate} 
        AND dt.modified<=${endDate} 
        AND dt.title="Besluit vakantieverhuur vergunning Verleend" 
        sortBy dt.modified/sort.descending
    `.replace(/\s+/g, ' ').trim();

    const params = new URLSearchParams({
        operation: 'searchRetrieve',
        version: '1.2',
        recordSchema: 'gzd',
        query: cqlQuery,
        maximumRecords: '3', 
        startRecord: '1',
    });

    const targetUrl = `${OVERHEID_SRU_URL}?${params.toString()}`;

    try {
        const xmlText = await fetchWithProxy(targetUrl);
        const results = parseXMLResponse(xmlText, currentYear, false);
        saveToCache(cacheKey, results);
        return results;
    } catch (error) {
        console.error("Recent Fetch error", error);
        return [];
    }
}

export const fetchActivePermitCount = async (): Promise<number | null> => {
    const cacheKey = `active_count_val`;
    const cached = getFromCache<number>(cacheKey, 24 * 3600);
    if (cached !== null) return cached;

    const today = new Date();
    const currentYear = today.getFullYear();
    const isGracePeriod = today.getMonth() <= 2; 
    const startYear = isGracePeriod ? currentYear - 1 : currentYear;
    const startDate = `${startYear}-01-01`;

    const cqlQuery = `
        c.product-area="officielepublicaties" 
        AND dt.creator=="Amsterdam" 
        AND dt.modified>=${startDate} 
        AND dt.title="Besluit vakantieverhuur vergunning Verleend"
    `.replace(/\s+/g, ' ').trim();

    const params = new URLSearchParams({
        operation: 'searchRetrieve',
        version: '1.2',
        recordSchema: 'gzd',
        query: cqlQuery,
        maximumRecords: '0', 
        startRecord: '1',
    });

    const targetUrl = `${OVERHEID_SRU_URL}?${params.toString()}`;

    try {
        const xmlText = await fetchWithProxy(targetUrl);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const countNode = findNodeByLocalName(xmlDoc, "numberOfRecords");
        
        if (countNode && countNode.textContent) {
            const count = parseInt(countNode.textContent, 10);
            saveToCache(cacheKey, count);
            return count;
        }
        return null;
    } catch (error) {
        console.error("Active Count Fetch Error", error);
        return null;
    }
};

export const fetchPermitsForYear = async (center: RDCoordinate, radiusMeters: number, year: number): Promise<PermitRecord[]> => {
    const x = Math.round(center.x);
    const y = Math.round(center.y);
    
    const cacheKey = `permits_${x}_${y}_${radiusMeters}_${year}`;

    const currentYear = new Date().getFullYear();
    let ttl = 90 * 24 * 3600; // 90 days for historical
    
    if (year === currentYear) {
        ttl = 6 * 3600; // 6 hours for current
    }

    const cached = getFromCache<PermitRecord[]>(cacheKey, ttl);
    if (cached) return cached;

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const radiusKm = radiusMeters / 1000;

    const spatialClause = `w.locatiepunt within/rijksdriehoek "${x} ${y} ${radiusKm}"`;

    const cqlQuery = `
        c.product-area="officielepublicaties" 
        AND ${spatialClause} 
        AND dt.creator=="Amsterdam" 
        AND dt.modified>=${startDate} 
        AND dt.modified<=${endDate} 
        AND dt.title="Besluit vakantieverhuur vergunning Verleend" 
        sortBy dt.modified/sort.descending
    `.replace(/\s+/g, ' ').trim();

    const params = new URLSearchParams({
        operation: 'searchRetrieve',
        version: '1.2',
        recordSchema: 'gzd',
        query: cqlQuery,
        maximumRecords: '50', 
        startRecord: '1',
    });

    const targetUrl = `${OVERHEID_SRU_URL}?${params.toString()}`;

    try {
        const xmlText = await fetchWithProxy(targetUrl);
        const results = parseXMLResponse(xmlText, year, true);
        saveToCache(cacheKey, results);
        return results;
    } catch (error) {
        console.error(`SRU Fetch error for ${year}`, error);
        return [];
    }
};

const validateAndFixRD = (rd: { x: number, y: number }): { x: number, y: number } | null => {
    let { x, y } = rd;
    if (x > 300000 && y < 300000) { [x, y] = [y, x]; } // Swap
    if (x < 0 || x > 300000 || y < 300000 || y > 650000) return null; 
    return { x, y };
}

const parseXMLResponse = (xmlText: string, yearContext: number, requireCoordinates: boolean = true): PermitRecord[] => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        const records = findAllNodesByLocalName(xmlDoc, "record");
        const results: PermitRecord[] = [];

        records.forEach((record, index) => {
            try {
                const identifier = findValueByLocalName(record, "identifier") || `unknown-${index}-${yearContext}`;
                const rawTitle = findValueByLocalName(record, "title") || "Onbekende vergunning";
                
                let url = identifier;
                if (identifier && !identifier.startsWith('http')) {
                    url = `https://zoek.officielebekendmakingen.nl/${identifier}.html`;
                }

                let dateStr = findValueByLocalName(record, "modified") || `${yearContext}-01-01`;
                if (dateStr) dateStr = dateStr.split("T")[0]; 

                let address = rawTitle.replace(/Besluit vakantieverhuur vergunning Verleend/i, "").trim().replace(/^,/, '').trim();
                if (!address) address = "Adres onbekend";

                let rd: { x: number, y: number } | null = null;
                let wgs: { lat: number, lng: number } | null = null;

                const puntNode = findNodeByLocalName(record, "Punt");
                let locPunt = puntNode ? findValueByLocalName(puntNode, "locatiepunt") : findValueByLocalName(record, "locatiepunt");
                let geom = puntNode ? findValueByLocalName(puntNode, "geometrie") : null;

                if (locPunt) {
                    const parts = locPunt.match(/[\d.]+/g);
                    if (parts && parts.length >= 2) {
                        const v1 = parseFloat(parts[0]), v2 = parseFloat(parts[1]);
                        if (v1 < 100 && v2 < 100) { wgs = { lat: v1, lng: v2 }; } 
                        else { rd = { x: v1, y: v2 }; }
                    }
                } else if (geom) {
                    const parts = geom.match(/[\d.]+/g);
                    if (parts && parts.length >= 2) {
                        rd = { x: parseFloat(parts[0]), y: parseFloat(parts[1]) };
                    }
                }

                if (rd && !wgs) {
                    const validRD = validateAndFixRD(rd);
                    if (validRD) { wgs = rdToWgs84(validRD.x, validRD.y); }
                }

                if (!requireCoordinates || wgs) {
                     results.push({ id: identifier, title: rawTitle, date: dateStr, address, coordinates: rd || undefined, wgs84: wgs || undefined, url });
                }
            } catch (e) { /* ignore single failure */ }
        });

        return results;
    } catch (docError) {
        console.error("XML parsing failed completely", docError);
        return [];
    }
};

// --- XML Helpers ---

function findAllNodesByLocalName(parent: Document | Element, localName: string): Element[] {
    return Array.from(parent.getElementsByTagName("*")).filter(el => el.localName === localName);
}

function findNodeByLocalName(parent: Document | Element, localName: string): Element | null {
    return findAllNodesByLocalName(parent, localName)[0] || null;
}

function findValueByLocalName(parent: Element, localName: string): string | null {
    const node = findNodeByLocalName(parent, localName);
    return node ? node.textContent : null;
}

// Force-Rewrite: 1722421332906
