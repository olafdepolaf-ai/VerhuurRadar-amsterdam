import React from 'react';
import { SavedAlert } from '../types';

// Force Update: 1722424800000

interface ShowAlertsModalProps { isOpen: boolean; onClose: () => void; alerts: SavedAlert[]; onSelectAlert: (address: string) => void; onRemoveAlert: (address: string) => void; onToggleEmail: (address: string) => void; }

const ShowAlertsModal: React.FC<ShowAlertsModalProps> = ({ isOpen, onClose, alerts, onSelectAlert, onRemoveAlert, onToggleEmail }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="px-6 py-4 border-b flex items-center justify-between"><h3 className="text-lg font-bold">Beheer je alerts</h3><button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
                <div className="max-h-[60vh] overflow-y-auto bg-slate-50/50">
                    {alerts.length > 0 ? (
                        <div className="flex flex-col divide-y">{alerts.map(alert => (
                            <div key={alert.id} className="bg-white p-4">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-baseline gap-2"><h4 className="font-bold truncate">{alert.address}</h4><button onClick={() => onSelectAlert(alert.address)} className="text-xs text-blue-600 hover:underline">bekijk →</button></div>
                                    <button onClick={() => onRemoveAlert(alert.address)} className="text-slate-400 hover:text-red-600 p-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2m-6 5v6m4-6v6"/></svg></button>
                                </div>
                                <p className="text-xs text-slate-500 mb-3">Binnen 200m straal</p>
                                <div className="pt-3 border-t flex items-center justify-between">
                                    <span className="text-sm font-medium">Dagelijkse e-mailupdates</span>
                                    <button onClick={() => onToggleEmail(alert.address)} className={`relative inline-flex h-6 w-11 items-center rounded-full ${alert.emailEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${alert.emailEnabled ? 'translate-x-6' : 'translate-x-1'}`}/></button>
                                </div>
                            </div>
                        ))}</div>
                    ) : ( <div className="p-8 text-center text-sm text-slate-500">Je hebt nog geen alerts.</div> )}
                </div>
            </div>
        </div>
    );
};
export default ShowAlertsModal;
