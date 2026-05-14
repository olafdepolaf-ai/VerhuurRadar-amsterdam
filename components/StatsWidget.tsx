import React, { useState } from 'react';
import { PermitRecord } from '../types';
import { PERMIT_YEARS } from '../constants';

interface StatsWidgetProps { permits: PermitRecord[]; }

const StatsWidget: React.FC<StatsWidgetProps> = ({ permits }) => {
    const [isOpen, setIsOpen] = useState(false);
    const counts = PERMIT_YEARS.reduce((acc, year) => ({ ...acc, [year]: permits.filter(p => p.date.startsWith(String(year))).length }), {} as Record<number, number>);
    const trend = counts[PERMIT_YEARS[0]] > counts[PERMIT_YEARS[1]] ? 'Stijgend' : counts[PERMIT_YEARS[0]] < counts[PERMIT_YEARS[1]] ? 'Dalend' : 'Stabiel';

    return (
        <div className="bg-white/85 backdrop-blur-sm rounded-xl border border-slate-200 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full px-3 py-2 flex items-center justify-between gap-3">
                <span className="text-sm font-bold"><span className="text-slate-500">Trend:</span> {trend}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
            </button>
            <div className={`transition-all ${isOpen ? 'max-h-48 border-t' : 'max-h-0'}`}>
                <div className="p-3"><table className="w-full text-xs"><tbody>{PERMIT_YEARS.map(year => <tr key={year}><td className="py-1 text-slate-500">{year}</td><td className="py-1 text-right font-bold">{counts[year]}</td></tr>)}</tbody></table></div>
            </div>
        </div>
    );
};
export default StatsWidget;
