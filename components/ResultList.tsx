
import React, { useEffect } from 'react';
import { GroupedLocation, PermitRecord } from '../types';

interface ResultListProps {
    locations: GroupedLocation[];
    onSelect: (location: GroupedLocation) => void;
    selectedLocationId?: string;
    isLoading?: boolean;
    loadingStatus?: string;
    isMobileCollapsed?: boolean;
    onToggleMobileCollapse?: () => void;
    hasActiveAlert?: boolean;
    onAlertClick?: () => void;
}

const ResultList: React.FC<ResultListProps> = ({ 
    locations, 
    onSelect, 
    selectedLocationId, 
    isLoading = false, 
    loadingStatus = "",
    isMobileCollapsed = false,
    onToggleMobileCollapse,
    hasActiveAlert = false,
    onAlertClick
}) => {
    
    // Define the range of years we track (Descending order: 2025 on left)
    const yearsRange = [2025, 2024, 2023, 2022, 2021];

    // Auto-scroll to selected item
    useEffect(() => {
        if (selectedLocationId && !isMobileCollapsed) {
            const element = document.getElementById(`loc-${selectedLocationId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [selectedLocationId, isMobileCollapsed]);

    // Loading State
    if (isLoading && locations.length === 0) {
        return (
            <div className="flex flex-col h-full bg-white">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <h2 className="font-bold text-lg text-slate-900">Zoeken...</h2>
                     <span className="flex h-2 w-2 relative ml-auto">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                </div>
                <div className="p-8 flex flex-col items-center justify-center flex-1">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-4"></div>
                    <p className="text-slate-600 font-medium">Zoeken naar vergunningen...</p>
                    {loadingStatus && <p className="text-slate-400 text-sm mt-1">Jaargang {loadingStatus}</p>}
                </div>
            </div>
        );
    }

    // No Results State
    if (!isLoading && locations.length === 0) {
        return (
            <div className="flex flex-col h-full bg-white">
                 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-bold text-lg text-slate-900">0 adressen gevonden</h2>
                     {/* Mobile Toggle for No Results too, in case user wants to see map */}
                     {onToggleMobileCollapse && (
                        <button onClick={onToggleMobileCollapse} className="md:hidden p-1">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isMobileCollapsed ? 'rotate-180' : ''}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                    )}
                </div>
                <div className="p-8 text-center text-slate-500 flex-1 flex flex-col items-center justify-center">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                        </svg>
                    </div>
                    <p className="font-medium text-slate-700">Geen vergunningen gevonden</p>
                    <p className="text-xs text-slate-400 mt-1">Binnen 200m straal</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-white flex flex-col overflow-hidden">
            
            {/* Header - Clickable on mobile to toggle */}
            <div 
                className="flex-none bg-white border-b border-slate-100 px-6 h-14 z-10 flex items-center justify-between shadow-sm cursor-pointer md:cursor-default"
                onClick={onToggleMobileCollapse}
            >
                <div className="flex items-center gap-3">
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

                <div className="flex items-center gap-3">
                    {/* Alert Bell Icon */}
                    {onAlertClick && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent mobile collapse toggle
                                onAlertClick();
                            }}
                            className={`p-2 rounded-full transition-all duration-200 focus:outline-none ${
                                hasActiveAlert 
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                            title={hasActiveAlert ? "Meldingen beheren" : "Melding instellen"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={hasActiveAlert ? "currentColor" : "none"} strokeWidth={hasActiveAlert ? 0 : 2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                        </button>
                    )}

                    {/* Mobile Collapse Toggle Icon */}
                    {onToggleMobileCollapse && (
                        <button 
                            className="md:hidden p-2 -mr-2 text-slate-500 hover:text-slate-800 focus:outline-none"
                            aria-label={isMobileCollapsed ? "Lijst uitklappen" : "Lijst inklappen"}
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform duration-300 ${isMobileCollapsed ? 'rotate-180' : ''}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* List Content */}
            <ul className="flex-1 overflow-y-auto divide-y divide-slate-100 pb-20">
                {locations.map((loc) => {
                    const isSelected = selectedLocationId === loc.address;
                    
                    // Create a map for quick permit lookup by year
                    const permitsByYear = new Map<string, PermitRecord>();
                    loc.permits.forEach(p => {
                        permitsByYear.set(p.date.substring(0, 4), p);
                    });

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
                                 <h3 className={`font-medium text-sm md:text-base leading-tight break-words ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-900'}`}>
                                    {loc.address}
                                 </h3>
                            </div>
                           
                            {/* Timeline Row */}
                            <div className="flex items-center gap-1">
                                {yearsRange.map(year => {
                                    const yearStr = year.toString();
                                    const permit = permitsByYear.get(yearStr);
                                    const isActiveYear = year === 2025;

                                    if (permit) {
                                        return (
                                            <a 
                                                key={year} 
                                                href={permit.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()} // Prevent selecting the row when clicking the link
                                                className={`text-[10px] w-9 py-0.5 text-center rounded font-bold shadow-sm border leading-none transition-all hover:ring-1 hover:ring-inset ${
                                                    isActiveYear 
                                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:ring-emerald-400'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-slate-400 hover:ring-slate-400'
                                                }`}
                                                title={`Bekijk vergunning ${year}`}
                                            >
                                                {year}
                                            </a>
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
