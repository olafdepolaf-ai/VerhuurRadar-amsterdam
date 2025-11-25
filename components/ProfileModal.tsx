
import React, { useState } from 'react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
    userName: string;
    userPhotoUrl: string;
    onDeleteAccount: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
    isOpen, 
    onClose, 
    userEmail, 
    userName, 
    userPhotoUrl,
    onDeleteAccount 
}) => {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                
                {!showDeleteConfirmation && (
                    <button 
                        onClick={onClose}
                        className="absolute top-3 right-3 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {!showDeleteConfirmation ? (
                    <div className="p-8 flex flex-col items-center text-center">
                        <img 
                            src={userPhotoUrl} 
                            alt="Profiel" 
                            className="w-20 h-20 rounded-full border-4 border-slate-100 shadow-md object-cover mb-4"
                        />
                        
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{userName}</h3>
                        <p className="text-sm text-slate-500 mb-6">{userEmail}</p>

                        <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-slate-700">Google Account</p>
                                <p className="text-[10px] text-slate-400">Gekoppeld via Inloggen met Google</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowDeleteConfirmation(true)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                        >
                            Account verwijderen
                        </button>
                    </div>
                ) : (
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Account verwijderen?</h3>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            Weet je het zeker? Dit kan niet ongedaan worden gemaakt. Al je alerts worden verwijderd.
                        </p>

                        <div className="w-full flex flex-col gap-3">
                             <button 
                                onClick={onDeleteAccount}
                                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                            >
                                Ja, verwijder account
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirmation(false)}
                                className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors"
                            >
                                Nee, annuleren
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileModal;
// Force Write: 1722421332906
