import React, { useState, useEffect, useRef } from 'react';
import { AddressResult } from '../types';
import { searchAddress, lookupAddress } from '../services/apiService';

// Force Update: 1722424800000

interface AddressSearchProps { onAddressSelect: (address: AddressResult) => void; isCompact?: boolean; initialValue?: string; onClear?: () => void; }

const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect, isCompact = false, initialValue = '', onClear }) => {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setQuery(initialValue); }, [initialValue]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 3 && query !== initialValue) {
                setIsLoading(true);
                const results = await searchAddress(query);
                setSuggestions(results);
                setFocusedIndex(-1);
                setIsOpen(true);
                setIsLoading(false);
            } else { setIsOpen(false); }
        }, 300);
        return () => clearTimeout(timer);
    }, [query, initialValue]);
    
    const handleSelect = async (item: AddressResult) => {
        setQuery(item.weergavenaam); setIsOpen(false); setFocusedIndex(-1);
        const fullDetails = await lookupAddress(item.id);
        if (fullDetails) onAddressSelect(fullDetails);
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
                <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type een adres in Amsterdam..." className={`w-full h-full bg-transparent outline-none text-slate-900 placeholder-slate-400 ${isCompact ? 'px-3 text-sm' : 'px-6 text-lg'}`} autoComplete="off" />
                {onClear && query ? (
                    <button type="button" onClick={handleClear} className="bg-slate-100 hover:bg-slate-200 w-10 flex items-center justify-center"><div className="rounded-full p-1 border border-slate-900"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-slate-900"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg></div></button>
                ) : (
                    <button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold px-6 flex items-center justify-center"><svg className={`animate-spin h-5 w-5 ${isLoading ? '' : 'hidden'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className={isLoading ? 'hidden' : ''}>Zoek</span></button>
                )}
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-72 overflow-y-auto z-[4000]">
                    <ul className="divide-y divide-slate-50">{suggestions.map((item, index) => <li key={item.id} onClick={() => handleSelect(item)} className={`px-4 py-3 cursor-pointer ${index === focusedIndex ? 'bg-red-50' : 'hover:bg-red-50'}`}>{item.weergavenaam}</li>)}</ul>
                </div>
            )}
        </div>
    );
};
export default AddressSearch;
