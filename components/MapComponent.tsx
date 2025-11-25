

import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { GroupedLocation, PermitStatus, LatLngCoordinate } from '../types';

interface MapComponentProps {
    center: LatLngCoordinate;
    locations: GroupedLocation[];
    onMarkerClick: (location: GroupedLocation) => void;
    selectedLocationId?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ center, locations, onMarkerClick, selectedLocationId }) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});
    const userMarkerRef = useRef<L.Marker | null>(null);
    const radiusCircleRef = useRef<L.Circle | null>(null);
    
    const onMarkerClickRef = useRef(onMarkerClick);
    useEffect(() => { onMarkerClickRef.current = onMarkerClick; }, [onMarkerClick]);

    const selectedLocationIdRef = useRef(selectedLocationId);
    useEffect(() => { selectedLocationIdRef.current = selectedLocationId; }, [selectedLocationId]);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        mapRef.current = L.map(containerRef.current, { zoomControl: false, attributionControl: false }).setView([center.lat, center.lng], 18);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd', maxZoom: 22
        }).addTo(mapRef.current);

        L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

        radiusCircleRef.current = L.circle([center.lat, center.lng], {
            color: '#2563eb', fillOpacity: 0, radius: 200, weight: 2, dashArray: '6, 6'
        }).addTo(mapRef.current);

        const pinSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" class="w-full h-full filter drop-shadow-md">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="3" fill="white" />
                <polygon points="12,24 9,15 15,15" fill="#dc2626"/>
            </svg>
        `;

        const userIcon = L.divIcon({ className: 'bg-transparent border-0', html: pinSvg, iconSize: [40, 48], iconAnchor: [20, 48] });

        userMarkerRef.current = L.marker([center.lat, center.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapRef.current);

        return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;
        if (userMarkerRef.current) userMarkerRef.current.setLatLng([center.lat, center.lng]);
        if (radiusCircleRef.current) radiusCircleRef.current.setLatLng([center.lat, center.lng]);
        mapRef.current.flyTo([center.lat, center.lng]);
    }, [center]);

    useEffect(() => {
        if (!mapRef.current) return;
        
        // FIX: Cast marker to L.CircleMarker to access 'remove' method.
        Object.values(markersRef.current).forEach(marker => (marker as L.CircleMarker).remove());
        markersRef.current = {};

        const bounds = L.latLngBounds([center.lat, center.lng], [center.lat, center.lng]);

        locations.forEach(loc => {
            const isActive = loc.status === PermitStatus.ACTIVE;
            const fillColor = isActive ? '#ef4444' : '#94a3b8';
            const strokeColor = '#ffffff';
            const weight = 1;

            const marker = L.circleMarker([loc.wgs84.lat, loc.wgs84.lng], {
                radius: 5, fillColor, color: strokeColor, weight, stroke: true, opacity: 1, fillOpacity: 1
            });

            marker.on('mouseover', function (this: L.CircleMarker) {
                this.setStyle({ color: '#334155', weight: 3 }); this.bringToFront();
            });

            marker.on('mouseout', function (this: L.CircleMarker) {
                const isSelected = selectedLocationIdRef.current === loc.address;
                this.setStyle({ color: isSelected ? '#334155' : '#ffffff', weight: isSelected ? 3 : 1 });
            });

            marker.on('click', () => {
                onMarkerClickRef.current(loc);
                const popupContent = `<div class="font-sans"><h3 class="font-bold text-sm mb-1">${loc.address}</h3><p class="text-xs ${isActive ? 'text-red-500 font-bold' : 'text-slate-500'}">${isActive ? '● Actief' : '○ Inactief'}</p></div>`;
                marker.bindPopup(popupContent).openPopup();
            });

            marker.addTo(mapRef.current!);
            markersRef.current[loc.address] = marker;
            bounds.extend([loc.wgs84.lat, loc.wgs84.lng]);
        });

        if (locations.length > 0) {
            mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 21 });
        } else {
            mapRef.current.setView([center.lat, center.lng], 20);
        }

    }, [locations]);

    useEffect(() => {
        Object.entries(markersRef.current).forEach(([address, marker]) => {
            const isSelected = address === selectedLocationId;
            (marker as L.CircleMarker).setStyle({
                color: isSelected ? '#334155' : '#ffffff',
                weight: isSelected ? 3 : 1, stroke: true
            });
            if (isSelected) {
                // FIX: Cast marker to L.CircleMarker to access leaflet methods.
                (marker as L.CircleMarker).bringToFront();
                if (!(marker as L.CircleMarker).isPopupOpen()) {
                    (marker as L.CircleMarker).openPopup();
                }
            }
        });
    }, [selectedLocationId]);

    return <div ref={containerRef} className="w-full h-full z-0" />;
};

export default MapComponent;
