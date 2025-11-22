
import React, { useState, useMemo, useEffect } from 'react';
import AddressSearch from './components/AddressSearch';
import MapComponent from './components/MapComponent';
import ResultList from './components/ResultList';
import StatsWidget from './components/StatsWidget';
import FAQSection from './components/FAQSection';
import { AddressResult, GroupedLocation, PermitRecord, PermitStatus, LatLngCoordinate } from './types';
import { fetchPermitsForYear, fetchRecentPermits, fetchActivePermitCount } from './services/apiService';
import { parsePointString } from './services/geoService';

// Custom SVG Logo Component
const VerhuurRadarIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" className="fill-red-600" />
        <circle cx="50" cy="50" r="38" className="stroke-white/20" strokeWidth="4" />
        <circle cx="50" cy="50" r="26" className="stroke-white/30" strokeWidth="4" />
        <circle cx="50" cy="50" r="14" className="stroke-white/40" strokeWidth="4" />
        <line x1="50" y1="50" x2="82" y2="18" className="stroke-white" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="50" r="5" className="fill-white" />
        <g transform="translate(0, 5)">
            <path d="M22 85V68l8-8 8 8v17H22z" className="fill-white" />
            <rect x="25" y="72" width="3" height="4" className="fill-red-600" />
            <rect x="31" y="72" width="3" height="4" className="fill-red-600" />
            <path d="M40 85V62l10-10 10 10v23H40z" className="fill-white" />
            <rect x="44" y="65" width="3" height="4" className="fill-red-600" />
            <rect x="53" y="65" width="3" height="4" className="fill-red-600" />
            <rect x="44" y="73" width="3" height="4" className="fill-red-600" />
            <rect x="53" y="73" width="3" height="4" className="fill-red-600" />
            <path d="M62 85V68l8-8 8 8v17H62z" className="fill-white" />
            <rect x="65" y="72" width="3" height="4" className="fill-red-600" />
            <rect x="71" y="72" width="3" height="4" className="fill-red-600" />
        </g>
    </svg>
);

// Amsterdam Heart Icon with Crosses (Red Heart, Black Stripe, White Crosses)
const AmsterdamHeartIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <clipPath id="ams-heart-clip">
                 <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </clipPath>
        </defs>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" className="fill-red-600" />
        
        {/* Black Stripe */}
        <rect x="0" y="8.5" width="24" height="7" fill="black" clipPath="url(#ams-heart-clip)" />
        
        {/* Crosses (White 'X's) */}
        <path d="M6 10.5L9 13.5M9 10.5L6 13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10.5 10.5L13.5 13.5M13.5 10.5L10.5 13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 10.5L18 13.5M18 10.5L15 13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

