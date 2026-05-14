import React, { useState, useMemo, useEffect } from 'react';
import AddressSearch from './components/AddressSearch';
import MapComponent from './components/MapComponent';
import ResultList from './components/ResultList';
import StatsWidget from './components/StatsWidget';
import FAQSection from './components/FAQSection';
import TrendChart from './components/TrendChart';
import MapLegend from './components/MapLegend';
import AlertModal from './components/AlertModal';
import ShowAlertsModal from './components/ShowAlertsModal';
import HeaderProfile from './components/HeaderProfile';
import ProfileModal from './components/ProfileModal';
import { AddressResult, GroupedLocation, PermitRecord, PermitStatus, LatLngCoordinate, SavedAlert, RDCoordinate } from './types';
import { fetchPermitsForYear, fetchRecentPermits, fetchActivePermitCount, searchAddress, lookupAddress } from './services/apiService';
import { parsePointString, wgs84ToRd } from './services/geoService';
import { useAuth } from './contexts/AuthContext';
import { loginWithGoogle, logout, deleteCurrentUserAccount } from './services/authService';
import { fetchAlerts, addAlert, removeAlert, toggleAlertEmail } from './services/alertService';
import { ALERTS_ENABLED } from './features';

// Force Update: 1722424800000

const AmsterdamHeartIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" className={className}><defs><clipPath id="h"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></clipPath></defs><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#d75c2e" /><rect x="0" y="8.5" width="24" height="7" fill="black" clipPath="url(#h)" /><path d="M6 10.5L9 13.5M9 10.5L6 13.5" stroke="white" strokeWidth="1.5" /><path d="M10.5 10.5L13.5 13.5M13.5 10.5L10.5 13.5" stroke="white" strokeWidth="1.5" /><path d="M15 10.5L18 13.5M18 10.5L15 13.5" stroke="white" strokeWidth="1.5" /></svg>;
const VerhuurRadarIcon = ({ className }: { className?: string }) =><svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" className="fill-red-600" /><circle cx="50" cy="50" r="38" className="stroke-white/20" strokeWidth="4" /><circle cx="50" cy="50" r="26" className="stroke-white/30" strokeWidth="4" /><circle cx="50" cy="50" r="14" className="stroke-white/40" strokeWidth="4" /><line x1="50" y1="50" x2="82" y2="18" className="stroke-white" strokeWidth="4" strokeLinecap="round" /><circle cx="50" cy="50" r="5" className="fill-white" /><g transform="translate(0, 5)"><path d="M22 85V68l8-8 8 8v17H22z" className="fill-white" /><rect x="25" y="72" width="3" height="4" className="fill-red-600" /><rect x="31" y="72" width="3" height="4" className="fill-red-600" /><path d="M40 85V62l10-10 10 10v23H40z" className="fill-white" /><rect x="44" y="65" width="3" height="4" className="fill-red-600" /><rect x="53" y="65" width="3" height="4" className="fill-red-600" /><rect x="44" y="73" width="3" height="4" className="fill-red-600" /><rect x="53" y="73" width="3" height="4" className="fill-red-600" /><path d="M62 85V68l8-8 8 8v17H62z" className="fill-white" /><rect x="65" y="72" width="3" height="4" className="fill-red-600" /><rect x="71" y="72" width="3" height="4" className="fill-red-600" /></g></svg>;


