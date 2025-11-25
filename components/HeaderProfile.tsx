
import React, { useState, useRef, useEffect } from 'react';

interface HeaderProfileProps {
    isLoggedIn: boolean;
    onLogin: () => void;
    onLogout: () => void;
    onShowAlerts: () => void;
    onShowProfile: () => void;
}

const HeaderProfile: React.FC<HeaderProfileProps> = ({ isLoggedIn, onLogin, onLogout, onShowAlerts, onShowProfile }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const userPhotoUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const handleMenuClick = (action: () => void) => {
        setIsOpen(false);
        action();
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center focus:outline-none transition-opacity hover:opacity-80"
                title={isLoggedIn ? "Account opties" : "Inloggen"}
            >
                {isLoggedIn ? (
                    <img 
                        src={userPhotoUrl} 
                        alt="Profiel" 
                        className="w-10 h-10 rounded-full border-2 border-slate-200 shadow-sm object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
                
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-slate-400 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[2500] animate-fade-in-up">
                    <ul className="py-2">
                        {isLoggedIn ? (
                            <>
                                <li>
                                    <button onClick={() => handleMenuClick(onShowAlerts)} className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                                        <span className="font-medium">Beheer alerts</span>
                                    </button>
                                </li>
                                <div className="border-t border-slate-100 my-1 mx-2"></div>
                                <li>
                                    <button onClick={() => handleMenuClick(onShowProfile)} className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                        <span className="font-medium">Mijn profiel</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => handleMenuClick(onLogout)} className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                                        <span className="font-medium">Uitloggen</span>
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <button onClick={() => handleMenuClick(onLogin)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                                    Inloggen
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default HeaderProfile;
// Force Write: 1722421332906
