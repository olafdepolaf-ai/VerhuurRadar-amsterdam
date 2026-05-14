import { AddressResult, PermitRecord, RDCoordinate } from "../types";
import { rdToWgs84, wgs84ToRd } from "./geoService";


interface PdokSuggestDoc {
    id: string;
    weergavenaam: string;
    centroide_ll?: string;
    centroide_rd?: string;
}

interface PdokResponse {
    response: { docs: PdokSuggestDoc[] };
}

const PDOK_SUGGEST_URL = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest";
const PDOK_LOOKUP_URL = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup";
const OVERHEID_SRU_URL = "/api/overheid-sru";

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
    } catch (e) { return null; }
}

function saveToCache<T>(key: string, data: T) {
    try {
        const fullKey = CACHE_PREFIX + key;
        const entry: CacheEntry<T> = { timestamp: Date.now(), data: data };
        localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (e) { console.warn("Failed to save to cache", e); }
}

const fetchApi = async (targetUrl: string): Promise<string> => {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
};

export const searchAddress = async (query: string): Promise<AddressResult[]> => {
    if (query.length < 3) return [];
    const url = `${PDOK_SUGGEST_URL}?q=${encodeURIComponent(query)}&fq=gemeentenaam:Amsterdam&rows=7&wt=json`;
    try {
        const response = await fetch(url);
        const data: PdokResponse = await response.json();
        return data.response.docs.map(doc => ({
            id: doc.id,
            weergavenaam: doc.weergavenaam
        }));
    } catch (error) { return []; }
};

export const resolvePostcode6 = async (query: string): Promise<AddressResult | null> => {
    const pc6 = query.replace(/\s+/g, '').toUpperCase();
    const url = `${PDOK_SUGGEST_URL}?q=${encodeURIComponent(pc6)}&fq=type:postcode&rows=1&wt=json`;
    try {
        const response = await fetch(url);
        const data: PdokResponse = await response.json();
        if (!data.response.docs.length) return null;
        const details = await lookupAddress(data.response.docs[0].id);
        if (!details) return null;
        return { ...details, weergavenaam: `Postcode ${pc6}` };
    } catch { return null; }
};

export const resolvePostcode4 = async (query: string): Promise<AddressResult | null> => {
    const url = `${PDOK_SUGGEST_URL}?q=${encodeURIComponent(query)}&fq=type:postcode&rows=30&fl=id,weergavenaam,centroide_ll&wt=json`;
    try {
        const response = await fetch(url);
        const data: PdokResponse = await response.json();
        const docs = data.response.docs;
        if (!docs.length) return null;
        let sumLat = 0, sumLng = 0, count = 0;
        for (const doc of docs) {
            const m = doc.centroide_ll?.match(/POINT\s*\(\s*([\d.]+)\s+([\d.]+)\s*\)/i);
            if (m) { sumLng += parseFloat(m[1]); sumLat += parseFloat(m[2]); count++; }
        }
        if (!count) return null;
        const avgLat = sumLat / count, avgLng = sumLng / count;
        const rd = wgs84ToRd(avgLat, avgLng);
        return {
            id: `pc4_${query}`,
            weergavenaam: `Postcode ${query}`,
            centroide_ll: `POINT(${avgLng} ${avgLat})`,
            centroide_rd: `POINT(${rd.x} ${rd.y})`
        };
    } catch { return null; }
};

export const lookupAddress = async (id: string): Promise<AddressResult | null> => {
    const url = `${PDOK_LOOKUP_URL}?id=${encodeURIComponent(id)}&fl=id,weergavenaam,centroide_rd,centroide_ll&wt=json`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.response.docs.length > 0 ? data.response.docs[0] : null;
    } catch (error) { return null; }
};

