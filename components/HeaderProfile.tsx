
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

    // Mock Google Photo URL
    const userPhotoUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80";

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center focus:outline-none transition-opacity hover:opacity-80"
                title={isLoggedIn ? "Account opties" : "Inloggen"}
            >
                {isLoggedIn ? (
                    // Logged In: Google Photo
                    <img 
                        src={userPhotoUrl} 
                        alt="Profiel" 
                        className="w-10 h-10 rounded-full border-2 border-slate-200 shadow-sm object-cover"
                    />
                ) : (
                    // Not Logged In: Generic Gray Avatar
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
                
                {/* Small chevron indicating menu */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 text-slate-400 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[2500] animate-fade-in-up">
                    <ul className="py-1">
                        {isLoggedIn ? (
                            <>
                                <li>
                                    <button 
                                        onClick={() => {
                                            setIsOpen(false);
                                            onShowProfile();
                                        }} 
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Profiel
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => {
                                            setIsOpen(false);
                                            onShowAlerts();
                                        }} 
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Toon alerts
                                    </button>
                                </li>
                                <div className="border-t border-slate-100 my-1"></div>
                                <li>
                                    <button 
                                        onClick={() => {
                                            onLogout();
                                            setIsOpen(false);
                                        }} 
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors"
                                    >
                                        Uitloggen
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <button 
                                    onClick={() => {
                                        onLogin();
                                        setIsOpen(false);
                                    }} 
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                                >
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
