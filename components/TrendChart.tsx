import React, { useState, useEffect } from 'react';
import { trendData, TrendDataPoint, monthLabel } from '../data/trendData';
import { fetchPermitCountForMonth } from '../services/apiService';

interface TrendChartProps {
  totalActiveCount?: number | null;
}

const TrendChart: React.FC<TrendChartProps> = ({ totalActiveCount }) => {
  const [data, setData] = useState<TrendDataPoint[]>(trendData);
  const [hoveredData, setHoveredData] = useState<TrendDataPoint | null>(null);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const updateMonth = async (y: number, m: number) => {
      const count = await fetchPermitCountForMonth(y, m);
      const label = monthLabel(y, m);
      setData(prev => {
        const exists = prev.some(d => d.m === label);
        if (exists) return prev.map(d => d.m === label ? { ...d, c: count } : d);
        return [...prev, { m: label, c: count }];
      });
    };

    updateMonth(year, month);
    updateMonth(prevYear, prevMonth);
  }, []);

  const displayData = data.slice(6);
  const maxCount = Math.max(...displayData.map(d => d.c));

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-xl border border-slate-200 p-6 text-left">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Verleende vergunningen per maand</h3>
        </div>
        <div className="text-right min-w-[80px]">
          {hoveredData ? (
            <>
              <span className="text-2xl font-bold text-red-600 leading-none">{hoveredData.c.toLocaleString('nl-NL')}</span>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{hoveredData.m}</span>
            </>
          ) : totalActiveCount ? (
            <>
              <span className="text-2xl font-bold text-red-600 leading-none">{totalActiveCount.toLocaleString('nl-NL')}</span>
              <span className="block text-xs font-semibold text-slate-500 mt-1">actief vandaag</span>
            </>
          ) : null}
        </div>
      </div>

      <div className="relative h-40 w-full flex items-end gap-[2px]">
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-300 pointer-events-none pb-6">
          <span>{maxCount.toLocaleString('nl-NL')}</span>
          <span>{Math.round(maxCount / 2).toLocaleString('nl-NL')}</span>
          <span>0</span>
        </div>

        <div className="flex-1 h-full flex items-end gap-[2px] ml-8 border-b border-slate-100 pb-2 relative">
          {displayData.map((point, idx) => {
            const heightPercentage = (point.c / maxCount) * 100;
            const isYearStart = point.m.startsWith('Jan');
            return (
              <div
                key={idx}
                className="relative flex-1 flex flex-col justify-end items-center h-full group/bar"
                onMouseEnter={() => setHoveredData(point)}
                onMouseLeave={() => setHoveredData(null)}
              >
                <div
                  className="w-full bg-red-200 hover:bg-red-500 transition-colors rounded-t-sm"
                  style={{ height: `${heightPercentage}%`, minHeight: point.c > 0 ? '2px' : '0' }}
                />
                {isYearStart && (
                  <span className="absolute -bottom-6 text-[10px] font-semibold text-slate-400">
                    {point.m.split(' ')[1]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
