
import React from 'react';

interface AlertItem {
    address: string;
    emailEnabled: boolean;
}

interface ShowAlertsModalProps {
    isOpen: boolean;
    onClose: () => void;
    alerts: AlertItem[];
    onSelectAlert: (address: string) => void;
    onRemoveAlert: (address: string) => void;
    onToggleEmail: (address: string) => void;
}

const ShowAlertsModal: React.FC<ShowAlertsModalProps> = ({ 
    isOpen, 
    onClose, 
    alerts, 
    onSelectAlert, 
    onRemoveAlert,
    onToggleEmail
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
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h3 className="text-lg font-bold text-slate-900">
                        Beheer je alerts
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* List Container */}
                <div className="max-h-[60vh] overflow-y-auto bg-slate-50/50">
                    {alerts.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <p className="text-sm">Je hebt nog geen alerts ingesteld.</p>
                            <p className="text-xs mt-1 text-slate-400">Zoek een adres en klik op het belletje om te starten.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-slate-100">
                            {alerts.map((alert, idx) => (
                                <div key={idx} className="bg-white p-4 hover:bg-slate-50 transition-colors group">
                                    
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 text-base truncate">{alert.address}</h4>
                                            <button 
                                                onClick={() => onSelectAlert(alert.address)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5 whitespace-nowrap hover:underline"
                                            >
                                                bekijk
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                                </svg>
                                            </button>
                                        </div>
                                        
                                        <button 
                                            onClick={() => onRemoveAlert(alert.address)}
                                            className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded ml-2 hover:bg-red-50 flex-shrink-0"
                                            title="Verwijder alert"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                                <path d="M3 6h18"></path>
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                        </button>
                                    </div>

                                    <p className="text-xs text-slate-500 mb-3">Binnen 200m straal</p>

                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-sm text-slate-600 font-medium">Dagelijkse e-mailupdates</span>
                                        
                                        {/* Toggle Switch */}
                                        <button 
                                            onClick={() => onToggleEmail(alert.address)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${alert.emailEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
                                        >
                                            <span className="sr-only">E-mail updates inschakelen</span>
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${alert.emailEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShowAlertsModal;
