import React, { useEffect, useState, useRef } from 'react';
import { GroupedLocation, PermitRecord } from '../types';
import { PERMIT_YEARS } from '../constants';


interface ResultListProps { locations: GroupedLocation[]; onSelect: (id: string) => void; selectedLocationId?: string; isLoading?: boolean; loadingStatus?: string; isMobileCollapsed?: boolean; onToggleMobileCollapse?: () => void; hasActiveAlert?: boolean; onAlertClick?: () => void; searchedAddress?: string; }

const ResultList: React.FC<ResultListProps> = ({ locations, onSelect, selectedLocationId, isLoading = false, loadingStatus = "", isMobileCollapsed = false, onToggleMobileCollapse, hasActiveAlert = false, onAlertClick, searchedAddress }) => {
    const [isRinging, setIsRinging] = useState(false);
    const prevActiveRef = useRef(hasActiveAlert);

    useEffect(() => {
        if (!prevActiveRef.current && hasActiveAlert) { setIsRinging(true); const timer = setTimeout(() => setIsRinging(false), 800); return () => clearTimeout(timer); }
        prevActiveRef.current = hasActiveAlert;
    }, [hasActiveAlert]);

    useEffect(() => {
        if (selectedLocationId) { document.getElementById(`loc-${selectedLocationId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }, [selectedLocationId]);

    if (isLoading && locations.length === 0) return (
        <div className="h-full bg-white/80 flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4"></div>
            <div className="text-slate-500 font-medium">Resultaten laden...</div>
        </div>
    );

    // Sort locations: searchedAddress first, then alphabetically
    const sortedLocations = [...locations].sort((a, b) => {
        if (searchedAddress) {
            if (a.address === searchedAddress) return -1;
            if (b.address === searchedAddress) return 1;
        }
        return a.address.localeCompare(b.address);
    });

    return (
        <div className="h-full bg-white/80 backdrop-blur-sm flex flex-col">
            <style>{`@keyframes icon-pop { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.4); opacity: 1; } 70% { transform: scale(0.9); } 100% { transform: scale(1); } } .animate-icon-pop { animation: icon-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }`}</style>
            <div className="flex-none bg-white/90 border-b border-slate-200 px-6 h-14 flex items-center justify-between" onClick={onToggleMobileCollapse}>
                <h2 className="font-bold text-lg">{locations.length} adressen gevonden</h2>
                <div className="flex items-center gap-3">
                    {onAlertClick && <button onClick={e => { e.stopPropagation(); onAlertClick(); }} className={`p-2 rounded-full ${hasActiveAlert ? 'bg-slate-200 shadow-inner' : 'hover:bg-slate-50'}`}><div className={isRinging ? 'animate-icon-pop' : ''}>{hasActiveAlert ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-800"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6c0-1.5 1-2.5 2.5-3" stroke="currentColor" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 6c0-1.5-1-2.5-2.5-3" stroke="currentColor" fill="none"/><path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0c-1.67-.25-3.287-.67-4.83-1.24a.75.75 0 01-.298-1.206A8.21 8.21 0 005.25 9.75V9zM12 21a2.25 2.25 0 002.24-1.956 25.057 25.057 0 01-4.48 0A2.25 2.25 0 0012 21z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.75a8.967 8.967 0 01-2.312-6.022m-5.454 0A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>}</div></button>}
                    {onToggleMobileCollapse && <button className="md:hidden p-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${isMobileCollapsed ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></button>}
                </div>
            </div>
            <ul className="flex-1 overflow-y-auto divide-y divide-slate-200">
                {sortedLocations.map(loc => {
                    const permitsByYear = new Map<string, PermitRecord>(loc.permits.map(p => [p.date.substring(0, 4), p]));
                    const isSearched = searchedAddress && loc.address === searchedAddress;
                    const isSelected = selectedLocationId === loc.address;
                    
                    let rowClasses = 'border-l-transparent hover:bg-slate-200/40';
                    if (isSearched && isSelected) {
                        rowClasses = 'bg-blue-100 border-blue-600';
                    } else if (isSearched) {
                        rowClasses = 'bg-blue-50 border-blue-400 hover:bg-blue-100';
                    } else if (isSelected) {
                        rowClasses = 'bg-slate-100 border-slate-600';
                    }

                    return (
                        <li key={loc.address} id={`loc-${loc.address}`} onClick={() => onSelect(loc.address)} className={`px-6 py-4 cursor-pointer border-l-4 ${rowClasses}`}>
                            <h3 className="font-medium break-words">{loc.address}</h3>
                            <div className="flex items-center gap-1 mt-2">
                                {PERMIT_YEARS.map(year => {
                                    const permit = permitsByYear.get(String(year));
                                    return permit ? <a key={year} href={permit.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className={`text-[10px] w-9 py-0.5 text-center rounded font-bold border hover:ring-1 ${year === 2026 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{year}</a> : <span key={year} className="block w-9 h-4 border border-slate-300 bg-white rounded"/>
                                })}
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};
export default ResultList;