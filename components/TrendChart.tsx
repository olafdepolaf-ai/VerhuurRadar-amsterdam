import React, { useState } from 'react';
import { trendData } from '../data/trendData';

interface TrendChartProps {
  totalActiveCount?: number | null;
}

const TrendChart: React.FC<TrendChartProps> = ({ totalActiveCount }) => {
  const [hoveredData, setHoveredData] = useState<{ m: string, c: number } | null>(null);

  const displayData = trendData.slice(6);
  const maxCount = Math.max(...displayData.map(d => d.c));

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-xl border border-slate-200 p-6 text-left">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Vergunningen Trend</h3>
          <p className="text-sm text-slate-500">Verleende vergunningen per maand</p>
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
          {displayData.map((data, idx) => {
            const heightPercentage = (data.c / maxCount) * 100;
            const isYearStart = data.m.startsWith('Jan');

            return (
              <div
                key={idx}
                className="relative flex-1 flex flex-col justify-end items-center h-full group/bar"
                onMouseEnter={() => setHoveredData(data)}
                onMouseLeave={() => setHoveredData(null)}
              >
                <div
                  className="w-full bg-red-200 hover:bg-red-500 transition-colors rounded-t-sm"
                  style={{ height: `${heightPercentage}%`, minHeight: data.c > 0 ? '2px' : '0' }}
                />
                {isYearStart && (
                  <span className="absolute -bottom-6 text-[10px] font-semibold text-slate-400">
                    {data.m.split(' ')[1]}
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
