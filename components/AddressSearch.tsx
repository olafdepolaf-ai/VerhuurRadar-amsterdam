
import React, { useState, useEffect, useRef } from 'react';
import { AddressResult } from '../types';
import { searchAddress, lookupAddress } from '../services/apiService';

interface AddressSearchProps {
    onAddressSelect: (address: AddressResult) => void;
    isCompact?: boolean;
    initialValue?: string;
    onClear?: () => void;
}

const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect, isCompact = false, initialValue = '', onClear }) => {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [noResults, setNoResults] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1); // Track keyboard navigation
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

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
                setFocusedIndex(-1); // Reset focus on new results
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
                setFocusedIndex(-1);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, initialValue]);

    // Keyboard Navigation Handler
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        } else if (e.key === 'Enter') {
            if (focusedIndex >= 0 && suggestions[focusedIndex]) {
                e.preventDefault(); // Prevent form submit
                handleSelect(suggestions[focusedIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    // Auto-scroll to focused item
    useEffect(() => {
        if (focusedIndex >= 0 && listRef.current) {
            const listItems = listRef.current.children;
            if (listItems[focusedIndex]) {
                listItems[focusedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [focusedIndex]);

    const handleSelect = async (item: AddressResult) => {
        setQuery(item.weergavenaam);
        setIsOpen(false);
        setNoResults(false);
        setIsSelecting(true);
        setFocusedIndex(-1);
        
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

        // If suggestions exist but user didn't pick one, pick the first
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

    const handleClearInput = () => {
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
        if (onClear) {
            onClear();
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

    const showClearButton = onClear && query.length > 0;

    return (
        <div ref={wrapperRef} className={`relative w-full ${isCompact ? 'max-w-full' : 'max-w-2xl mx-auto'}`}>
            <form 
                onSubmit={handleManualSearch} 
                className={`flex w-full rounded-xl bg-white border border-slate-200 overflow-hidden transition-shadow focus-within:ring-4 focus-within:ring-red-500/20 ${isCompact ? 'h-10' : 'h-14'} ${isCompact ? 'shadow-none md:shadow-lg' : 'shadow-lg'}`}
            >
                <div className="flex-1 relative h-full">
                    <input
                        type="text"
                        className={`w-full h-full bg-transparent outline-none text-slate-900 placeholder-slate-400 ${isCompact ? 'px-3 text-sm' : 'px-6 text-lg'}`}
                        placeholder="Type een adres in Amsterdam..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (query.length >= 2 && !initialValue) setIsOpen(true);
                        }}
                        autoComplete="off"
                    />
                </div>
                
                {showClearButton ? (
                    <button 
                        type="button"
                        onClick={handleClearInput}
                        className={`bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors flex items-center justify-center ${isCompact ? 'w-10 px-0' : 'w-14 px-0'}`}
                        title="Zoekopdracht wissen"
                    >
                        {/* New styling: Black border, black text, transparent background inside */}
                        <div className="rounded-full p-1 border border-slate-900 text-slate-900 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </div>
                    </button>
                ) : (
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
                )}
            </form>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-72 overflow-y-auto overflow-x-hidden z-[100]">
                    {suggestions.length > 0 ? (
                        <ul ref={listRef} className="divide-y divide-slate-50">
                            {suggestions.map((item, index) => (
                                <li 
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className={`px-6 py-3 cursor-pointer text-slate-700 transition-colors text-left flex items-center gap-3 group ${
                                        index === focusedIndex ? 'bg-red-50' : 'hover:bg-red-50'
                                    }`}
                                >
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
