
import React, { useState } from 'react';
import { PermitRecord } from '../types';

interface StatsWidgetProps {
    permits: PermitRecord[];
}

const StatsWidget: React.FC<StatsWidgetProps> = ({ permits }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Years to track
    const years = [2025, 2024, 2023, 2022, 2021];

    // Calculate counts per year
    const counts = years.reduce((acc, year) => {
        acc[year] = permits.filter(p => p.date.startsWith(year.toString())).length;
        return acc;
    }, {} as Record<number, number>);

    const activePermits = counts[2025];
    const lastYearPermits = counts[2024];

    // Determine trend
    const isDecreasing = activePermits < lastYearPermits;
    const isStable = activePermits === lastYearPermits;

    return (
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 w-auto min-w-[140px]">
            {/* Header / Toggle */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 flex items-center justify-between gap-3 focus:outline-none hover:bg-slate-50 transition-colors"
                title={isOpen ? "Details verbergen" : "Details tonen"}
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-500">Trend:</span>
                    
                    {isStable ? (
                        <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                            Stabiel
                            <span className="text-slate-900 font-bold">-</span>
                        </span>
                    ) : isDecreasing ? (
                        <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                            Dalend
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-900">
                                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" transform="rotate(180 10 10)" />
                            </svg>
                        </span>
                    ) : (
                        <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                            Stijgend
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-900">
                                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                            </svg>
                        </span>
                    )}
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

            {/* Expandable Table */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 border-t border-slate-100' : 'max-h-0'}`}>
                <div className="p-3 bg-white">
                    <table className="w-full text-xs">
                        <tbody>
                            {years.map(year => (
                                <tr key={year} className="border-b border-slate-50 last:border-0">
                                    <td className="py-1 text-slate-500 font-medium">{year}</td>
                                    <td className="py-1 text-right font-bold text-slate-800">
                                        {counts[year]} <span className="text-[10px] font-normal text-slate-400 ml-1">vergunningen</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StatsWidget;
