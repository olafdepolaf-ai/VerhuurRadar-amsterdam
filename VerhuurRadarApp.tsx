import React, { useState, useMemo, useEffect } from 'react';
import AddressSearch from './components/AddressSearch';
import MapComponent from './components/MapComponent';
import ResultList from './components/ResultList';
import StatsWidget from './components/StatsWidget';
import FAQSection from './components/FAQSection';
import AdminPage from './components/AdminPage';
import { logSearch } from './services/adminService';
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

// Force Update: 1722424800000

const VerhuurRadarIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" className="fill-red-600" /><circle cx="50" cy="50" r="38" className="stroke-white/20" strokeWidth="4" /><circle cx="50" cy="50" r="26" className="stroke-white/30" strokeWidth="4" /><circle cx="50" cy="50" r="14" className="stroke-white/40" strokeWidth="4" /><line x1="50" y1="50" x2="82" y2="18" className="stroke-white" strokeWidth="4" strokeLinecap="round" /><circle cx="50" cy="50" r="5" className="fill-white" /><g transform="translate(0, 5)"><path d="M22 85V68l8-8 8 8v17H22z" className="fill-white" /><rect x="25" y="72" width="3" height="4" className="fill-red-600" /><rect x="31" y="72" width="3" height="4" className="fill-red-600" /><path d="M40 85V62l10-10 10 10v23H40z" className="fill-white" /><rect x="44" y="65" width="3" height="4" className="fill-red-600" /><rect x="53" y="65" width="3" height="4" className="fill-red-600" /><rect x="44" y="73" width="3" height="4" className="fill-red-600" /><rect x="53" y="73" width="3" height="4" className="fill-red-600" /><path d="M62 85V68l8-8 8 8v17H62z" className="fill-white" /><rect x="65" y="72" width="3" height="4" className="fill-red-600" /><rect x="71" y="72" width="3" height="4" className="fill-red-600" /></g></svg>;
const AmsterdamHeartIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" className={className}><defs><clipPath id="h"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></clipPath></defs><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#d75c2e" /><rect x="0" y="8.5" width="24" height="7" fill="black" clipPath="url(#h)" /><path d="M6 10.5L9 13.5M9 10.5L6 13.5" stroke="white" strokeWidth="1.5" /><path d="M10.5 10.5L13.5 13.5M13.5 10.5L10.5 13.5" stroke="white" strokeWidth="1.5" /><path d="M15 10.5L18 13.5M18 10.5L15 13.5" stroke="white" strokeWidth="1.5" /></svg>;

