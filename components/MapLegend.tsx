
import React, { useState, useEffect } from 'react';

const MapLegend: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        // Default to closed on mobile (< 768px), open on desktop/tablet
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsOpen(false);
        }
    }, []);

    return (
        <div className="absolute bottom-6 left-4 md:left-6 z-[999] pointer-events-auto shadow-xl rounded-lg transition-all duration-300">
            <div className={`bg-white/95 backdrop-blur border border-slate-200 rounded-lg overflow-hidden flex flex-col ${isOpen ? 'min-w-[160px]' : 'w-auto'}`}>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 hover:bg-slate-50 transition-colors focus:outline-none ${isOpen ? 'justify-between w-full px-4 py-3' : 'px-2 py-2'}`}
                    title={isOpen ? "Legenda inklappen" : "Legenda tonen"}
                >
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                        </svg>
                        {isOpen && <span>Legenda</span>}
                    </div>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor" 
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    >
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </button>

                <div className={`transition-all duration-300 ease-in-out origin-top ${isOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 w-0 overflow-hidden'}`}>
                    <div className={`px-4 pb-4 pt-1 flex flex-col gap-2 text-xs border-t border-slate-100 bg-white ${isOpen ? 'w-full' : 'w-0'}`}>
                         <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="w-3 h-3 rounded-full bg-[#ef4444] border border-white shadow-sm shrink-0"></span>
                            <span className="font-medium text-slate-600">Actief</span>
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="w-3 h-3 rounded-full bg-slate-400 border border-white shadow-sm shrink-0"></span>
                            <span className="font-medium text-slate-600">Inactief - 2021-2024</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapLegend;
