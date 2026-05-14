import React from 'react';
import AddressSearch from './AddressSearch';
import FAQSection from './FAQSection';
import TrendChart from './TrendChart';
import { AmsterdamHeartIcon, VerhuurRadarIcon } from './Icons';
import { AddressResult, PermitRecord } from '../types';

const OVERHEID_SEARCH_URL = "https://zoek.officielebekendmakingen.nl/resultaten?q=(c.product-area==%22officielepublicaties%22)and(((w.publicatienaam==%22Tractatenblad%22))or((w.publicatienaam==%22Staatsblad%22))or((w.publicatienaam==%22Staatscourant%22))or((w.publicatienaam==%22Gemeenteblad%22))or((w.publicatienaam==%22Provinciaal%20blad%22))or((w.publicatienaam==%22Waterschapsblad%22))or((w.publicatienaam==%22Blad%20gemeenschappelijke%20regeling%22)))and(cql.textAndIndexes=%22vakantieverhuur%22%20and%20cql.textAndIndexes=%22amsterdam%22)%20AND%20dt.creator==%22Amsterdam%22&zv=vakantieverhuur+amsterdam&pg=10&col=AlleBekendmakingen&svel=Publicatiedatum&svol=Aflopend&sf=po%7cAmsterdam";

interface LandingPageProps {
    recentPermits: PermitRecord[];
    totalActiveCount: number | null;
    onAddressSelect: (addr: AddressResult) => void;
    onUseLocation: () => void;
    onRecentPermitClick: (address: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
    recentPermits,
    totalActiveCount,
    onAddressSelect,
    onUseLocation,
    onRecentPermitClick,
}) => {
    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="min-h-full flex flex-col items-center p-6">
                <div className="w-full max-w-2xl text-center flex-grow pt-10 mx-auto">
                    <div className="mb-6 flex items-center justify-center gap-3">
                        <VerhuurRadarIcon className="w-10 h-10 sm:w-16 sm:h-16" />
                        <h1 className="text-3xl sm:text-6xl font-bold whitespace-nowrap">
                            <span className="text-slate-900">Verhuur</span>
                            <span className="text-red-600">Buur</span>
                        </h1>
                    </div>
                    <p className="text-lg text-slate-600 mb-8">
                        Alle vergunningen voor vakantieverhuur in Amsterdam
                    </p>
                    <AddressSearch
                        onAddressSelect={onAddressSelect}
                        onUseLocation={onUseLocation}
                    />
                    <div className="w-full max-w-2xl mx-auto space-y-2 mt-10">
                        {recentPermits.length > 0 && (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-left">
                                <span>Laatst verleend</span>
                                <a
                                    href={OVERHEID_SEARCH_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    title="Bekijk alle vergunningen op Officiële Bekendmakingen"
                                    className="text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                </a>
                            </div>
                        )}
                        {recentPermits.map(p => (
                            <div
                                key={p.id}
                                onClick={() => onRecentPermitClick(p.address)}
                                className="bg-white border border-slate-200 rounded p-3 flex justify-between items-center cursor-pointer hover:bg-red-50"
                            >
                                <span className="font-semibold text-sm">{p.address}</span>
                                <span className="text-xs text-slate-500">{formatDate(p.date)}</span>
                            </div>
                        ))}
                    </div>
                    <TrendChart totalActiveCount={totalActiveCount} />
                    <FAQSection />
                </div>
                <footer className="w-full mt-16 pb-10 pt-8 border-t border-slate-200">
                    <div className="flex flex-col items-center gap-1 text-sm text-slate-500">
                        <a
                            href="https://repository.overheid.nl/sru"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-slate-800 transition-colors"
                        >
                            Vergunningsdata: Overheid.nl
                        </a>
                        <span className="flex items-center gap-1.5 mt-2 whitespace-nowrap text-xs">
                            Made with <AmsterdamHeartIcon className="w-3.5 h-3.5" /> in Amsterdam by{' '}
                            <a
                                href="https://www.linkedin.com/in/olaflemmers/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
                            >
                                Olaf Lemmers
                            </a>
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                            <a href="https://github.com/olafdepolaf-ai/VerhuurRadar-amsterdam" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">GitHub</a>
                            <span className="text-slate-300">·</span>
                            <a href="https://www.linkedin.com/in/olaflemmers/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">LinkedIn</a>
                            <span className="text-slate-300">·</span>
                            <a href="https://buymeacoffee.com/olafdepolaf" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">Buy Me a Coffee</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