function VerhuurRadarApp() {
  const { currentUser } = useAuth();
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [currentView, setCurrentView] = useState<'app' | 'admin'>('app');
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
    if (currentUser) { fetchAlerts(currentUser.uid).then(setSavedAlerts); }
    else { setSavedAlerts([]); }
  }, [currentUser]);

  const hasActiveAlert = useMemo(() => savedAlerts.some(a => a.address === currentAddress?.weergavenaam), [currentAddress, savedAlerts]);

  useEffect(() => { fetchRecentPermits().then(setRecentPermits); fetchActivePermitCount().then(setTotalActiveCount); }, []);

  const formatRelativeDate = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

  // Fix: Added a type assertion to the result of `Object.values` to correctly type sort parameters.
  const groupedLocations: GroupedLocation[] = useMemo(() => (Object.values(foundPermits.reduce((acc, p) => {
    if (!p.wgs84) return acc;
    if (!acc[p.address]) acc[p.address] = { address: p.address, wgs84: p.wgs84, status: PermitStatus.INACTIVE, permits: [] };
    acc[p.address].permits.push(p);
    if (p.date.startsWith('2026')) acc[p.address].status = PermitStatus.ACTIVE;
    return acc;
  }, {} as { [key: string]: GroupedLocation })) as GroupedLocation[]).sort((a, b) => a.address.localeCompare(b.address)), [foundPermits]);

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

    for (let y = 2026; y >= 2021; y--) {
      setLoadingStatus(String(y));
      const p = await fetchPermitsForYear(rd, 200, y);
      setFoundPermits(prev => [...prev, ...p]);
    }
    setLoading(false);
  };

  const handleAddressSelect = async (addr: AddressResult) => {
    if (!addr.centroide_rd || !addr.centroide_ll) return;
    
    let trackId = currentUser?.uid;
    if (!trackId) {
      trackId = localStorage.getItem('vradar_anon_id') || '';
      if (!trackId) {
        trackId = 'anon_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('vradar_anon_id', trackId);
      }
    }
    logSearch(addr.weergavenaam, trackId);
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

  if (currentView === 'admin') {
    return <AdminPage onBack={() => setCurrentView('app')} />;
  }

  return (
    <div className="h-screen w-full flex flex-col font-sans">
      {!hasSearched ? (
        <div className="flex-1 overflow-y-auto"><div className="min-h-full flex flex-col items-center p-6"><div className="w-full max-w-2xl text-center flex-grow pt-10 mx-auto"><div className="mb-6 flex items-center justify-center gap-3"><VerhuurRadarIcon className="w-16 h-16" /><h1 className="text-6xl font-bold"><span className="text-slate-900">Verhuur</span><span className="text-red-600">Radar</span></h1></div><p className="text-lg text-slate-600 mb-8">Inzicht in alle vergunningen voor vakantieverhuur in Amsterdam.</p><AddressSearch onAddressSelect={handleAddressSelect} onUseLocation={handleUseLocation} /><div className="w-full max-w-2xl mx-auto space-y-3 mt-10">{recentPermits.length > 0 && <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Laatst verleend</div>}{recentPermits.map(p => <div key={p.id} onClick={() => handleRecentPermitClick(p.address)} className="bg-white border rounded p-3 flex justify-between items-center cursor-pointer hover:bg-red-50"><span className="font-semibold text-sm">{p.address}</span><span className="text-xs text-slate-500">{formatRelativeDate(p.date)}</span></div>)}</div>{totalActiveCount && <div className="mt-8 text-center w-full max-w-2xl mx-auto"><div className="bg-red-50 border rounded-lg p-4"><p className="font-medium mb-2">Vandaag zijn er <span className="font-bold text-red-600">{totalActiveCount.toLocaleString('nl-NL')}</span> vergunningen actief</p><a href="https://www.amsterdam.nl/wonen-leven/wonen/vakantieverhuur/" target="_blank" rel="noopener noreferrer" className="text-red-600 text-sm font-semibold hover:underline">Meer info op Amsterdam.nl →</a></div></div>}<FAQSection /><TrendChart /></div><footer className="w-full mt-16 pb-8 pt-6 border-t border-slate-200">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">Olaf Lemmers</span>
                  <a href="https://www.linkedin.com/in/olaflemmers/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-slate-400 hover:text-slate-700 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
                  </a>
                  <a href="https://github.com/olafdepolaf-ai/VerhuurRadar-amsterdam" target="_blank" rel="noopener noreferrer" title="GitHub" className="text-slate-400 hover:text-slate-700 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                  </a>
                  <a href="https://buymeacoffee.com/olafdepolaf" target="_blank" rel="noopener noreferrer" title="Buy me a coffee" className="text-slate-400 hover:text-slate-700 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" /></svg>
                  </a>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap justify-center">
                  <a href="https://repository.overheid.nl/sru" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">Data: Overheid.nl</a>
                  <span>·</span>
                  <span className="flex items-center gap-1">Made with <AmsterdamHeartIcon className="w-3 h-3" /> in Amsterdam</span>
                  <span>·</span>
                  <span>Built with Claude Code</span>
                  <span>·</span>
                  <button onClick={() => setCurrentView('admin')} className="hover:text-slate-600 transition-colors">Admin</button>
                </div>
              </div>
            </footer></div></div>
      ) : (
        <div className="flex flex-col h-full">
          <header className="flex-none bg-white border-b h-16 px-4 flex items-center justify-between z-[2000] shadow-sm"><div onClick={handleReset} className="cursor-pointer flex items-center gap-3"><VerhuurRadarIcon className="w-8 h-8" /><div className="hidden sm:block"><span className="font-bold text-2xl"><span className="text-slate-900">Verhuur</span><span className="text-red-600">Radar</span></span></div></div><div className="flex-1 max-w-xl mx-auto hidden md:flex"><AddressSearch onAddressSelect={handleAddressSelect} isCompact initialValue={currentAddress?.weergavenaam} onClear={() => { }} onUseLocation={handleUseLocation} /></div><HeaderProfile onLogin={() => setIsAlertModalOpen(true)} onLogout={handleLogout} onShowAlerts={() => setIsShowAlertsModalOpen(true)} onShowProfile={() => setIsProfileModalOpen(true)} /></header>
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="flex flex-col flex-1">
              <div className="md:hidden p-2 bg-white border-b"><AddressSearch onAddressSelect={handleAddressSelect} isCompact initialValue={currentAddress?.weergavenaam} onClear={() => { }} onUseLocation={handleUseLocation} /></div>
              <div className="flex-1 relative">
                {foundPermits.length > 0 && <div className="absolute top-4 right-4 z-[999]"><StatsWidget permits={foundPermits} /></div>}
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
                <MapLegend />
              </div>
            </div>
            <div className={`w-full md:w-72 flex flex-col border-t md:border-t-0 md:border-r transition-all duration-300 ${isMobileListCollapsed ? 'h-14' : 'h-[45vh]'} md:h-full`}><ResultList locations={groupedLocations} onSelect={setSelectedLocationId} selectedLocationId={selectedLocationId} isLoading={loading} loadingStatus={loadingStatus} isMobileCollapsed={isMobileListCollapsed} onToggleMobileCollapse={() => setIsMobileListCollapsed(!isMobileListCollapsed)} hasActiveAlert={hasActiveAlert} onAlertClick={() => { if (currentUser && hasActiveAlert) { setIsShowAlertsModalOpen(true) } else { setIsAlertModalOpen(true) } }} searchedAddress={currentAddress?.weergavenaam} /></div></div></div>
      )}
      <AlertModal isOpen={isAlertModalOpen} onClose={() => { setIsAlertModalOpen(false); setLoginError(null); }} isLoggedIn={!!currentUser} hasActiveAlert={hasActiveAlert} onLogin={handleLogin} onSubscribe={handleSubscribe} onUnsubscribe={handleUnsubscribe} userEmail={currentUser?.email || ""} loginError={loginError} />
      <ShowAlertsModal isOpen={isShowAlertsModalOpen} onClose={() => setIsShowAlertsModalOpen(false)} alerts={savedAlerts} onSelectAlert={handleSelectSavedAlert} onRemoveAlert={handleRemoveSavedAlert} onToggleEmail={handleToggleAlertEmail} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} onDeleteAccount={handleDeleteAccount} />
    </div>
  );
}
export default VerhuurRadarApp;