export const fetchRecentPermits = async (): Promise<PermitRecord[]> => {
    const cacheKey = `recent_permits_v3`;
    const cached = getFromCache<PermitRecord[]>(cacheKey, 6 * 3600);
    if (cached) return cached;
    const center = { x: 121500, y: 487000 };
    const radiusKm = 15;
    const startDate = `${new Date().getFullYear() - 1}-01-01`;
    const cqlQuery = `c.product-area="officielepublicaties" AND w.locatiepunt within/rijksdriehoek "${center.x} ${center.y} ${radiusKm}" AND dt.creator=="Amsterdam" AND dt.modified>=${startDate} AND dt.title="Besluit vakantieverhuur vergunning Verleend" sortBy dt.modified/sort.descending`.replace(/\s+/g, ' ').trim();
    const params = new URLSearchParams({ operation: 'searchRetrieve', version: '1.2', recordSchema: 'gzd', query: cqlQuery, maximumRecords: '3' });
    const targetUrl = `${OVERHEID_SRU_URL}?${params.toString()}`;
    try {
        const xmlText = await fetchApi(targetUrl);
        const results = parseXMLResponse(xmlText, new Date().getFullYear(), false);
        saveToCache(cacheKey, results);
        return results;
    } catch (error) { return []; }
};

export const fetchActivePermitCount = async (): Promise<number | null> => {
    const cacheKey = `active_count_v2`;
    const cached = getFromCache<number>(cacheKey, 24 * 3600);
    if (cached !== null) return cached;
    const today = new Date();
    const startYear = today.getMonth() <= 2 ? today.getFullYear() - 1 : today.getFullYear();
    const cqlQuery = `c.product-area="officielepublicaties" AND dt.creator=="Amsterdam" AND dt.modified>=${startYear}-01-01 AND dt.title="Besluit vakantieverhuur vergunning Verleend"`.replace(/\s+/g, ' ').trim();
    const params = new URLSearchParams({ operation: 'searchRetrieve', version: '1.2', query: cqlQuery, maximumRecords: '0' });
    const targetUrl = `${OVERHEID_SRU_URL}?${params.toString()}`;
    try {
        const xmlText = await fetchApi(targetUrl);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const countNode = findNodeByLocalName(xmlDoc, "numberOfRecords");
        if (countNode && countNode.textContent) {
            const count = parseInt(countNode.textContent, 10);
            saveToCache(cacheKey, count);
            return count;
        }
        return null;
    } catch (error) { return null; }
};

export const fetchPermitCountForMonth = async (year: number, month: number): Promise<number> => {
    const mm = String(month).padStart(2, '0');
    const cacheKey = `monthly_${year}_${mm}`;
    const cached = getFromCache<number>(cacheKey, 24 * 3600);
    if (cached !== null) return cached;
    const nextYear = month === 12 ? year + 1 : year;
    const nextMm = String(month === 12 ? 1 : month + 1).padStart(2, '0');
    const cqlQuery = `c.product-area="officielepublicaties" AND dt.creator=="Amsterdam" AND dt.modified>=${year}-${mm}-01 AND dt.modified<${nextYear}-${nextMm}-01 AND dt.title="Besluit vakantieverhuur vergunning Verleend"`.replace(/\s+/g, ' ').trim();
    const params = new URLSearchParams({ operation: 'searchRetrieve', version: '1.2', query: cqlQuery, maximumRecords: '0' });
    try {
        const xmlText = await fetchApi(`${OVERHEID_SRU_URL}?${params.toString()}`);
        const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
        const countNode = findNodeByLocalName(xmlDoc, 'numberOfRecords');
        if (countNode?.textContent) {
            const count = parseInt(countNode.textContent, 10);
            saveToCache(cacheKey, count);
            return count;
        }
        return 0;
    } catch { return 0; }
};

const PAGE_SIZE = 100;

const parseTotalRecords = (xmlText: string): number => {
    const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
    const node = findNodeByLocalName(xmlDoc, 'numberOfRecords');
    return node?.textContent ? parseInt(node.textContent, 10) : 0;
};

