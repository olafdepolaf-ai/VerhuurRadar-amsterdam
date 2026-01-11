import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-50 p-6 flex flex-col items-center justify-center text-left">
                    <div className="max-w-3xl w-full bg-white rounded-xl shadow-xl overflow-hidden border border-red-200">
                        <div className="bg-red-600 p-4 text-white font-bold text-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Er is een fout opgetreden in de applicatie
                        </div>
                        <div className="p-6">
                            <p className="text-slate-700 mb-4 font-medium">De applicatie is vastgelopen. Hieronder staan de technische details:</p>

                            {this.state.error && (
                                <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4">
                                    <p className="font-bold text-red-400 mb-2">{this.state.error.toString()}</p>
                                    <pre>{this.state.errorInfo?.componentStack}</pre>
                                </div>
                            )}

                            <button
                                onClick={() => window.location.reload()}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded transition-colors"
                            >
                                Probeer opnieuw (Reload)
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
