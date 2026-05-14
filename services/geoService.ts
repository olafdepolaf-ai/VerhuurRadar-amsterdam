import { LatLngCoordinate, RDCoordinate } from "../types";


// Approximate conversion for RD New to WGS84
export const rdToWgs84 = (x: number, y: number): LatLngCoordinate => {
    const x0 = 155000;
    const y0 = 463000;
    const phi0 = 52.15517440;
    const lam0 = 5.38720621;

    const dx = (x - x0) * 1e-5;
    const dy = (y - y0) * 1e-5;

    let phi = phi0;
    let lam = lam0;

    // Coefficients for phi (latitude)
    phi += (3235.65389 * dy) / 3600;
    phi += (-32.58297 * Math.pow(dx, 2)) / 3600;
    phi += (-0.24750 * Math.pow(dy, 2)) / 3600;
    phi += (-0.84978 * Math.pow(dx, 2) * dy) / 3600;
    phi += (-0.06550 * Math.pow(dy, 3)) / 3600;
    phi += (-0.01709 * Math.pow(dx, 2) * Math.pow(dy, 2)) / 3600;
    phi += (-0.00738 * dx) / 3600;
    phi += (0.00530 * Math.pow(dx, 4)) / 3600;
    phi += (-0.00039 * Math.pow(dx, 2) * Math.pow(dy, 3)) / 3600;
    phi += (0.00033 * Math.pow(dx, 4) * dy) / 3600;
    phi += (-0.00012 * dx * dy) / 3600;

    // Coefficients for lam (longitude)
    lam += (5260.52916 * dx) / 3600;
    lam += (105.94684 * dx * dy) / 3600;
    lam += (2.45656 * dx * Math.pow(dy, 2)) / 3600;
    lam += (-0.81885 * Math.pow(dx, 3)) / 3600;
    lam += (0.05594 * dx * Math.pow(dy, 3)) / 3600;
    lam += (-0.05607 * Math.pow(dx, 3) * dy) / 3600;
    lam += (0.01199 * dy) / 3600;
    lam += (-0.00256 * Math.pow(dx, 3) * Math.pow(dy, 2)) / 3600;
    lam += (0.00128 * dx * Math.pow(dy, 4)) / 3600;
    lam += (0.00022 * Math.pow(dy, 2)) / 3600;
    lam += (-0.00022 * Math.pow(dx, 2)) / 3600;
    lam += (0.00026 * Math.pow(dx, 5)) / 3600;

    return { lat: phi, lng: lam };
};

import proj4 from 'proj4';

// Define RD New projection (EPSG:28992)
proj4.defs("EPSG:28992", "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.2369,50.0087,465.658,-0.40685,0.35073,-1.87035,4.0812 +units=m +no_defs");

export const wgs84ToRd = (lat: number, lng: number): RDCoordinate => {
    const [x, y] = proj4("WGS84", "EPSG:28992", [lng, lat]);
    return { x, y };
};

export const parsePointString = (pointStr: string): { x: number, y: number } | null => {
    if (!pointStr) return null;
    const matches = pointStr.match(/POINT\s*\(\s*([\d.]+)[,\s]+([\d.]+)\s*\)/i);
    if (matches && matches.length === 3) {
        return {
            x: parseFloat(matches[1]),
            y: parseFloat(matches[2])
        };
    }
    return null;
}
