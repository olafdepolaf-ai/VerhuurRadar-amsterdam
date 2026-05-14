import React from 'react';

type IconProps = { className?: string };

export const AmsterdamHeartIcon = ({ className }: IconProps) => (
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

export const VerhuurRadarIcon = ({ className }: IconProps) => (
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

export const BellActiveIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6c0-1.5 1-2.5 2.5-3" stroke="currentColor" fill="none" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 6c0-1.5-1-2.5-2.5-3" stroke="currentColor" fill="none" />
        <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0c-1.67-.25-3.287-.67-4.83-1.24a.75.75 0 01-.298-1.206A8.21 8.21 0 005.25 9.75V9zM12 21a2.25 2.25 0 002.24-1.956 25.057 25.057 0 01-4.48 0A2.25 2.25 0 0012 21z" clipRule="evenodd" />
    </svg>
);

export const BellInactiveIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.75a8.967 8.967 0 01-2.312-6.022m-5.454 0A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

export const ChevronDownIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

export const UserIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

export const ProfileMenuIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

export const FunnelIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
);

export const LogoutIcon = ({ className }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);
