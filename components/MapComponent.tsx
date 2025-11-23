
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

    // Track selected ID in a ref to access it inside event handlers (mouseover/out) without re-binding
    const selectedLocationIdRef = useRef(selectedLocationId);
    useEffect(() => {
        selectedLocationIdRef.current = selectedLocationId;
    }, [selectedLocationId]);

    // Initialize Map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Default zoom 18
        mapRef.current = L.map(containerRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView([center.lat, center.lng], 18);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 22
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

        // Add User Location Marker (Sharper Pin, Red with White Dot)
        const pinSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" class="w-full h-full filter drop-shadow-md">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="3" fill="white" />
                <polygon points="12,24 9,15 15,15" fill="#dc2626"/>
            </svg>
        `;

        const userIcon = L.divIcon({
            className: 'bg-transparent border-0',
            html: pinSvg,
            iconSize: [40, 48], // Taller for the point
            iconAnchor: [20, 48] // Anchor exactly at the bottom tip
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
            
            // Colors: Lighter Red (#ef4444 / red-500) for Active to distinguish from User Pin, Gray (#94a3b8) for Inactive
            const fillColor = isActive ? '#ef4444' : '#94a3b8';
            
            // Borders: White border for EVERYONE now (better contrast)
            const strokeColor = '#ffffff';
            const weight = 1;

            const marker = L.circleMarker([loc.wgs84.lat, loc.wgs84.lng], {
                radius: 5,
                fillColor: fillColor,
                color: strokeColor,
                weight: weight,
                stroke: true, 
                opacity: 1,
                fillOpacity: 1 // Solid fill
            });

            // Hover Effects
            marker.on('mouseover', function (this: L.CircleMarker) {
                this.setStyle({
                    color: '#334155', // Dark Slate border on hover
                    weight: 3
                });
                this.bringToFront();
            });

            marker.on('mouseout', function (this: L.CircleMarker) {
                // Check if this marker is currently selected
                // If selected, keep the selected style (Dark border)
                // If not, revert to default (White border)
                const isSelected = selectedLocationIdRef.current === loc.address;
                
                if (isSelected) {
                     this.setStyle({
                        color: '#334155', 
                        weight: 3
                    });
                } else {
                    this.setStyle({
                        color: '#ffffff',
                        weight: 1
                    });
                }
            });

            marker.on('click', () => {
                // Call the stable ref
                onMarkerClickRef.current(loc);
                
                const popupContent = `
                    <div class="font-sans">
                        <h3 class="font-bold text-sm mb-1">${loc.address}</h3>
                        <p class="text-xs ${isActive ? 'text-red-500 font-bold' : 'text-slate-500'}">
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
                    color: '#334155', // Dark Slate border for selection
                    weight: 3,
                    stroke: true
                });
                circleMarker.bringToFront();
                 if (!circleMarker.isPopupOpen()) {
                     circleMarker.openPopup();
                }
            } else {
                // Reset to default style
                // Both active and inactive now have white borders
                circleMarker.setStyle({
                    color: '#ffffff',
                    weight: 1,
                    stroke: true
                });
            }
        });
    }, [selectedLocationId]);

    return <div ref={containerRef} className="w-full h-full z-0" />;
};

export default MapComponent;
