const _year = new Date().getFullYear();

export const ACTIVE_YEAR = _year;
export const PERMIT_YEARS = Array.from({ length: 6 }, (_, i) => _year - i);
export const SEARCH_RADIUS_M = 200;
export const MIN_SEARCH_RADIUS_M = 50;
export const MAX_SEARCH_RADIUS_M = 1000;
// Approximate 200m in WGS84 degrees — triggers "Search here" button on map pan
export const MAP_MOVE_THRESHOLD_DEG = 0.002;
