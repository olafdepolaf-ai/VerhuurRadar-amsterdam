import React from 'react';
import { PermitRecord } from '../types';

interface StatsWidgetProps {
    permits: PermitRecord[];
}

const StatsWidget: React.FC<StatsWidgetProps> = ({ permits }) => {
    const currentYear = 2025;
    const activePermits = permits.filter(p => p.date.startsWith(currentYear.toString())).length;
    const lastYearPermits = permits.filter(p => p.date.startsWith((currentYear - 1).toString())).length;

    // Determine trend
    // Decrease is good (Green), Increase is bad (Red)
    const isDecreasing = activePermits < lastYearPermits;
    const isStable = activePermits === lastYearPermits;

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-3 flex items-center gap-3">
            <div>
                <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Trend</div>
                <div className="flex items-center gap-1">
                    {isStable ? (
                        <span className="text-sm font-bold text-slate-500 flex items-center">
                            - Stabiel
                        </span>
                    ) : isDecreasing ? (
                        <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" transform="rotate(180 10 10)" />
                            </svg>
                            Dalend
                        </span>
                    ) : (
                        <span className="text-sm font-bold text-rose-600 flex items-center gap-1">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                            </svg>
                            Stijgend
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsWidget;