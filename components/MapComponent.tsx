import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { GroupedLocation, PermitStatus, LatLngCoordinate } from '../types';

// Force Rewrite: Fix Syntax Error and restore functionality

interface MapProps {
    center: LatLngCoordinate;
    locations: GroupedLocation[];
    onMarkerClick: (id: string) => void;
    selectedLocationId?: string;
    isMobileListCollapsed?: boolean;
}

const MapComponent: React.FC<MapProps> = ({ center, locations, onMarkerClick, selectedLocationId, isMobileListCollapsed }) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});
    const userMarkerRef = useRef<L.Marker | null>(null);
    const radiusCircleRef = useRef<L.Circle | null>(null);

    // 1. Initialize Map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        mapRef.current = L.map(containerRef.current, { zoomControl: false }).setView([center.lat, center.lng], 18);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        }).addTo(mapRef.current);
        
        const tilePane = mapRef.current.getPane('tilePane');
        if (tilePane) {
            tilePane.style.opacity = '0.85';
        }

        L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
        
        if (mapRef.current.getPane('popupPane')) {
            mapRef.current.getPane('popupPane')!.style.zIndex = '1001';
        }

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    // 2. Handle Mobile Resize
    useEffect(() => {
        if (mapRef.current) {
            setTimeout(() => mapRef.current?.invalidateSize(), 350); // Wait for CSS transition
        }
    }, [isMobileListCollapsed]);

    // 3. Update User Marker, Radius Circle, and Fit Bounds
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // User Marker (Red Pin)
        const pinSvg = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="fill: #dc2626;"><path d="M16,0A11.2,11.2,0,0,0,4.8,11.2c0,8.8,11.2,20.8,11.2,20.8S27.2,20,27.2,11.2A11.2,11.2,0,0,0,16,0Zm0,16a4.8,4.8,0,1,1,4.8-4.8A4.8,4.8,0,0,1,16,16Z"/><circle cx="16" cy="11.2" r="2.5" fill="#fff"/></svg>`;
        const icon = L.divIcon({
            html: pinSvg,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });

        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(center);
        } else {
            userMarkerRef.current = L.marker(center, { icon }).addTo(map);
        }

        // Radius Circle
        if (radiusCircleRef.current) {
            radiusCircleRef.current.setLatLng(center);
        } else {
            radiusCircleRef.current = L.circle(center, {
                radius: 200,
                color: '#2563eb', // Blue
                fillOpacity: 0,
                dashArray: '5, 5',
                weight: 2
            }).addTo(map);
        }
        
        // Fit bounds to the circle dynamically
        const circleBounds = radiusCircleRef.current.getBounds();
        map.fitBounds(circleBounds, { padding: [10, 10] });

    }, [center]);

    // 4. Update Permit Markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear old markers
        // Fix: Use Object.keys to avoid type inference issues with Object.values.
        Object.keys(markersRef.current).forEach(key => markersRef.current[key].remove());
        markersRef.current = {};

        // Add new markers
        locations.forEach(loc => {
            const marker = L.circleMarker(loc.wgs84, {
                radius: 5,
                fillColor: loc.status === PermitStatus.ACTIVE ? '#ef4444' : '#94a3b8',
                fillOpacity: 1,
                color: '#ffffff', // White border
                weight: 1,
            }).addTo(map);

            marker.bindPopup(`<b>${loc.address}</b><br>${loc.status === PermitStatus.ACTIVE ? 'Actief' : 'Inactief'}`);

            marker.on('click', () => onMarkerClick(loc.address));

            marker.on('mouseover', () => marker.setStyle({ color: '#334155', weight: 3 }));
            marker.on('mouseout', () => {
                if (loc.address !== selectedLocationId) {
                    marker.setStyle({ color: '#ffffff', weight: 1 });
                }
            });

            markersRef.current[loc.address] = marker;
        });

    }, [locations, onMarkerClick]);

    // 5. Update Selected Marker Style
    useEffect(() => {
        // Fix: Use Object.keys to avoid type inference issues with Object.entries and remove redundant casting.
        Object.keys(markersRef.current).forEach(address => {
            const marker = markersRef.current[address];
            const isSelected = address === selectedLocationId;
            marker.setStyle({
                color: isSelected ? '#334155' : '#ffffff',
                weight: isSelected ? 3 : 1
            });
            if (isSelected) {
                marker.bringToFront();
                if (!marker.isPopupOpen()) {
                  marker.openPopup();
                }
            }
        });
    }, [selectedLocationId]);


    return <div ref={containerRef} className="w-full h-full" />;
};

export default MapComponent;