function VerhuurRadarApp() {
  const { currentUser } = useAuth();
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
const [currentAddress, setCurrentAddress] = useState<AddressResult | null>(null);
  const [foundPermits, setFoundPermits] = useState<PermitRecord[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>();
  const [userLocation, setUserLocation] = useState<LatLngCoordinate | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngCoordinate | null>(null);
  const [showSearchHere, setShowSearchHere] = useState(false);
  const [lastSearchedCenter, setLastSearchedCenter] = useState<LatLngCoordinate | null>(null);
  const [recentPermits, setRecentPermits] = useState<PermitRecord[]>([]);
  const [totalActiveCount, setTotalActiveCount] = useState<number | null>(null);
  const [isMobileListCollapsed, setIsMobileListCollapsed] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isShowAlertsModalOpen, setIsShowAlertsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loginError, setLoginError] = useState<{ type: string, message: string } | null>(null);
  const [savedAlerts, setSavedAlerts] = useState<SavedAlert[]>([]);

  useEffect(() => {
    if (!ALERTS_ENABLED) return;
    if (currentUser) { fetchAlerts(currentUser.uid).then(setSavedAlerts); }
    else { setSavedAlerts([]); }
  }, [currentUser]);

  const hasActiveAlert = useMemo(() => ALERTS_ENABLED && savedAlerts.some(a => a.address === currentAddress?.weergavenaam), [currentAddress, savedAlerts]);

  useEffect(() => { fetchRecentPermits().then(setRecentPermits); fetchActivePermitCount().then(setTotalActiveCount); }, []);

  const formatRelativeDate = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  // Fix: Added a type assertion to the result of `Object.values` to correctly type sort parameters.
  const groupedLocations: GroupedLocation[] = useMemo(() => (Object.values(foundPermits.reduce((acc, p) => {
    if (!p.wgs84) return acc;
    if (!acc[p.address]) acc[p.address] = { address: p.address, wgs84: p.wgs84, status: PermitStatus.INACTIVE, permits: [] };
    acc[p.address].permits.push(p);
    if (p.date.startsWith('2026')) acc[p.address].status = PermitStatus.ACTIVE;
    return acc;
  }, {} as { [key: string]: GroupedLocation })) as GroupedLocation[]).filter(loc => loc.address !== "Adres onbekend").sort((a, b) => a.address.localeCompare(b.address)), [foundPermits]);

  const searchByRD = async (rd: RDCoordinate, wgs: LatLngCoordinate | null, addressLabel: string) => {
    setFoundPermits([]);
    setHasSearched(true);
    setLoading(true);
    if (wgs) {
      setUserLocation(wgs);
      setMapCenter(wgs);
      setLastSearchedCenter(wgs);
      setShowSearchHere(false);
    }

    // Mock address object if we don't have a full one, or update currentAddress
    setCurrentAddress({ id: 'loc', weergavenaam: addressLabel, centroide_rd: `POINT(${rd.x} ${rd.y})`, centroide_ll: wgs ? `POINT(${wgs.lng} ${wgs.lat})` : '' } as AddressResult);

    setLoadingStatus("laden...");
    const results = await Promise.all(
      [2026, 2025, 2024, 2023, 2022, 2021].map(y => fetchPermitsForYear(rd, 200, y))
    );
    setFoundPermits(results.flat());
    setLoading(false);
  };

  const handleAddressSelect = async (addr: AddressResult) => {
    if (!addr.centroide_rd || !addr.centroide_ll) return;
    
    const wgs = parsePointString(addr.centroide_ll);
    const rd = parsePointString(addr.centroide_rd);
    if (wgs && rd) {
      await searchByRD(rd, { lat: wgs.y, lng: wgs.x }, addr.weergavenaam);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const rd = wgs84ToRd(latitude, longitude);
      searchByRD(rd, { lat: latitude, lng: longitude }, "Mijn Locatie");
    }, (err) => {
      console.error(err);
      setLoading(false);
      alert("Locatie ophalen mislukt.");
    });
  };

  const handleMapMoveEnd = (center: LatLngCoordinate) => {
    setMapCenter(center);
    if (lastSearchedCenter) {
      const dist = Math.sqrt(Math.pow(center.lat - lastSearchedCenter.lat, 2) + Math.pow(center.lng - lastSearchedCenter.lng, 2));
      if (dist > 0.002) { // Approx 200m
        setShowSearchHere(true);
      }
    }
  };

  const handleSearchHere = () => {
    if (mapCenter) {
      const rd = wgs84ToRd(mapCenter.lat, mapCenter.lng);
      searchByRD(rd, mapCenter, "Geselecteerde locatie");
    }
  };

  const handleReset = () => { setHasSearched(false); };
  const handleRecentPermitClick = async (a: string) => { const s = await searchAddress(a); if (s[0]) { const f = await lookupAddress(s[0].id); if (f) handleAddressSelect(f); } };
  const handleLogin = async () => { setLoginError(null); try { await loginWithGoogle(); setIsAlertModalOpen(false); } catch (e: any) { setLoginError({ type: e.code, message: e.message }); } };
  const handleLogout = async () => { await logout(); };
  const handleDeleteAccount = async () => { await deleteCurrentUserAccount(); setIsProfileModalOpen(false); };
  const handleSubscribe = async () => { if (currentUser && currentAddress) { await addAlert(currentUser.uid, currentAddress.weergavenaam); setSavedAlerts(p => [...p, { id: currentAddress.weergavenaam, address: currentAddress.weergavenaam, emailEnabled: true, createdAt: Date.now() }]); setIsAlertModalOpen(false); } };
  const handleUnsubscribe = async () => { if (currentUser && currentAddress) { await removeAlert(currentUser.uid, currentAddress.weergavenaam); setSavedAlerts(p => p.filter(a => a.address !== currentAddress.weergavenaam)); setIsAlertModalOpen(false); } };
  const handleRemoveSavedAlert = async (a: string) => { if (currentUser) { await removeAlert(currentUser.uid, a); setSavedAlerts(p => p.filter(i => i.address !== a)); } };
  const handleToggleAlertEmail = async (a: string) => { if (currentUser) { const al = savedAlerts.find(i => i.address === a); if (al) { await toggleAlertEmail(currentUser.uid, a, al.emailEnabled); setSavedAlerts(p => p.map(i => i.address === a ? { ...i, emailEnabled: !i.emailEnabled } : i)); } } };
  const handleSelectSavedAlert = (a: string) => { setIsShowAlertsModalOpen(false); handleRecentPermitClick(a); };

  return (
    <div className="h-[100dvh] w-full flex flex-col font-sans">
      {!hasSearched ? (
        <div className="flex-1 overflow-y-auto"><div className="min-h-full flex flex-col items-center p-6"><div className="w-full max-w-2xl text-center flex-grow pt-10 mx-auto"><div className="mb-6 flex items-center justify-center gap-3"><VerhuurRadarIcon className="w-10 h-10 sm:w-16 sm:h-16" /><h1 className="text-3xl sm:text-6xl font-bold whitespace-nowrap"><span className="text-slate-900">Verhuur</span><span className="text-red-600">Radar</span></h1></div><p className="text-lg text-slate-600 mb-8">Alle vergunningen voor vakantieverhuur in Amsterdam</p><AddressSearch onAddressSelect={handleAddressSelect} onUseLocation={handleUseLocation} /><div className="w-full max-w-2xl mx-auto space-y-2 mt-10">{recentPermits.length > 0 && <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-left"><span>Laatst verleend</span><a href="https://zoek.officielebekendmakingen.nl/resultaten?q=(c.product-area==%22officielepublicaties%22)and(((w.publicatienaam==%22Tractatenblad%22))or((w.publicatienaam==%22Staatsblad%22))or((w.publicatienaam==%22Staatscourant%22))or((w.publicatienaam==%22Gemeenteblad%22))or((w.publicatienaam==%22Provinciaal%20blad%22))or((w.publicatienaam==%22Waterschapsblad%22))or((w.publicatienaam==%22Blad%20gemeenschappelijke%20regeling%22)))and(cql.textAndIndexes=%22vakantieverhuur%22%20and%20cql.textAndIndexes=%22amsterdam%22)%20AND%20dt.creator==%22Amsterdam%22&zv=vakantieverhuur+amsterdam&pg=10&col=AlleBekendmakingen&svel=Publicatiedatum&svol=Aflopend&sf=po%7cAmsterdam" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title="Bekijk alle vergunningen op Officiële Bekendmakingen" className="text-slate-300 hover:text-slate-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg></a></div>}{recentPermits.map(p => <div key={p.id} onClick={() => handleRecentPermitClick(p.address)} className="bg-white border border-slate-200 rounded p-3 flex justify-between items-center cursor-pointer hover:bg-red-50"><span className="font-semibold text-sm">{p.address}</span><span className="text-xs text-slate-500">{formatRelativeDate(p.date)}</span></div>)}</div><div className="hidden sm:block"><TrendChart totalActiveCount={totalActiveCount} /></div><FAQSection /></div><footer className="w-full mt-16 pb-10 pt-8 border-t border-slate-200">
              <div className="flex flex-col items-center gap-1 text-sm text-slate-500">
                <a href="https://repository.overheid.nl/sru" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">Vergunningsdata: Overheid.nl</a>
                <span className="flex items-center gap-1.5 mt-2 whitespace-nowrap text-xs">Made with <AmsterdamHeartIcon className="w-3.5 h-3.5" /> in Amsterdam by <a href="https://www.linkedin.com/in/olaflemmers/" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap">Olaf Lemmers</a></span>
                <div className="flex items-center gap-3 mt-1">
                  <a href="https://github.com/olafdepolaf-ai/VerhuurRadar-amsterdam" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">GitHub</a>
                  <span className="text-slate-300">·</span>
                  <a href="https://www.linkedin.com/in/olaflemmers/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">LinkedIn</a>
                  <span className="text-slate-300">·</span>
                  <a href="https://buymeacoffee.com/olafdepolaf" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 transition-colors">Buy Me a Coffee</a>
                </div>
              </div>
            </footer></div></div>
      ) : (
        <div className="flex flex-col h-full">
          <header className="flex-none bg-white border-b h-16 px-4 flex items-center justify-between z-[2000] shadow-sm"><div onClick={handleReset} className="cursor-pointer flex items-center gap-3"><VerhuurRadarIcon className="w-8 h-8" /><span className="font-bold text-xl"><span className="text-slate-900">Verhuur</span><span className="text-red-600">Radar</span></span></div><div className="flex-1 max-w-xl mx-auto hidden md:flex"><AddressSearch onAddressSelect={handleAddressSelect} isCompact initialValue={currentAddress?.weergavenaam} onClear={() => { }} onUseLocation={handleUseLocation} /></div>{ALERTS_ENABLED && <HeaderProfile onLogin={() => setIsAlertModalOpen(true)} onLogout={handleLogout} onShowAlerts={() => setIsShowAlertsModalOpen(true)} onShowProfile={() => setIsProfileModalOpen(true)} />}</header>
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="flex flex-col flex-1">
              <div className="md:hidden p-2 bg-white border-b"><AddressSearch onAddressSelect={handleAddressSelect} isCompact initialValue={currentAddress?.weergavenaam} onClear={() => { }} onUseLocation={handleUseLocation} /></div>
              <div className="flex-1 relative">
                {foundPermits.length > 0 && <div className="absolute top-4 right-4 z-[999] hidden sm:block"><StatsWidget permits={foundPermits} /></div>}
                {/* Search Here Button Overlay */}
                {showSearchHere && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
                    <button onClick={handleSearchHere} className="bg-white text-slate-900 px-4 py-2 rounded-full shadow-lg font-semibold flex items-center gap-2 hover:bg-slate-50 border border-slate-200 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600"><path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                      Zoek in dit gebied
                    </button>
                  </div>
                )}
                {userLocation && <MapComponent center={userLocation} locations={groupedLocations} onMarkerClick={setSelectedLocationId} selectedLocationId={selectedLocationId} isMobileListCollapsed={isMobileListCollapsed} onMapMoveEnd={handleMapMoveEnd} />}
                <div className="hidden sm:block"><MapLegend /></div>
              </div>
            </div>
            <div className={`w-full md:w-72 flex flex-col border-t md:border-t-0 md:border-r transition-all duration-300 ${isMobileListCollapsed ? 'h-14' : 'h-[45vh]'} md:h-full`}><ResultList locations={groupedLocations} onSelect={setSelectedLocationId} selectedLocationId={selectedLocationId} isLoading={loading} loadingStatus={loadingStatus} isMobileCollapsed={isMobileListCollapsed} onToggleMobileCollapse={() => setIsMobileListCollapsed(!isMobileListCollapsed)} hasActiveAlert={ALERTS_ENABLED ? hasActiveAlert : undefined} onAlertClick={ALERTS_ENABLED ? () => { if (currentUser && hasActiveAlert) { setIsShowAlertsModalOpen(true) } else { setIsAlertModalOpen(true) } } : undefined} searchedAddress={currentAddress?.weergavenaam} /></div></div></div>
      )}
      {ALERTS_ENABLED && <AlertModal isOpen={isAlertModalOpen} onClose={() => { setIsAlertModalOpen(false); setLoginError(null); }} isLoggedIn={!!currentUser} hasActiveAlert={hasActiveAlert} onLogin={handleLogin} onSubscribe={handleSubscribe} onUnsubscribe={handleUnsubscribe} userEmail={currentUser?.email || ""} loginError={loginError} />}
      {ALERTS_ENABLED && <ShowAlertsModal isOpen={isShowAlertsModalOpen} onClose={() => setIsShowAlertsModalOpen(false)} alerts={savedAlerts} onSelectAlert={handleSelectSavedAlert} onRemoveAlert={handleRemoveSavedAlert} onToggleEmail={handleToggleAlertEmail} />}
      {ALERTS_ENABLED && <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} onDeleteAccount={handleDeleteAccount} />}
    </div>
  );
}
export default VerhuurRadarApp;