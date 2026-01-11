import { LatLngCoordinate, RDCoordinate } from "../types";

// Force Update: 1722424800000

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

// Approximate conversion for WGS84 to RD New
export const wgs84ToRd = (lat: number, lng: number): RDCoordinate => {
    const x0 = 155000;
    const y0 = 463000;
    const phi0 = 52.15517440;
    const lam0 = 5.38720621;

    const dPhi = 0.3600 * 3600 * (lat - phi0);
    const dLam = 0.3600 * 3600 * (lng - lam0);

    const calcX = (5260.52916 * dLam + 105.94684 * dPhi * dLam + 2.45656 * dPhi * Math.pow(dLam, 2) + -0.81885 * Math.pow(dLam, 3) + 0.05594 * dPhi * Math.pow(dLam, 3) + -0.05607 * Math.pow(dPhi, 3) * dLam + 0.01199 * dLam + -0.00256 * Math.pow(dPhi, 3) * Math.pow(dLam, 2) + 0.00128 * dPhi * Math.pow(dLam, 4) + 0.00022 * Math.pow(dLam, 2) + -0.00022 * Math.pow(dPhi, 2) + 0.00026 * Math.pow(dPhi, 5));
    const calcY = (3235.65389 * dPhi + -32.58297 * Math.pow(dLam, 2) + -0.24750 * Math.pow(dPhi, 2) + -0.84978 * Math.pow(dPhi, 2) * dLam + -0.06550 * Math.pow(dPhi, 3) + -0.01709 * Math.pow(dPhi, 2) * Math.pow(dLam, 2) + -0.00738 * dPhi + 0.00530 * Math.pow(dPhi, 4) + -0.00039 * Math.pow(dPhi, 2) * Math.pow(dLam, 3) + 0.00033 * Math.pow(dPhi, 4) * dLam + -0.00012 * dPhi * dLam);

    return { x: x0 + calcX, y: y0 + calcY };
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
