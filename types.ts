export interface RDCoordinate {
    x: number;
    y: number;
}

export interface LatLngCoordinate {
    lat: number;
    lng: number;
}

export interface AddressResult {
    id: string;
    weergavenaam: string;
    centroide_rd?: string; // e.g., "POINT(121500 487000)"
    centroide_ll?: string; // e.g., "POINT(4.9 52.3)"
}

export enum PermitStatus {
    ACTIVE = 'ACTIVE', // 2025 permit exists
    INACTIVE = 'INACTIVE', // 2020-2024 exists, but no 2025
    UNKNOWN = 'UNKNOWN'
}

export interface PermitRecord {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    address: string;
    coordinates?: RDCoordinate; // Optional now
    wgs84?: LatLngCoordinate;   // Optional now
}

export interface GroupedLocation {
    address: string;
    wgs84: LatLngCoordinate;
    status: PermitStatus;
    permits: PermitRecord[];
}