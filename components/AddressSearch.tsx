import React, { useState, useEffect, useRef } from 'react';
import { AddressResult } from '../types';
import { searchAddress, lookupAddress, resolvePostcode6, resolvePostcode4 } from '../services/apiService';

// Force Update: 1722424800000

interface AddressSearchProps { onAddressSelect: (address: AddressResult) => void; isCompact?: boolean; initialValue?: string; onClear?: () => void; onUseLocation?: () => void; }

const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect, isCompact = false, initialValue = '', onClear, onUseLocation }) => {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [showLocationOption, setShowLocationOption] = useState(false);

    useEffect(() => { setQuery(initialValue); }, [initialValue]);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            const q = query.trim();
            if (q === initialValue) { setIsOpen(false); return; }

            const pc4 = /^\d{4}$/.test(q);
            const pc6 = /^\d{4}\s*[A-Z]{2}$/i.test(q);

            if (pc4 || pc6) {
                setIsLoading(true);
                const result = pc6 ? await resolvePostcode6(q) : await resolvePostcode4(q);
                setSuggestions(result ? [result] : []);
                setIsOpen(!!result);
                setFocusedIndex(-1);
                setIsLoading(false);
            } else if (q.length >= 3) {
                setIsLoading(true);
                try {
                    const results = await searchAddress(q);
                    setSuggestions(results);
                    setFocusedIndex(-1);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, initialValue]);

    useEffect(() => {
        // Show location option if input is empty but focused
        const el = inputRef.current;
        const handleFocus = () => { if (!query) setShowLocationOption(true); };
        const handleBlur = () => { setTimeout(() => setShowLocationOption(false), 200); }; // Delay to allow click

        if (el && onUseLocation) {
            el.addEventListener('focus', handleFocus);
            el.addEventListener('blur', handleBlur);
        }
        return () => {
            if (el && onUseLocation) {
                el.removeEventListener('focus', handleFocus);
                el.removeEventListener('blur', handleBlur);
            }
        };
    }, [query, onUseLocation]);

    const handleSelect = async (item: AddressResult) => {
        setQuery(item.weergavenaam); setIsOpen(false); setFocusedIndex(-1);
        if (item.centroide_rd && item.centroide_ll) {
            onAddressSelect(item);
        } else {
            const fullDetails = await lookupAddress(item.id);
            if (fullDetails) onAddressSelect(fullDetails);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || suggestions.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1)); }
        else if (e.key === 'Enter' && focusedIndex >= 0) { e.preventDefault(); handleSelect(suggestions[focusedIndex]); }
        else if (e.key === 'Escape') { setIsOpen(false); }
    };

    const handleClear = () => { setQuery(''); if (onClear) onClear(); inputRef.current?.focus(); };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className={`relative w-full ${isCompact ? '' : 'max-w-2xl mx-auto'}`}>
            <div className={`flex w-full rounded-xl bg-white border border-slate-200 overflow-hidden ${isCompact ? 'h-10 shadow-none' : 'h-14 shadow-lg'}`}>
                <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Zoeken op adres of postcode" className={`w-full h-full bg-transparent outline-none text-slate-900 placeholder-slate-400 ${isCompact ? 'px-3 text-sm' : 'px-6 text-lg'}`} autoComplete="off" />
                {onClear && query ? (
                    <button type="button" onClick={handleClear} className="bg-slate-100 hover:bg-slate-200 w-10 flex items-center justify-center"><div className="rounded-full p-1 border border-slate-900"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-slate-900"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg></div></button>
                ) : (
                    <button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold px-6 flex items-center justify-center"><svg className={`animate-spin h-5 w-5 ${isLoading ? '' : 'hidden'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className={isLoading ? 'hidden' : ''}>Zoek</span></button>
                )}
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-72 overflow-y-auto z-[4000]">
                    <ul className="divide-y divide-slate-50">
                        {suggestions.map((item, index) => <li key={item.id} onClick={() => handleSelect(item)} className={`px-4 py-3 cursor-pointer text-left ${index === focusedIndex ? 'bg-red-50' : 'hover:bg-red-50'}`}>{item.weergavenaam}</li>)}
                    </ul>
                </div>
            )}
            {showLocationOption && !isOpen && onUseLocation && !query && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[4000]">
                    <div onClick={() => { if (onUseLocation) onUseLocation(); setShowLocationOption(false); }} className="px-4 py-3 cursor-pointer text-left hover:bg-slate-50 flex items-center gap-3 text-red-600 font-medium transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        Gebruik mijn huidige locatie
                    </div>
                </div>
            )}
        </div>
    );
};
export default AddressSearch;