function App() {
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [currentAddress, setCurrentAddress] = useState<AddressResult | null>(null);
  const [foundPermits, setFoundPermits] = useState<PermitRecord[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>();
  const [userLocation, setUserLocation] = useState<LatLngCoordinate | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentPermits, setRecentPermits] = useState<PermitRecord[]>([]);
  const [totalActiveCount, setTotalActiveCount] = useState<number | null>(null);

  // Load latest permits and total count on mount
  useEffect(() => {
    const loadRecent = async () => {
        const permits = await fetchRecentPermits();
        setRecentPermits(permits);
        
        const count = await fetchActivePermitCount();
        setTotalActiveCount(count);
    };
    loadRecent();
  }, []);

  // Helper to format date relatively
  const formatRelativeDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const dayBefore = new Date();
      dayBefore.setDate(today.getDate() - 2);

      const isSameDay = (d1: Date, d2: Date) => 
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();

      if (isSameDay(date, today)) return "Vandaag";
      if (isSameDay(date, yesterday)) return "Gisteren";
      if (isSameDay(date, dayBefore)) return "Eergisteren";

      return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Group permits by unique address logic
  const groupedLocations: GroupedLocation[] = useMemo(() => {
    const groups: { [key: string]: GroupedLocation } = {};

    foundPermits.forEach(permit => {
        // Only group permits that have valid WGS84 coordinates for the map
        if (!permit.wgs84) return;

        const cleanAddr = permit.address.trim();
        
        if (!groups[cleanAddr]) {
            groups[cleanAddr] = {
                address: cleanAddr,
                wgs84: permit.wgs84,
                status: PermitStatus.INACTIVE,
                permits: []
            };
        }
        groups[cleanAddr].permits.push(permit);
        
        const year = parseInt(permit.date.substring(0, 4), 10);
        if (year === 2025) {
            groups[cleanAddr].status = PermitStatus.ACTIVE;
        }
    });

    return Object.values(groups).sort((a, b) => {
        if (a.status === PermitStatus.ACTIVE && b.status !== PermitStatus.ACTIVE) return -1;
        if (a.status !== PermitStatus.ACTIVE && b.status === PermitStatus.ACTIVE) return 1;
        return a.address.localeCompare(b.address);
    });
  }, [foundPermits]);

  const handleAddressSelect = async (addr: AddressResult) => {
    setErrorMsg(null);
    setFoundPermits([]); 
    
    try {
        if (!addr.centroide_rd || !addr.centroide_ll) {
            throw new Error("Locatiegegevens ontbreken voor dit adres.");
        }

        setCurrentAddress(addr);
        setHasSearched(true); 
        setLoading(true);

        const rd = parsePointString(addr.centroide_rd);
        const wgs = parsePointString(addr.centroide_ll);
        
        if (wgs) {
            setUserLocation({ lat: wgs.y, lng: wgs.x });
        } else {
            throw new Error("Kan GPS coördinaten niet verwerken.");
        }

        if (rd) {
            const startYear = 2025;
            const endYear = 2020;
            const radius = 200;

            for (let year = startYear; year >= endYear; year--) {
                setLoadingStatus(`${year}`);
                const yearPermits = await fetchPermitsForYear(rd, radius, year);
                setFoundPermits(prev => [...prev, ...yearPermits]);
                await new Promise(r => setTimeout(r, 300));
            }
            setLoadingStatus("");
        } else {
             throw new Error("Kan RD coördinaten niet verwerken.");
        }
    } catch (err: any) {
        console.error("Selection error:", err);
        setErrorMsg(err.message || "Er is iets misgegaan bij het ophalen van de gegevens.");
    } finally {
        setLoading(false);
    }
  };

  const handleReset = () => {
    setHasSearched(false);
    setFoundPermits([]);
    setCurrentAddress(null);
    setUserLocation(null);
    setErrorMsg(null);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white font-sans text-slate-900 overflow-hidden">
      
      {/* Search First View */}
      {!hasSearched && (
        <div className="flex-1 overflow-y-auto w-full">
            <div className="min-h-full flex flex-col items-center p-6 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-red-50 to-white pointer-events-none z-0 h-96"></div>
              
              <div className="w-full max-w-xl text-center z-10 flex flex-col items-center flex-grow pt-10">
                
                {/* Logo / Header */}
                <div className="mb-6 flex items-center justify-center gap-3">
                    <VerhuurRadarIcon className="w-14 h-14 md:w-16 md:h-16 shadow-lg rounded-full" />
                    <h1 className="text-5xl font-bold tracking-tight">
                      <span className="text-slate-900">Verhuur</span>
                      <span className="text-red-600">Radar</span>
                    </h1>
                </div>

                <div className="flex flex-col items-center gap-1 mb-8 max-w-lg mx-auto">
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Inzicht in alle vergunningen voor vakantieverhuur in Amsterdam.
                    </p>
                </div>
                
                <div className="w-full relative z-20 mb-10">
                    <AddressSearch onAddressSelect={handleAddressSelect} />
                    {errorMsg && (
                        <div className="mt-3 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                            {errorMsg}
                        </div>
                    )}
                </div>

                {/* Recent Permits Health Check (Top 3) */}
                {recentPermits.length > 0 && (
                    <div className="w-full max-w-md space-y-3 animate-fade-in-up">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left pl-1">Laatst verleend</div>
                        {recentPermits.map((permit, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 rounded shadow-sm p-3 flex justify-between items-center">
                                 <div className="font-semibold text-slate-800 text-sm truncate pr-2">{permit.address}</div>
                                 <div className="text-xs font-medium text-slate-500 whitespace-nowrap">
                                    {formatRelativeDate(permit.date)}
                                 </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Active Count Widget with Context */}
                {totalActiveCount !== null && totalActiveCount > 0 && (
                    <div className="mt-8 text-center animate-fade-in-up delay-100 max-w-lg mx-auto">
                        <div className="bg-red-50 border border-red-100 rounded-lg px-6 py-4 shadow-sm">
                             <p className="text-slate-800 font-medium text-base mb-2">
                                Vandaag zijn er in Amsterdam <span className="font-bold text-red-600 text-lg mx-1">{totalActiveCount}</span> vergunningen actief
                             </p>
                             <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                Het gaat hier om particuliere woningen met een geldige vergunning voor vakantieverhuur, waarmee bewoners hun woning maximaal 30 nachten per jaar mogen verhuren.
                             </p>
                             <a 
                                href="https://www.amsterdam.nl/wonen-leven/wonen/vakantieverhuur/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-800 text-sm font-semibold hover:underline inline-flex items-center gap-1"
                             >
                                Meer info op amsterdam.nl
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clipRule="evenodd" />
                                </svg>
                             </a>
                        </div>
                    </div>
                )}

                {/* FAQ Section */}
                <FAQSection />

              </div>
              
              {/* Footer */}
              <footer className="w-full mt-16 pb-6 text-center z-10">
                 <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                         <span>Made with</span>
                         <AmsterdamHeartIcon className="w-4 h-4" />
                         <span>in Amsterdam</span>
                    </div>
                    <div className="text-slate-300 text-[10px]">
                        Data bron: Overheid.nl • Gemeente Amsterdam
                    </div>
                 </div>
              </footer>
            </div>
        </div>
      )}

      {/* Results Split View */}
      {hasSearched && userLocation && (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <header className="flex-none bg-white border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between z-[2000] shadow-sm relative">
                <div 
                    onClick={handleReset}
                    className="cursor-pointer flex items-center gap-3 hover:opacity-80 transition-opacity"
                    role="button"
                    tabIndex={0}
                    title="Terug naar start"
                >
                    <VerhuurRadarIcon className="w-8 h-8 shadow-sm rounded-full" />
                    <div className="flex flex-col leading-none justify-center">
                        <span className="font-bold text-xl tracking-tight">
                            <span className="text-slate-900">Verhuur</span><span className="text-red-600">Radar</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Amsterdam</span>
                    </div>
                </div>
                
                {/* Search Bar aligned to the left (by taking up space) */}
                <div className="hidden md:flex flex-1 max-w-md mx-6 h-full items-center">
                    <AddressSearch 
                        onAddressSelect={handleAddressSelect} 
                        isCompact={true} 
                        initialValue={currentAddress?.weergavenaam}
                    />
                </div>
            </header>

            {/* Content Container */}
            <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
                
                {/* Mobile Search Overlay */}
                <div className="md:hidden absolute top-0 left-0 w-full z-[1000] p-4 pointer-events-none">
                    <div className="w-full bg-white/90 backdrop-blur-md shadow-lg border border-white/50 rounded-xl p-2 pointer-events-auto">
                        <AddressSearch 
                            onAddressSelect={handleAddressSelect} 
                            isCompact={true} 
                            initialValue={currentAddress?.weergavenaam}
                        />
                    </div>
                </div>

                {/* Map Area */}
                <div className="h-[55vh] md:h-full md:flex-1 relative order-1 md:order-2 pt-16 md:pt-0">
                     <div className="absolute top-4 right-4 z-[999] pointer-events-auto">
                         <StatsWidget permits={foundPermits} />
                     </div>

                     <MapComponent 
                        center={userLocation}
                        locations={groupedLocations}
                        onMarkerClick={(loc) => setSelectedLocationId(loc.address)}
                        selectedLocationId={selectedLocationId}
                     />
                     
                     <div className="absolute bottom-6 left-4 md:left-6 bg-white/90 backdrop-blur px-4 py-3 rounded-lg shadow-lg border border-slate-200 text-xs z-[999] pointer-events-none">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm"></span>
                            <span className="font-medium text-slate-700">Nu Actief (2025)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-slate-300 border border-white shadow-sm"></span>
                            <span className="font-medium text-slate-700">Historie (2020-2024)</span>
                        </div>
                     </div>
                </div>

                {/* List Area */}
                <div className="h-[45vh] md:h-full w-full md:w-80 min-w-[300px] bg-white border-t md:border-t-0 md:border-r border-slate-200 shadow-xl z-10 flex flex-col order-2 md:order-1 pt-0 md:pt-0">
                    <ResultList 
                        locations={groupedLocations} 
                        onSelect={(loc) => setSelectedLocationId(loc.address)}
                        selectedLocationId={selectedLocationId}
                        isLoading={loading}
                        loadingStatus={loadingStatus}
                    />
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;
