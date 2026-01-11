import React from 'react';

interface LandingPageProps {
    onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-10 border border-slate-100">
                <div className="mb-6 flex justify-center">
                    <svg viewBox="0 0 100 100" className="w-24 h-24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" className="fill-red-600" />
                        <circle cx="50" cy="50" r="38" className="stroke-white/20" strokeWidth="4" />
                        <circle cx="50" cy="50" r="26" className="stroke-white/30" strokeWidth="4" />
                        <circle cx="50" cy="50" r="14" className="stroke-white/40" strokeWidth="4" />
                        <line x1="50" y1="50" x2="82" y2="18" className="stroke-white" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="50" cy="50" r="5" className="fill-white" />
                    </svg>
                </div>

                <h1 className="text-4xl font-bold text-slate-900 mb-4">
                    Welkom bij <span className="text-red-600">VerhuurRadar</span>
                </h1>

                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                    Omdat we problemen ervaarden met het laden van de applicatie, is deze "veilige modus" landingspagina toegevoegd.
                    Klik op de knop hieronder om de volledige applicatie te starten.
                </p>

                <button
                    onClick={onStart}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xl py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-red-200 transform hover:-translate-y-1"
                >
                    🚀 Start de Applicatie
                </button>

                <p className="mt-6 text-sm text-slate-400">
                    Versie 0.2.0 • Debug Mode
                </p>
            </div>
        </div>
    );
};

export default LandingPage;
