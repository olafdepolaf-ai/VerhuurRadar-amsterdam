type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
    id: string;
    timestamp: number;
    level: LogLevel;
    message: string;
    data?: any;
}

type LogListener = (entry: LogEntry) => void;

class LoggerService {
    private listeners: LogListener[] = [];

    subscribe(listener: LogListener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    log(level: LogLevel, message: string, data?: any) {
        const entry: LogEntry = {
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now(),
            level,
            message,
            data
        };
        this.listeners.forEach(l => l(entry));
        
        const style = level === 'error' ? 'color: red' : level === 'success' ? 'color: green' : 'color: blue';
        console.log(`%c[VerhuurRadar] ${message}`, style, data || '');
    }

    info(msg: string, data?: any) { this.log('info', msg, data); }
    success(msg: string, data?: any) { this.log('success', msg, data); }
    warn(msg: string, data?: any) { this.log('warn', msg, data); }
    error(msg: string, data?: any) { this.log('error', msg, data); }
}

export const Logger = new LoggerService();

// Force-Rewrite: 1722421332906
