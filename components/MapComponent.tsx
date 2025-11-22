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
    
    // Stable reference for the callback to avoid re-running effects when the function reference changes
    const onMarkerClickRef = useRef(onMarkerClick);
    useEffect(() => {
        onMarkerClickRef.current = onMarkerClick;
    }, [onMarkerClick]);

    // Initialize Map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Default zoom 20
        mapRef.current = L.map(containerRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView([center.lat, center.lng], 20);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 21
        }).addTo(mapRef.current);

        L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

        // Add 200m radius circle (Blue, no fill)
        radiusCircleRef.current = L.circle([center.lat, center.lng], {
            color: '#2563eb', // blue-600
            fillColor: 'transparent',
            fillOpacity: 0,
            radius: 200,
            weight: 2,
            dashArray: '6, 6'
        }).addTo(mapRef.current);

        // Add User Location Marker (Blue)
        const userIcon = L.divIcon({
            className: 'custom-user-icon',
            html: `<div class="w-4 h-4 bg-blue-600 rounded-full shadow-lg pulse-ring"></div>`,
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

    // Update center/user marker position
    useEffect(() => {
        if (!mapRef.current) return;
        
        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([center.lat, center.lng]);
        }
        if (radiusCircleRef.current) {
            radiusCircleRef.current.setLatLng([center.lat, center.lng]);
        }
    }, [center]);

    // 1. Handle Data Changes (Create Markers & Set Initial Bounds)
    // This ONLY runs when the locations array changes (new search), NOT when selecting a marker.
    useEffect(() => {
        if (!mapRef.current) return;
        
        // Clear existing markers
        Object.values(markersRef.current).forEach((marker: L.CircleMarker) => marker.remove());
        markersRef.current = {};

        const bounds = L.latLngBounds([center.lat, center.lng], [center.lat, center.lng]);

        // Add new markers
        locations.forEach(loc => {
            const isActive = loc.status === PermitStatus.ACTIVE;
            
            // Functional colors: Green for Active, Gray for Inactive
            const fillColor = isActive ? '#10b981' : '#94a3b8';
            
            const marker = L.circleMarker([loc.wgs84.lat, loc.wgs84.lng], {
                radius: 5,
                fillColor: fillColor,
                color: 'transparent', // Default no border
                weight: 0,
                stroke: false,
                opacity: 1,
                fillOpacity: 0.9
            });

            marker.on('click', () => {
                // Call the stable ref
                onMarkerClickRef.current(loc);
                
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

            marker.addTo(mapRef.current!);
            markersRef.current[loc.address] = marker;
            bounds.extend([loc.wgs84.lat, loc.wgs84.lng]);
        });

        // Only fit bounds on data change
        if (locations.length > 0) {
            mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 21 });
        } else {
            mapRef.current.setView([center.lat, center.lng], 20);
        }

    }, [locations, center]); // Removing selectedLocationId from here prevents re-zoom on click

    // 2. Handle Selection Changes (Styling Only)
    // This runs when the user clicks, updating styles without resetting the view.
    useEffect(() => {
        Object.entries(markersRef.current).forEach(([address, marker]) => {
            const circleMarker = marker as L.CircleMarker;
            const isSelected = address === selectedLocationId;

            if (isSelected) {
                circleMarker.setStyle({
                    color: '#334155', // Dark Slate border
                    weight: 3,
                    stroke: true
                });
                circleMarker.bringToFront();
                // Ensure popup is open if we selected via list
                if (!circleMarker.isPopupOpen()) {
                    // We construct popup content in creation, but bindPopup makes it available.
                    // If selected via list, we might want to open it.
                    // The data logic is inside the closure of creation, so simple openPopup works if bound.
                     circleMarker.openPopup();
                }
            } else {
                circleMarker.setStyle({
                    color: 'transparent',
                    weight: 0,
                    stroke: false
                });
            }
        });
    }, [selectedLocationId]);

    return <div ref={containerRef} className="w-full h-full z-0" />;
};

export default MapComponent;