
const proj4 = require('proj4');

// Define RD New projection (EPSG:28992)
proj4.defs("EPSG:28992", "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.2369,50.0087,465.658,-0.40685,0.35073,-1.87035,4.0812 +units=m +no_defs");

const wgs84ToRd = (lat, lng) => {
    const [x, y] = proj4("WGS84", "EPSG:28992", [lng, lat]);
    return { x, y };
};

// Test Case: Amsterdam Central Station
const testLat = 52.379189;
const testLng = 4.899431;

console.log(`Input WGS84: ${testLat}, ${testLng}`);
const result = wgs84ToRd(testLat, testLng);
console.log(`Calculated RD: X=${result.x.toFixed(2)}, Y=${result.y.toFixed(2)}`);

if (result.x > 120000 && result.x < 123000 && result.y > 486000 && result.y < 489000) {
    console.log("PASS: Coordinates are within expected range for Amsterdam Central.");
} else {
    console.log("FAIL: Coordinates are way off.");
}
