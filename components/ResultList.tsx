import React from 'react';
import { GroupedLocation, PermitStatus } from '../types';

interface ResultListProps {
    locations: GroupedLocation[];
    onSelect: (location: GroupedLocation) => void;
    selectedLocationId?: string;
    isLoading?: boolean;
    loadingStatus?: string;
}

const ResultList: React.FC<ResultListProps> = ({ locations, onSelect, selectedLocationId, isLoading = false, loadingStatus = "" }) => {
    
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
            
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 z-10 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <h2 className="font-bold text-lg text-slate-800">Resultaten</h2>
                    {isLoading && (
                         <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                </div>
                <span className="text-xs font-semibold bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded-full">
                    {locations.length} adressen
                </span>
            </div>
            <ul className="divide-y divide-slate-100 pb-20">
                {locations.map((loc) => {
                    const isSelected = selectedLocationId === loc.address;
                    
                    // Extract unique years and sort descending (newest top)
                    const years = Array.from(new Set(loc.permits.map(p => p.date.substring(0, 4))))
                        .sort((a: string, b: string) => b.localeCompare(a));

                    return (
                        <li 
                            key={loc.address}
                            onClick={() => onSelect(loc)}
                            className={`px-6 py-4 cursor-pointer transition-colors hover:bg-slate-50 flex justify-between items-start gap-4 ${isSelected ? 'bg-red-50 hover:bg-red-50' : ''}`}
                        >
                            {/* Address Column */}
                            <div className="flex-1 min-w-0 pt-1">
                                 <h3 className="font-medium text-slate-900 text-sm md:text-base truncate leading-tight">{loc.address}</h3>
                            </div>
                           
                            {/* Years Column (Right Aligned, Stacked) */}
                            <div className="flex flex-col items-end gap-1.5 flex-none">
                                {years.length > 0 ? (
                                    years.map(year => {
                                        const isActiveYear = year === '2025';
                                        return (
                                            <span 
                                                key={year} 
                                                className={`text-[10px] px-2 py-0.5 rounded font-bold shadow-sm border leading-none ${
                                                    isActiveYear 
                                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200' // Keep functional green for status
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                {year}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span className="text-[10px] text-slate-400 italic">Geen data</span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ResultList;