export const fetchPermitsForYear = async (center: RDCoordinate, radiusMeters: number, year: number): Promise<PermitRecord[]> => {
    const x = Math.round(center.x), y = Math.round(center.y);
    const cacheKey = `permits_${x}_${y}_${radiusMeters}_${year}`;
    const ttl = year < new Date().getFullYear() ? 90 * 24 * 3600 : 6 * 3600;
    const cached = getFromCache<PermitRecord[]>(cacheKey, ttl);
    if (cached) return cached;
    const radiusKm = radiusMeters / 1000;
    const cqlQuery = `c.product-area="officielepublicaties" AND w.locatiepunt within/rijksdriehoek "${x} ${y} ${radiusKm}" AND dt.creator=="Amsterdam" AND dt.modified>=${year}-01-01 AND dt.modified<=${year}-12-31 AND dt.title="Besluit vakantieverhuur vergunning Verleend" sortBy dt.modified/sort.descending`.replace(/\s+/g, ' ').trim();

    const fetchPage = (startRecord: number): Promise<string> => {
        const params = new URLSearchParams({ operation: 'searchRetrieve', version: '1.2', recordSchema: 'gzd', query: cqlQuery, maximumRecords: String(PAGE_SIZE), startRecord: String(startRecord) });
        return fetchApi(`${OVERHEID_SRU_URL}?${params.toString()}`);
    };

    try {
        const firstXml = await fetchPage(1);
        const firstResults = parseXMLResponse(firstXml, year, true);
        const total = parseTotalRecords(firstXml);

        if (total <= PAGE_SIZE) {
            saveToCache(cacheKey, firstResults);
            return firstResults;
        }

        const starts: number[] = [];
        for (let s = PAGE_SIZE + 1; s <= total; s += PAGE_SIZE) starts.push(s);
        const rest = await Promise.all(starts.map(fetchPage));
        const allResults = [...firstResults, ...rest.flatMap(xml => parseXMLResponse(xml, year, true))];
        saveToCache(cacheKey, allResults);
        return allResults;
    } catch (error) { return []; }
};

const validateAndFixRD = (rd: { x: number, y: number }): { x: number, y: number } | null => {
    let { x, y } = rd;
    if (x > 300000 && y < 300000) { [x, y] = [y, x]; }
    if (x < 0 || x > 300000 || y < 300000 || y > 650000) return null;
    return { x, y };
};

const parseXMLResponse = (xmlText: string, yearContext: number, requireCoordinates: boolean): PermitRecord[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const records = findAllNodesByLocalName(xmlDoc, "record");
    const results: PermitRecord[] = [];
    records.forEach((record, index) => {
        const identifier = findValueByLocalName(record, "identifier") || `unknown-${index}-${yearContext}`;
        const rawTitle = findValueByLocalName(record, "title") || "Onbekende vergunning";
        let url = identifier.startsWith('http') ? identifier : `https://zoek.officielebekendmakingen.nl/${identifier}.html`;
        let dateStr = (findValueByLocalName(record, "modified") || `${yearContext}-01-01`).split("T")[0];
        let address = rawTitle.replace(/Besluit vakantieverhuur vergunning Verleend/i, "").trim().replace(/^,/, '').trim() || "Adres onbekend";
        let rd: { x: number, y: number } | null = null;
        let wgs: { lat: number, lng: number } | null = null;
        const puntNode = findNodeByLocalName(record, "Punt");
        let locPunt = puntNode ? findValueByLocalName(puntNode, "locatiepunt") : findValueByLocalName(record, "locatiepunt");
        let geom = puntNode ? findValueByLocalName(puntNode, "geometrie") : null;
        if (locPunt) {
            const parts = locPunt.match(/[\d.]+/g);
            if (parts && parts.length >= 2) {
                const v1 = parseFloat(parts[0]), v2 = parseFloat(parts[1]);
                if (v1 < 100 && v2 < 100) { wgs = { lat: v1, lng: v2 }; } else { rd = { x: v1, y: v2 }; }
            }
        }
        if (!wgs && geom) {
            const parts = geom.match(/[\d.]+/g);
            if (parts && parts.length >= 2) { rd = { x: parseFloat(parts[0]), y: parseFloat(parts[1]) }; }
        }
        if (rd && !wgs) {
            const validRD = validateAndFixRD(rd);
            if (validRD) { wgs = rdToWgs84(validRD.x, validRD.y); }
        }
        if (!requireCoordinates || wgs) {
            results.push({ id: identifier, title: rawTitle, date: dateStr, address, coordinates: rd || undefined, wgs84: wgs || undefined, url });
        }
    });
    return results;
};

function findAllNodesByLocalName(parent: Document | Element, localName: string): Element[] { return Array.from(parent.getElementsByTagName("*")).filter(el => el.localName === localName); }
function findNodeByLocalName(parent: Document | Element, localName: string): Element | null { return findAllNodesByLocalName(parent, localName)[0] || null; }
function findValueByLocalName(parent: Element, localName: string): string | null { const node = findNodeByLocalName(parent, localName); return node ? node.textContent : null; }
