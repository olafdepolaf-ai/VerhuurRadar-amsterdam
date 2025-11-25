
import React from 'react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoggedIn: boolean;
    hasActiveAlert: boolean;
    onLogin: () => void;
    onUnsubscribe: () => void;
    onSubscribe: () => void;
    userEmail?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ 
    isOpen, 
    onClose, 
    isLoggedIn, 
    hasActiveAlert, 
    onLogin, 
    onUnsubscribe,
    onSubscribe,
    userEmail = "gebruiker@gmail.com"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {!isLoggedIn ? (
                    // 1. GUEST: LOGIN REQUIRED
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Blijf op de hoogte</h3>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Ontvang updates van nieuwe aangevraagde vergunningen in deze zoekstraal.
                        </p>

                        <button 
                            onClick={onLogin}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Log in met Google
                        </button>
                        
                        <p className="mt-4 text-[10px] text-slate-400">
                            Wij gebruiken je e-mailadres alleen voor deze meldingen.
                        </p>
                    </div>
                ) : hasActiveAlert ? (
                    // 2. LOGGED IN: UNSUBSCRIBE FLOW
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                            </svg>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Alert uitschakelen?</h3>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Weet je zeker dat je geen updates meer wilt ontvangen voor deze buurt?
                        </p>

                        <div className="w-full flex gap-3">
                            <button 
                                onClick={onClose}
                                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                            >
                                Annuleren
                            </button>
                            <button 
                                onClick={onUnsubscribe}
                                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                            >
                                Uitschakelen
                            </button>
                        </div>
                    </div>
                ) : (
                    // 3. LOGGED IN: SUBSCRIBE CONFIRMATION
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-600">
                                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                            </svg>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Alert instellen</h3>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                            Ontvang maximaal 1 e-mail per dag bij nieuwe vergunningen in deze buurt.
                        </p>
                        
                        <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Jouw e-mailadres</p>
                            <p className="text-sm text-slate-900 font-medium truncate">{userEmail}</p>
                        </div>

                        <button 
                            onClick={onSubscribe}
                            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                        >
                            Bevestigen
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertModal;
