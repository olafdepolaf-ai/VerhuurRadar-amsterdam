import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { GroupedLocation, PermitStatus, LatLngCoordinate } from '../types';

// Force Update: 1722424800000

interface MapProps { center: LatLngCoordinate; locations: GroupedLocation[]; onMarkerClick: (id: string) => void; selectedLocationId?: string; isMobileListCollapsed?: boolean; }

const MapComponent: React.FC<MapProps> = ({ center, locations, onMarkerClick, selectedLocationId, isMobileListCollapsed }) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});
    const userMarkerRef = useRef<L.Marker | null>(null);
    const radiusCircleRef = useRef<L.Circle | null>(null);
    
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        mapRef.current = L.map(containerRef.current, { zoomControl: false }).setView([center.lat, center.lng], 18);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' }).addTo(mapRef.current);
        L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
        if (mapRef.current.getPane('popupPane')) { mapRef.current.getPane('popupPane')!.style.zIndex = '1001'; }
        return () => { mapRef.current?.remove(); mapRef.current = null; };
    }, []);

    useEffect(() => { if (mapRef.current) { setTimeout(() => mapRef.current?.invalidateSize(), 350); } }, [isMobileListCollapsed]);

    useEffect(() => {
        if (!mapRef.current) return;
        if (userMarkerRef.current) userMarkerRef.current.setLatLng(center); else {
            const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40" fill="#dc2626"><path d="M12 0C7 0 3 4 3 9c0 7 9 19 9 19s9-12 9-19c0-5-4-9-9-9zm0 12a3 3 0 110-6 3 3 0 010 6z"/></svg>`;
            const icon = L.divIcon({ className: 'bg-transparent border-0', html: pinSvg, iconSize: [24, 40], iconAnchor: [12, 40] });
            userMarkerRef.current = L.marker(center, { icon, zIndexOffset: 1000 }).addTo(mapRef.current);
        }
        if (radiusCircleRef.current) radiusCircleRef.current.setLatLng(center); else {
            radiusCircleRef.current = L.circle(center, { color: '#2563eb', fillOpacity: 0, radius: 200, weight: 2, dashArray: '6, 6' }).addTo(mapRef.current);
        }
        if (radiusCircleRef.current) {
            mapRef.current.fitBounds(radiusCircleRef.current.getBounds(), { padding: [20, 20] });
        }
    }, [center]);

    useEffect(() => {
        if (!mapRef.current) return;
        // Fix: Added type assertion for marker `m` to resolve 'unknown' type error.
        Object.values(markersRef.current).forEach(m => (m as L.CircleMarker).remove());
        markersRef.current = {};
        locations.forEach(loc => {
            const isActive = loc.status === PermitStatus.ACTIVE;
            const marker = L.circleMarker(loc.wgs84, { radius: 5, fillColor: isActive ? '#ef4444' : '#94a3b8', color: '#ffffff', weight: 1, fillOpacity: 1 });
            marker.on('click', () => { onMarkerClick(loc.address); marker.bindPopup(`<div class="font-bold">${loc.address}</div>`).openPopup(); });
            marker.on('mouseover', function(this: L.CircleMarker) { this.setStyle({ color: '#334155', weight: 3 }); });
            marker.on('mouseout', function(this: L.CircleMarker) { this.setStyle({ color: loc.address === selectedLocationId ? '#334155' : '#ffffff', weight: loc.address === selectedLocationId ? 3 : 1 }); });
            marker.addTo(mapRef.current!);
            markersRef.current[loc.address] = marker;
        });
    }, [locations, onMarkerClick, selectedLocationId]);

    useEffect(() => {
        Object.entries(markersRef.current).forEach(([address, marker]) => {
            const isSelected = address === selectedLocationId;
            (marker as L.CircleMarker).setStyle({ color: isSelected ? '#334155' : '#ffffff', weight: isSelected ? 3 : 1 });
            if (isSelected) (marker as L.CircleMarker).bringToFront();
        });
    }, [selectedLocationId]);

    return <div ref={containerRef} className="w-full h-full" />;
};
export default MapComponent;