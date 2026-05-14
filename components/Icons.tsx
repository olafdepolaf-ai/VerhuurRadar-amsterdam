import React from 'react';

export const AmsterdamHeartIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className}>
        <defs>
            <clipPath id="h">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </clipPath>
        </defs>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#d75c2e" />
        <rect x="0" y="8.5" width="24" height="7" fill="black" clipPath="url(#h)" />
        <path d="M6 10.5L9 13.5M9 10.5L6 13.5" stroke="white" strokeWidth="1.5" />
        <path d="M10.5 10.5L13.5 13.5M13.5 10.5L10.5 13.5" stroke="white" strokeWidth="1.5" />
        <path d="M15 10.5L18 13.5M18 10.5L15 13.5" stroke="white" strokeWidth="1.5" />
    </svg>
);

export const VerhuurRadarIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" className="fill-red-600" />
        <circle cx="50" cy="50" r="38" className="stroke-white/20" strokeWidth="4" />
        <circle cx="50" cy="50" r="26" className="stroke-white/30" strokeWidth="4" />
        <circle cx="50" cy="50" r="14" className="stroke-white/40" strokeWidth="4" />
        <line x1="50" y1="50" x2="82" y2="18" className="stroke-white" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="50" r="5" className="fill-white" />
        <g transform="translate(0, 5)">
            <path d="M22 85V68l8-8 8 8v17H22z" className="fill-white" />
            <rect x="25" y="72" width="3" height="4" className="fill-red-600" />
            <rect x="31" y="72" width="3" height="4" className="fill-red-600" />
            <path d="M40 85V62l10-10 10 10v23H40z" className="fill-white" />
            <rect x="44" y="65" width="3" height="4" className="fill-red-600" />
            <rect x="53" y="65" width="3" height="4" className="fill-red-600" />
            <rect x="44" y="73" width="3" height="4" className="fill-red-600" />
            <rect x="53" y="73" width="3" height="4" className="fill-red-600" />
            <path d="M62 85V68l8-8 8 8v17H62z" className="fill-white" />
            <rect x="65" y="72" width="3" height="4" className="fill-red-600" />
            <rect x="71" y="72" width="3" height="4" className="fill-red-600" />
        </g>
    </svg>
);
