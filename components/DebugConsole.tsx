import React, { useState, useEffect, useRef } from 'react';
import { Logger, LogEntry } from '../services/logger';

const DebugConsole: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = Logger.subscribe((entry) => {
            setLogs(prev => [...prev, entry].slice(-50)); // Keep last 50
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (isOpen && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isOpen]);

    const formatTime = (ts: number) => {
        return new Date(ts).toLocaleTimeString('nl-NL', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-2 right-2 bg-black/80 text-green-400 text-xs px-3 py-1 rounded shadow z-[9999] font-mono hover:bg-black"
            >
                >_ Debug Console
            </button>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 h-64 bg-slate-900 text-green-400 z-[9999] font-mono text-xs flex flex-col shadow-2xl border-t border-slate-700">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
                <span className="font-bold">VerhuurRadar Terminal Output</span>
                <div className="flex gap-3">
                    <button onClick={() => setLogs([])} className="hover:text-white">Clear</button>
                    <button onClick={() => setIsOpen(false)} className="hover:text-white">Close</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {logs.length === 0 && <div className="opacity-50 italic">Waiting for logs...</div>}
                {logs.map(log => (
                    <div key={log.id} className="break-words border-b border-slate-800/50 pb-1 mb-1 last:border-0">
                        <span className="opacity-50 mr-2">[{formatTime(log.timestamp)}]</span>
                        <span className={`font-bold mr-2 ${
                            log.level === 'error' ? 'text-red-500' : 
                            log.level === 'success' ? 'text-emerald-400' : 
                            log.level === 'warn' ? 'text-yellow-400' : 'text-blue-300'
                        }`}>
                            {log.level.toUpperCase()}
                        </span>
                        <span>{log.message}</span>
                        {log.data && (
                            <pre className="mt-1 ml-6 text-[10px] opacity-70 whitespace-pre-wrap bg-black/30 p-1 rounded">
                                {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                            </pre>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default DebugConsole;