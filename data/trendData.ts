export interface TrendDataPoint {
    m: string;
    c: number;
}

const DUTCH_MONTHS = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
export const monthLabel = (year: number, month: number): string => `${DUTCH_MONTHS[month - 1]} ${year}`;

export const trendData: TrendDataPoint[] = [
    { m: 'Jan 2021', c: 0 },   { m: 'Feb 2021', c: 0 },   { m: 'Mrt 2021', c: 0 },
    { m: 'Apr 2021', c: 0 },   { m: 'Mei 2021', c: 0 },   { m: 'Jun 2021', c: 0 },
    { m: 'Jul 2021', c: 39 },  { m: 'Aug 2021', c: 175 },  { m: 'Sep 2021', c: 829 },
    { m: 'Okt 2021', c: 274 }, { m: 'Nov 2021', c: 385 },  { m: 'Dec 2021', c: 89 },

    { m: 'Jan 2022', c: 48 },  { m: 'Feb 2022', c: 134 },  { m: 'Mrt 2022', c: 331 },
    { m: 'Apr 2022', c: 815 }, { m: 'Mei 2022', c: 526 },  { m: 'Jun 2022', c: 454 },
    { m: 'Jul 2022', c: 538 }, { m: 'Aug 2022', c: 554 },  { m: 'Sep 2022', c: 244 },
    { m: 'Okt 2022', c: 199 }, { m: 'Nov 2022', c: 190 },  { m: 'Dec 2022', c: 189 },

    { m: 'Jan 2023', c: 213 }, { m: 'Feb 2023', c: 199 },  { m: 'Mrt 2023', c: 1012 },
    { m: 'Apr 2023', c: 1130 },{ m: 'Mei 2023', c: 418 },  { m: 'Jun 2023', c: 410 },
    { m: 'Jul 2023', c: 397 }, { m: 'Aug 2023', c: 498 },  { m: 'Sep 2023', c: 219 },
    { m: 'Okt 2023', c: 337 }, { m: 'Nov 2023', c: 189 },  { m: 'Dec 2023', c: 171 },

    { m: 'Jan 2024', c: 231 }, { m: 'Feb 2024', c: 260 },  { m: 'Mrt 2024', c: 387 },
    { m: 'Apr 2024', c: 608 }, { m: 'Mei 2024', c: 642 },  { m: 'Jun 2024', c: 1473 },
    { m: 'Jul 2024', c: 599 }, { m: 'Aug 2024', c: 298 },  { m: 'Sep 2024', c: 246 },
    { m: 'Okt 2024', c: 258 }, { m: 'Nov 2024', c: 204 },  { m: 'Dec 2024', c: 154 },

    { m: 'Jan 2025', c: 222 }, { m: 'Feb 2025', c: 303 },  { m: 'Mrt 2025', c: 1676 },
    { m: 'Apr 2025', c: 1035 },{ m: 'Mei 2025', c: 480 },  { m: 'Jun 2025', c: 406 },
    { m: 'Jul 2025', c: 418 }, { m: 'Aug 2025', c: 256 },  { m: 'Sep 2025', c: 226 },
    { m: 'Okt 2025', c: 213 }, { m: 'Nov 2025', c: 196 },  { m: 'Dec 2025', c: 170 },

    { m: 'Jan 2026', c: 195 }, { m: 'Feb 2026', c: 229 },  { m: 'Mrt 2026', c: 1720 },
    { m: 'Apr 2026', c: 1022 },{ m: 'Mei 2026', c: 57 },
];
