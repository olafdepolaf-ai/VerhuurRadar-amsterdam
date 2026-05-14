import React, { useState } from 'react';

const trendData = [
  { m: 'Jan 2021', c: 0 }, { m: 'Feb 2021', c: 0 }, { m: 'Mrt 2021', c: 0 }, { m: 'Apr 2021', c: 0 }, { m: 'Mei 2021', c: 0 }, { m: 'Jun 2021', c: 0 },
  { m: 'Jul 2021', c: 39 }, { m: 'Aug 2021', c: 175 }, { m: 'Sep 2021', c: 829 }, { m: 'Okt 2021', c: 274 }, { m: 'Nov 2021', c: 385 }, { m: 'Dec 2021', c: 89 },
  
  { m: 'Jan 2022', c: 48 }, { m: 'Feb 2022', c: 134 }, { m: 'Mrt 2022', c: 331 }, { m: 'Apr 2022', c: 815 }, { m: 'Mei 2022', c: 526 }, { m: 'Jun 2022', c: 454 },
  { m: 'Jul 2022', c: 538 }, { m: 'Aug 2022', c: 554 }, { m: 'Sep 2022', c: 244 }, { m: 'Okt 2022', c: 199 }, { m: 'Nov 2022', c: 190 }, { m: 'Dec 2022', c: 189 },
  
  { m: 'Jan 2023', c: 213 }, { m: 'Feb 2023', c: 199 }, { m: 'Mrt 2023', c: 1012 }, { m: 'Apr 2023', c: 1130 }, { m: 'Mei 2023', c: 418 }, { m: 'Jun 2023', c: 410 },
  { m: 'Jul 2023', c: 397 }, { m: 'Aug 2023', c: 498 }, { m: 'Sep 2023', c: 219 }, { m: 'Okt 2023', c: 337 }, { m: 'Nov 2023', c: 189 }, { m: 'Dec 2023', c: 171 },
  
  { m: 'Jan 2024', c: 231 }, { m: 'Feb 2024', c: 260 }, { m: 'Mrt 2024', c: 387 }, { m: 'Apr 2024', c: 608 }, { m: 'Mei 2024', c: 642 }, { m: 'Jun 2024', c: 1473 },
  { m: 'Jul 2024', c: 599 }, { m: 'Aug 2024', c: 298 }, { m: 'Sep 2024', c: 246 }, { m: 'Okt 2024', c: 258 }, { m: 'Nov 2024', c: 204 }, { m: 'Dec 2024', c: 154 },
  
  { m: 'Jan 2025', c: 222 }, { m: 'Feb 2025', c: 303 }, { m: 'Mrt 2025', c: 1676 }, { m: 'Apr 2025', c: 1035 }, { m: 'Mei 2025', c: 480 }, { m: 'Jun 2025', c: 406 },
  { m: 'Jul 2025', c: 418 }, { m: 'Aug 2025', c: 256 }, { m: 'Sep 2025', c: 226 }, { m: 'Okt 2025', c: 213 }, { m: 'Nov 2025', c: 196 }, { m: 'Dec 2025', c: 170 },
  
  { m: 'Jan 2026', c: 195 }, { m: 'Feb 2026', c: 229 }, { m: 'Mrt 2026', c: 1720 }, { m: 'Apr 2026', c: 1022 }, { m: 'Mei 2026', c: 57 }
];

const TrendChart: React.FC = () => {
  const [hoveredData, setHoveredData] = useState<{ m: string, c: number } | null>(null);

  // We can filter out the initial months of 2021 that have 0 to make it cleaner,
  // or just show everything. Let's show from July 2021 since that's when data started.
  const displayData = trendData.slice(6);
  const maxCount = Math.max(...displayData.map(d => d.c));

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Vergunningen Trend</h3>
          <p className="text-sm text-slate-500">Aantal verleende vergunningen per maand</p>
        </div>
        <div className="text-right h-12 flex flex-col justify-end">
          {hoveredData ? (
            <>
              <span className="text-2xl font-bold text-red-600 leading-none">{hoveredData.c}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{hoveredData.m}</span>
            </>
          ) : (
            <span className="text-sm text-slate-300 italic">Beweeg over de grafiek</span>
          )}
        </div>
      </div>

      <div className="relative h-40 w-full flex items-end gap-[2px]">
        {/* Y-axis labels - optional, but nice for scale */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-300 pointer-events-none pb-6">
          <span>{maxCount}</span>
          <span>{Math.round(maxCount / 2)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="flex-1 h-full flex items-end gap-[2px] ml-8 border-b border-slate-100 pb-2 relative group">
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
                
                {/* Year label below January bars */}
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
