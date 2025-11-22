import React, { useState, useEffect, useRef } from 'react';
import { AddressResult } from '../types';
import { searchAddress, lookupAddress } from '../services/apiService';

interface AddressSearchProps {
    onAddressSelect: (address: AddressResult) => void;
    isCompact?: boolean;
    initialValue?: string;
}

const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect, isCompact = false, initialValue = '' }) => {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Update query if initialValue changes externally
    useEffect(() => {
        if (initialValue) {
            setQuery(initialValue);
        }
    }, [initialValue]);

    // Debounce search for autocomplete
    useEffect(() => {
        const timer = setTimeout(async () => {
            // Only search if query is different from initialValue (avoid searching on mount/select)
            if (query.length >= 2 && query !== initialValue) {
                setIsLoading(true);
                setNoResults(false);
                const results = await searchAddress(query);
                setSuggestions(results);
                setIsLoading(false);
                
                if (results.length > 0) {
                    setIsOpen(true);
                } else {
                    setNoResults(query.length > 4);
                    setIsOpen(true);
                }
            } else {
                setSuggestions([]);
                setIsOpen(false);
                setNoResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, initialValue]);

    const handleSelect = async (item: AddressResult) => {
        setQuery(item.weergavenaam);
        setIsOpen(false);
        setNoResults(false);
        setIsSelecting(true);
        
        try {
            const fullDetails = await lookupAddress(item.id);
            if (fullDetails) {
                onAddressSelect(fullDetails);
            }
        } catch (e) {
            console.error("Selection failed", e);
        } finally {
            setIsSelecting(false);
        }
    };

    const handleManualSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (query.length < 3 || isSelecting) return;

        setIsOpen(false);
        setIsSelecting(true);

        try {
            let targetId = '';
            
            if (suggestions.length > 0) {
                targetId = suggestions[0].id;
                setQuery(suggestions[0].weergavenaam);
            } else {
                const results = await searchAddress(query);
                if (results.length > 0) {
                    targetId = results[0].id;
                    setQuery(results[0].weergavenaam);
                }
            }

            if (targetId) {
                const fullDetails = await lookupAddress(targetId);
                if (fullDetails) {
                    onAddressSelect(fullDetails);
                } else {
                     setNoResults(true);
                     setIsOpen(true);
                }
            } else {
                 setNoResults(true);
                 setIsOpen(true);
            }
        } catch(e) {
            console.error(e);
        } finally {
            setIsSelecting(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div ref={wrapperRef} className={`relative w-full ${isCompact ? 'max-w-full' : 'max-w-2xl mx-auto'}`}>
            <form onSubmit={handleManualSearch} className={`flex w-full rounded-xl shadow-lg bg-white border border-slate-200 overflow-hidden transition-shadow focus-within:ring-4 focus-within:ring-red-500/20 ${isCompact ? 'h-10' : 'h-14'}`}>
                <div className="flex-1 relative h-full">
                    <input
                        type="text"
                        className={`w-full h-full bg-transparent outline-none text-slate-900 placeholder-slate-400 ${isCompact ? 'px-3 text-sm' : 'px-6 text-lg'}`}
                        placeholder="Type een adres in Amsterdam..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            if (query.length >= 2 && !initialValue) setIsOpen(true);
                        }}
                        autoComplete="off"
                    />
                </div>
                
                <button 
                    type="submit"
                    disabled={query.length < 3 || isLoading || isSelecting}
                    className={`bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold transition-colors flex items-center justify-center px-6 ${isCompact ? 'text-sm px-4' : 'text-base'}`}
                >
                    {isLoading || isSelecting ? (
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                        'Zoek'
                    )}
                </button>
            </form>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-72 overflow-y-auto overflow-x-hidden z-[100]">
                    {suggestions.length > 0 ? (
                        <ul className="divide-y divide-slate-50">
                            {suggestions.map((item) => (
                                <li 
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className="px-6 py-3 hover:bg-red-50 cursor-pointer text-slate-700 transition-colors text-left flex items-center gap-3 group"
                                >
                                    <span className="bg-slate-100 group-hover:bg-white p-1.5 rounded text-slate-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <span className="flex-1 truncate">
                                        {item.weergavenaam}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : noResults ? (
                        <div className="p-4 text-center text-slate-500 text-sm">
                            Geen adres gevonden. Controleer de spelling of huisnummer.
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default AddressSearch;