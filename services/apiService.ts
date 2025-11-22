import { AddressResult, PermitRecord, RDCoordinate } from "../types";
import { rdToWgs84 } from "./geoService";

const PDOK_SUGGEST_URL = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest";
const PDOK_LOOKUP_URL = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup";
const OVERHEID_SRU_URL = "https://repository.overheid.nl/sru";

// Helper to cycle through proxies if one fails
const fetchWithProxy = async (targetUrl: string): Promise<string> => {
    console.info(`Fetching URL via Proxy:`, targetUrl);
    
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
            const text = await response.text();
            console.log(`Data received (${text.length} bytes)`);
            return text;
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
    const url = `${PDOK_SUGGEST_URL}?q=${encodeURIComponent(query)}&fq=gemeentenaam:Amsterdam&rows=7&wt=json`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.response.docs.map((doc: any) => ({
            id: doc.id,
            weergavenaam: doc.weergavenaam
        }));
    } catch (error) {
        console.error("PDOK Search error", error);
        return [];
    }
};

export const lookupAddress = async (id: string): Promise<AddressResult | null> => {
    const url = `${PDOK_LOOKUP_URL}?id=${encodeURIComponent(id)}&fl=id,weergavenaam,centroide_rd,centroide_ll&wt=json`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.response.docs.length > 0 ? data.response.docs[0] : null;
    } catch (error) {
        console.error("PDOK Lookup error", error);
        return null;
    }
};

export const fetchRecentPermits = async (): Promise<PermitRecord[]> => {
    console.info("Starting Health Check: Fetching 3 recent permits...");
    const center = { x: 121500, y: 487000 }; 
    const radiusKm = 15; 
    
    // Wide date range to ensure we get data
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
        _cb: Date.now().toString()
    });

    const targetUrl = `${OVERHEID_SRU_URL}?${params.toString()}`;

    try {
        const xmlText = await fetchWithProxy(targetUrl);
        // Pass false to 'requireCoordinates' so we don't drop recent permits with bad geo data
        return parseXMLResponse(xmlText, currentYear, false);
    } catch (error) {
        console.error("Recent Fetch error", error);
        return [];
    }
}

export const fetchActivePermitCount = async (): Promise<number | null> => {
    const CACHE_KEY_DATE = 'buurtchecker_count_date';
    const CACHE_KEY_VAL = 'buurtchecker_count_val';
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const cachedDate = localStorage.getItem(CACHE_KEY_DATE);
    const cachedVal = localStorage.getItem(CACHE_KEY_VAL);
    if (cachedDate === todayStr && cachedVal) {
        return parseInt(cachedVal, 10);
    }

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
        _cb: Date.now().toString()
    });

    const targetUrl = `${OVERHEID_SRU_URL}?${params.toString()}`;

    try {
        const xmlText = await fetchWithProxy(targetUrl);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const countNode = findNodeByLocalName(xmlDoc, "numberOfRecords");
        
        if (countNode && countNode.textContent) {
            const count = parseInt(countNode.textContent, 10);
            localStorage.setItem(CACHE_KEY_DATE, todayStr);
            localStorage.setItem(CACHE_KEY_VAL, count.toString());
            return count;
        }
        return null;
    } catch (error) {
        console.error("Active Count Fetch Error", error);
        return null;
    }
};

export const fetchPermitsForYear = async (center: RDCoordinate, radiusMeters: number, year: number): Promise<PermitRecord[]> => {
    console.info(`Searching year ${year} radius ${radiusMeters}m...`);
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    const x = Math.round(center.x);
    const y = Math.round(center.y);
    
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
        _cb: Date.now().toString()
    });

    const targetUrl = `${OVERHEID_SRU_URL}?${params.toString()}`;

    try {
        const xmlText = await fetchWithProxy(targetUrl);
        // For map plotting, we REQUIRE valid coordinates, so pass true
        return parseXMLResponse(xmlText, year, true);
    } catch (error) {
        console.error(`SRU Fetch error for ${year}`, error);
        return [];
    }
};

const validateAndFixRD = (rd: { x: number, y: number }): { x: number, y: number } | null => {
    let { x, y } = rd;

    // Check if WGS84 (Lat/Lng) instead of RD
    // Lat ~52, Lng ~4.8. RD is > 10000.
    // If small numbers, we assume it's already WGS84, but this function returns RD.
    // We handle this in parseXMLResponse now.
    
    if (x > 300000 && y < 300000) {
        const temp = x;
        x = y;
        y = temp;
    }

    if (x < 0 || x > 300000 || y < 300000 || y > 650000) {
        return null; 
    }
    return { x, y };
}

