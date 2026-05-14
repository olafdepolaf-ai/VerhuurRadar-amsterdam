import React, { useEffect, useState, useRef } from 'react';
import { GroupedLocation, MapFilters, PermitRecord } from '../types';
import { PERMIT_YEARS, ACTIVE_YEAR, MIN_SEARCH_RADIUS_M, MAX_SEARCH_RADIUS_M } from '../constants';
import { BellActiveIcon, BellInactiveIcon, ChevronDownIcon, FunnelIcon } from './Icons';

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
    filters?: MapFilters;
    onFiltersChange?: (filters: MapFilters) => void;
    searchRadius?: number;
    onRadiusChange?: (radius: number) => void;
    onRadiusSearch?: (radius: number) => void;
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
    filters,
    onFiltersChange,
    searchRadius,
    onRadiusChange,
    onRadiusSearch,
}) => {
    const [isRinging, setIsRinging] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const prevActiveRef = useRef(hasActiveAlert);
    const filterRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const isFiltered = filters && (!filters.showActive || !filters.showInactive || filters.showYears.length < PERMIT_YEARS.length);

    return (
        <div className="h-full bg-white/80 backdrop-blur-sm flex flex-col">
            <div
                className="flex-none bg-white/90 border-b border-slate-200 px-4 h-14 flex items-center justify-between"
                onClick={onToggleMobileCollapse}
            >
                <h2 className="font-bold text-lg whitespace-nowrap">{locations.length} adressen gevonden</h2>
                <div className="flex items-center gap-1">
                    {filters && onFiltersChange && (
                        <div ref={filterRef} className="relative">
                            <button
                                onClick={e => { e.stopPropagation(); setIsFilterOpen(prev => !prev); }}
                                className={`p-2 rounded-full relative ${isFiltered ? 'text-red-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                title="Filter"
                            >
                                <FunnelIcon className="w-5 h-5" />
                                {isFiltered && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
                                )}
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-[3000]">
                                    <div className="px-4 py-3">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Toon op kaart</p>
                                        <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filters.showActive}
                                                onChange={e => onFiltersChange({ ...filters, showActive: e.target.checked })}
                                                className="w-4 h-4 accent-red-600 cursor-pointer"
                                            />
                                            <span className="flex items-center gap-2 text-sm">
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#d75c2e] flex-shrink-0" />
                                                Actief
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filters.showInactive}
                                                onChange={e => onFiltersChange({ ...filters, showInactive: e.target.checked })}
                                                className="w-4 h-4 accent-red-600 cursor-pointer"
                                            />
                                            <span className="flex items-center gap-2 text-sm">
                                                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 flex-shrink-0" />
                                                Inactief
                                            </span>
                                        </label>
                                    </div>
                                    {filters && onFiltersChange && (
                                        <div className="px-4 py-3 border-t border-slate-100">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Jaren</p>
                                            {PERMIT_YEARS.map(year => (
                                                <label key={year} className="flex items-center gap-2.5 py-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.showYears.includes(year)}
                                                        onChange={e => {
                                                            const next = e.target.checked
                                                                ? [...filters.showYears, year]
                                                                : filters.showYears.filter(y => y !== year);
                                                            onFiltersChange({ ...filters, showYears: next });
                                                        }}
                                                        className="w-4 h-4 accent-red-600 cursor-pointer"
                                                    />
                                                    <span className="text-sm">{year}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {searchRadius !== undefined && onRadiusChange && onRadiusSearch && (
                                        <div className="px-4 py-3 border-t border-slate-100">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Zoekgebied</p>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-slate-600">Straal</span>
                                                <span className="text-sm font-bold text-slate-800">
                                                    {searchRadius >= 1000 ? `${searchRadius / 1000} km` : `${searchRadius} m`}
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={MIN_SEARCH_RADIUS_M}
                                                max={MAX_SEARCH_RADIUS_M}
                                                step={50}
                                                value={searchRadius}
                                                onChange={e => onRadiusChange(Number(e.target.value))}
                                                onMouseUp={e => onRadiusSearch(Number((e.target as HTMLInputElement).value))}
                                                onTouchEnd={e => onRadiusSearch(Number((e.currentTarget as HTMLInputElement).value))}
                                                className="w-full accent-red-600 cursor-pointer"
                                            />
                                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                                <span>50 m</span>
                                                <span>5 km</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
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
                                {PERMIT_YEARS.filter(year => !filters || filters.showYears.includes(year)).map(year => {
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
