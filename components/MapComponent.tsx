import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { GroupedLocation, PermitStatus, LatLngCoordinate } from '../types';

interface MapComponentProps {
    center: LatLngCoordinate;
    locations: GroupedLocation[];
    onMarkerClick: (location: GroupedLocation) => void;
    selectedLocationId?: string; // address as ID
}

const MapComponent: React.FC<MapComponentProps> = ({ center, locations, onMarkerClick, selectedLocationId }) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});
    const userMarkerRef = useRef<L.Marker | null>(null);
    const radiusCircleRef = useRef<L.Circle | null>(null);

    // Initialize Map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Increased zoom level from 18 to 19
        mapRef.current = L.map(containerRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView([center.lat, center.lng], 19);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(mapRef.current);

        L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

        // Add 200m radius circle (Red for Amsterdam branding)
        radiusCircleRef.current = L.circle([center.lat, center.lng], {
            color: '#dc2626', // red-600
            fillColor: '#dc2626',
            fillOpacity: 0.05,
            radius: 200,
            weight: 1,
            dashArray: '5, 5'
        }).addTo(mapRef.current);

        // Add User Location Marker (Red)
        // Removed 'border-2 border-white' as requested
        const userIcon = L.divIcon({
            className: 'custom-user-icon',
            html: `<div class="w-4 h-4 bg-red-600 rounded-full shadow-lg pulse-ring"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        userMarkerRef.current = L.marker([center.lat, center.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapRef.current);

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update center/user marker
    useEffect(() => {
        if (!mapRef.current) return;
        
        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([center.lat, center.lng]);
        }
        if (radiusCircleRef.current) {
            radiusCircleRef.current.setLatLng([center.lat, center.lng]);
        }
    }, [center]);

    // Handle markers and FitBounds
    useEffect(() => {
        if (!mapRef.current) return;
        
        // Clear existing markers
        Object.values(markersRef.current).forEach((marker: L.CircleMarker) => marker.remove());
        markersRef.current = {};

        const bounds = L.latLngBounds([center.lat, center.lng], [center.lat, center.lng]);

        // Add new markers
        locations.forEach(loc => {
            const isActive = loc.status === PermitStatus.ACTIVE;
            const isSelected = selectedLocationId === loc.address;
            
            // Functional colors: Green for Active, Gray for Inactive
            const fillColor = isActive ? '#10b981' : '#94a3b8';
            
            const marker = L.circleMarker([loc.wgs84.lat, loc.wgs84.lng], {
                radius: 5,
                fillColor: fillColor,
                // Apply Dark Gray stroke ONLY if selected
                color: isSelected ? '#334155' : 'transparent', 
                weight: isSelected ? 3 : 0,
                stroke: isSelected, 
                opacity: 1,
                fillOpacity: 0.9
            });

            marker.on('click', () => {
                onMarkerClick(loc);
                
                const popupContent = `
                    <div class="font-sans">
                        <h3 class="font-bold text-sm mb-1">${loc.address}</h3>
                        <p class="text-xs ${isActive ? 'text-green-600 font-bold' : 'text-slate-500'}">
                            ${isActive ? '● Nu actief (2025)' : '○ Alleen historie'}
                        </p>
                    </div>
                `;
                marker.bindPopup(popupContent).openPopup();
            });

            // Bring selected marker to front
            if (isSelected) {
                marker.bringToFront();
            }

            marker.addTo(mapRef.current!);
            markersRef.current[loc.address] = marker;
            bounds.extend([loc.wgs84.lat, loc.wgs84.lng]);
        });

        // Fit bounds if there are locations found
        // Increased maxZoom to 19 to allow zooming in closer to the circle
        if (locations.length > 0) {
            mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 19 });
        } else {
            mapRef.current.setView([center.lat, center.lng], 19);
        }

    }, [locations, center, onMarkerClick, selectedLocationId]); // Added selectedLocationId to deps

    // Handle external selection styling (popup logic)
    useEffect(() => {
        if (selectedLocationId && markersRef.current[selectedLocationId]) {
            const marker = markersRef.current[selectedLocationId];
            marker.openPopup();
            // Optional: pan to selected
             mapRef.current?.panTo(marker.getLatLng());
        }
    }, [selectedLocationId]);

    return <div ref={containerRef} className="w-full h-full z-0" />;
};

export default MapComponent;