const parseXMLResponse = (xmlText: string, yearContext: number, requireCoordinates: boolean = true): PermitRecord[] => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        const records = findAllNodesByLocalName(xmlDoc, "record");
        console.log(`Parsed ${records.length} records from XML.`);
        const results: PermitRecord[] = [];

        records.forEach((record, index) => {
            try {
                const identifier = findValueByLocalName(record, "identifier") || `unknown-${index}-${yearContext}`;
                const rawTitle = findValueByLocalName(record, "title") || "Onbekende vergunning";
                
                // Construct URL
                let url = identifier;
                if (identifier && !identifier.startsWith('http')) {
                    // Usually identifiers are like "gmb-2025-12345". 
                    // The public URL is often https://zoek.officielebekendmakingen.nl/{identifier}
                    url = `https://zoek.officielebekendmakingen.nl/${identifier}`;
                }

                let dateStr = findValueByLocalName(record, "modified") || findValueByLocalName(record, "datumOntvangst");
                if (dateStr) {
                    dateStr = dateStr.split("T")[0]; 
                } else {
                    dateStr = `${yearContext}-01-01`;
                }

                let address = rawTitle.replace(/Besluit vakantieverhuur vergunning Verleend/i, "").trim();
                if (address.startsWith(",")) address = address.substring(1).trim();
                if (!address) address = "Adres onbekend";

                let rd: { x: number, y: number } | null = null;
                let wgs: { lat: number, lng: number } | null = null;

                // Parsing Geometry
                const puntNode = findNodeByLocalName(record, "Punt");
                let rawCoordStr = "";

                if (puntNode) {
                    const locPunt = findValueByLocalName(puntNode, "locatiepunt");
                    const geom = findValueByLocalName(puntNode, "geometrie");
                    rawCoordStr = locPunt || geom || "";
                } else {
                    rawCoordStr = findValueByLocalName(record, "locatiepunt") || "";
                }

                if (rawCoordStr) {
                    const parts = rawCoordStr.match(/[\d.]+/g);
                    if (parts && parts.length >= 2) {
                        const v1 = parseFloat(parts[0]);
                        const v2 = parseFloat(parts[1]);

                        // Check if it's Lat/Lng (Small numbers)
                        if (v1 < 100 && v2 < 100) {
                             // Assuming Lat Lng (e.g. 52.3 4.9)
                             // API usually gives Lat Lng in 'locatiepunt'
                             wgs = { lat: v1, lng: v2 };
                             // Fake RD to satisfy interface if needed, or leave undefined
                             rd = { x: 0, y: 0 }; 
                        } else {
                            // Assume RD (Large numbers)
                            rd = { x: v1, y: v2 };
                        }
                    }
                }

                if (requireCoordinates) {
                    // We strictly need valid coordinates to plot on map
                    if (wgs) {
                         // We have direct WGS
                         results.push({ id: identifier, title: rawTitle, date: dateStr, address, coordinates: rd!, wgs84: wgs, url });
                    } else if (rd) {
                        const validRD = validateAndFixRD(rd);
                        if (validRD) {
                            const converted = rdToWgs84(validRD.x, validRD.y);
                            if (converted) {
                                results.push({ id: identifier, title: rawTitle, date: dateStr, address, coordinates: validRD, wgs84: converted, url });
                            }
                        }
                    }
                } else {
                    // Loose mode (for Recent list), take whatever we have
                    // Even if no coords, push the record
                     results.push({ 
                        id: identifier, 
                        title: rawTitle, 
                        date: dateStr, 
                        address, 
                        coordinates: rd || undefined, 
                        wgs84: wgs || undefined,
                        url
                    });
                }

            } catch (e) {
                // ignore single failure
            }
        });

        if (records.length > 0 && results.length === 0 && requireCoordinates) {
            console.warn("Found records but all were dropped due to missing/invalid coordinates.");
        }

        return results;
    } catch (docError) {
        console.error("XML parsing failed completely", docError);
        return [];
    }
};

// --- XML Helpers ---

function findAllNodesByLocalName(parent: Document | Element, localName: string): Element[] {
    const result: Element[] = [];
    const allTags = parent.getElementsByTagName("*");
    for (let i = 0; i < allTags.length; i++) {
        if (allTags[i].localName === localName) {
            result.push(allTags[i]);
        }
    }
    return result;
}

function findNodeByLocalName(parent: Document | Element, localName: string): Element | null {
    const allTags = parent.getElementsByTagName("*");
    for (let i = 0; i < allTags.length; i++) {
        if (allTags[i].localName === localName) {
            return allTags[i];
        }
    }
    return null;
}

function findValueByLocalName(parent: Element, localName: string): string | null {
    const node = findNodeByLocalName(parent, localName);
    return node ? node.textContent : null;
}