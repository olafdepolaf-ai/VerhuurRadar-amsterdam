import React, { useEffect } from 'react';
import { GroupedLocation, PermitStatus } from '../types';

interface ResultListProps {
    locations: GroupedLocation[];
    onSelect: (location: GroupedLocation) => void;
    selectedLocationId?: string;
    isLoading?: boolean;
    loadingStatus?: string;
}

const ResultList: React.FC<ResultListProps> = ({ locations, onSelect, selectedLocationId, isLoading = false, loadingStatus = "" }) => {
    
    // Define the range of years we track
    const yearsRange = [2020, 2021, 2022, 2023, 2024, 2025];

    // Auto-scroll to selected item
    useEffect(() => {
        if (selectedLocationId) {
            // Escape special characters for ID usage if necessary, but address usually works if simple
            // Using a simpler approach: finding by data attribute or id
            const element = document.getElementById(`loc-${selectedLocationId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [selectedLocationId]);

    if (isLoading && locations.length === 0) {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-4"></div>
                <p className="text-slate-600 font-medium">Zoeken naar vergunningen...</p>
                {loadingStatus && <p className="text-slate-400 text-sm mt-1">Jaargang {loadingStatus}</p>}
            </div>
        );
    }

    if (!isLoading && locations.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                </div>
                <p className="font-medium text-slate-700">Geen vergunningen gevonden</p>
                <p className="text-xs text-slate-400 mt-1">Binnen 200m straal</p>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto h-full bg-white flex flex-col">
            
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 z-10 flex items-center gap-3 shadow-sm">
                <h2 className="font-bold text-lg text-slate-900">
                    {locations.length} adressen gevonden
                </h2>
                {isLoading && (
                        <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                )}
            </div>
            <ul className="divide-y divide-slate-100 pb-20">
                {locations.map((loc) => {
                    const isSelected = selectedLocationId === loc.address;
                    
                    // Set of years for this location for O(1) lookup
                    const permitYears = new Set(loc.permits.map(p => p.date.substring(0, 4)));

                    return (
                        <li 
                            key={loc.address}
                            id={`loc-${loc.address}`}
                            onClick={() => onSelect(loc)}
                            className={`px-6 py-4 cursor-pointer transition-colors hover:bg-slate-50 flex flex-col gap-2 border-l-4 ${
                                isSelected 
                                    ? 'bg-slate-100 border-slate-600' // Dark Gray border, Light Gray BG
                                    : 'border-transparent'
                            }`}
                        >
                            {/* Address Row */}
                            <div className="min-w-0">
                                 <h3 className={`font-medium text-sm md:text-base truncate leading-tight ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-900'}`}>
                                    {loc.address}
                                 </h3>
                            </div>
                           
                            {/* Timeline Row */}
                            <div className="flex items-center gap-1">
                                {yearsRange.map(year => {
                                    const yearStr = year.toString();
                                    const hasPermit = permitYears.has(yearStr);
                                    const isActiveYear = year === 2025;

                                    if (hasPermit) {
                                        return (
                                            <span 
                                                key={year} 
                                                className={`text-[10px] w-9 py-0.5 text-center rounded font-bold shadow-sm border leading-none ${
                                                    isActiveYear 
                                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                {year}
                                            </span>
                                        );
                                    } else {
                                        // White box with gray border placeholder (no text)
                                        return (
                                            <span 
                                                key={year} 
                                                className="block w-9 h-4 border border-slate-300 bg-white rounded"
                                                aria-hidden="true"
                                            />
                                        );
                                    }
                                })}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ResultList;