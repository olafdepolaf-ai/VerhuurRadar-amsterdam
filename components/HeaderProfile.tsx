import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BellInactiveIcon, ChevronDownIcon, UserIcon, ProfileMenuIcon, LogoutIcon } from './Icons';

interface HeaderProfileProps {
    onLogin: () => void;
    onLogout: () => void;
    onShowAlerts: () => void;
    onShowProfile: () => void;
}

const HeaderProfile: React.FC<HeaderProfileProps> = ({ onLogin, onLogout, onShowAlerts, onShowProfile }) => {
    const { currentUser } = useAuth();
    const isLoggedIn = !!currentUser;
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMenuClick = (action: () => void) => { setIsOpen(false); action(); };

    return (
        <div className="relative" ref={wrapperRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center">
                {isLoggedIn && currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profiel" className="w-10 h-10 rounded-full border-2" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border text-slate-400">
                        <UserIcon className="w-6 h-6" />
                    </div>
                )}
                <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border z-[2500]">
                    <ul className="py-2">
                        {isLoggedIn ? (
                            <>
                                <li>
                                    <button
                                        onClick={() => handleMenuClick(onShowAlerts)}
                                        className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm hover:bg-slate-50"
                                    >
                                        <BellInactiveIcon className="w-5 h-5 text-slate-400" />
                                        <span className="font-medium">Beheer alerts</span>
                                    </button>
                                </li>
                                <div className="border-t my-1 mx-2"></div>
                                <li>
                                    <button
                                        onClick={() => handleMenuClick(onShowProfile)}
                                        className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm hover:bg-slate-50"
                                    >
                                        <ProfileMenuIcon className="w-5 h-5 text-slate-400" />
                                        <span className="font-medium">Mijn profiel</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleMenuClick(onLogout)}
                                        className="w-full flex items-center gap-3 text-left px-4 py-2.5 text-sm hover:bg-slate-50"
                                    >
                                        <LogoutIcon className="w-5 h-5 text-slate-400" />
                                        <span className="font-medium">Uitloggen</span>
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li>
                                <button
                                    onClick={() => handleMenuClick(onLogin)}
                                    className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50"
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
