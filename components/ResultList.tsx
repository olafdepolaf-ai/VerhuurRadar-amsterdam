import React, { useEffect, useState, useRef } from 'react';
import { GroupedLocation, PermitRecord } from '../types';
import { PERMIT_YEARS, ACTIVE_YEAR } from '../constants';
import { BellActiveIcon, BellInactiveIcon, ChevronDownIcon } from './Icons';

interface ResultListProps {
    locations: GroupedLocation[];
    onSelect: (id: string) => void;
    selectedLocationId?: string;
    isLoading?: boolean;
    loadingStatus?: string;
    isMobileCollapsed?: boolean;
    onToggleMobileCollapse?: () => void;
    hasActiveAlert?: boolean;
    onAlertClick?: () => void;
    searchedAddress?: string;
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
    onAlertClick,
    searchedAddress,
}) => {
    const [isRinging, setIsRinging] = useState(false);
    const prevActiveRef = useRef(hasActiveAlert);

    useEffect(() => {
        if (!prevActiveRef.current && hasActiveAlert) {
            setIsRinging(true);
            const timer = setTimeout(() => setIsRinging(false), 800);
            return () => clearTimeout(timer);
        }
        prevActiveRef.current = hasActiveAlert;
    }, [hasActiveAlert]);

    useEffect(() => {
        if (selectedLocationId) {
            document.getElementById(`loc-${selectedLocationId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedLocationId]);

    if (isLoading && locations.length === 0) return (
        <div className="h-full bg-white/80 flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4"></div>
            <div className="text-slate-500 font-medium">Resultaten laden...</div>
        </div>
    );

    const sortedLocations = [...locations].sort((a, b) => {
        if (searchedAddress) {
            if (a.address === searchedAddress) return -1;
            if (b.address === searchedAddress) return 1;
        }
        return a.address.localeCompare(b.address);
    });

    return (
        <div className="h-full bg-white/80 backdrop-blur-sm flex flex-col">
            <div
                className="flex-none bg-white/90 border-b border-slate-200 px-6 h-14 flex items-center justify-between"
                onClick={onToggleMobileCollapse}
            >
                <h2 className="font-bold text-lg">{locations.length} adressen gevonden</h2>
                <div className="flex items-center gap-3">
                    {onAlertClick && (
                        <button
                            onClick={e => { e.stopPropagation(); onAlertClick(); }}
                            className={`p-2 rounded-full ${hasActiveAlert ? 'bg-slate-200 shadow-inner' : 'hover:bg-slate-50'}`}
                        >
                            <div className={isRinging ? 'animate-icon-pop' : ''}>
                                {hasActiveAlert
                                    ? <BellActiveIcon className="w-5 h-5 text-slate-800" />
                                    : <BellInactiveIcon className="w-5 h-5 text-slate-500" />
                                }
                            </div>
                        </button>
                    )}
                    {onToggleMobileCollapse && (
                        <button className="md:hidden p-2">
                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${isMobileCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            <ul className="flex-1 overflow-y-auto divide-y divide-slate-200">
                {sortedLocations.map(loc => {
                    const permitsByYear = new Map<string, PermitRecord>(
                        loc.permits.map(p => [p.date.substring(0, 4), p])
                    );
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
                        <li
                            key={loc.address}
                            id={`loc-${loc.address}`}
                            onClick={() => onSelect(loc.address)}
                            className={`px-6 py-4 cursor-pointer border-l-4 ${rowClasses}`}
                        >
                            <h3 className="font-medium break-words">{loc.address}</h3>
                            <div className="flex items-center gap-1 mt-2">
                                {PERMIT_YEARS.map(year => {
                                    const permit = permitsByYear.get(String(year));
                                    return permit ? (
                                        <a
                                            key={year}
                                            href={permit.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className={`text-[10px] w-9 py-0.5 text-center rounded font-bold border hover:ring-1 ${year === ACTIVE_YEAR ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                                        >
                                            {year}
                                        </a>
                                    ) : (
                                        <span key={year} className="block w-9 h-4 border border-slate-300 bg-white rounded" />
                                    );
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
