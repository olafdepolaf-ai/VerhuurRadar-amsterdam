import React, { useState, useMemo, useEffect } from 'react';
import AddressSearch from './components/AddressSearch';
import MapComponent from './components/MapComponent';
import ResultList from './components/ResultList';
import StatsWidget from './components/StatsWidget';
import FAQSection from './components/FAQSection';
import MapLegend from './components/MapLegend';
import AlertModal from './components/AlertModal';
import ShowAlertsModal from './components/ShowAlertsModal';
import HeaderProfile from './components/HeaderProfile';
import ProfileModal from './components/ProfileModal';
import { AddressResult, GroupedLocation, PermitRecord, PermitStatus, LatLngCoordinate, SavedAlert } from './types';
import { fetchPermitsForYear, fetchRecentPermits, fetchActivePermitCount, searchAddress, lookupAddress } from './services/apiService';
import { parsePointString } from './services/geoService';
import { useAuth } from './contexts/AuthContext';
import { loginWithGoogle, logout, deleteCurrentUserAccount } from './services/authService';
import { fetchAlerts, addAlert, removeAlert, toggleAlertEmail } from './services/alertService';

// Force Update: 1722424800000

const VerhuurRadarIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" className="fill-red-600"/><circle cx="50" cy="50" r="38" className="stroke-white/20" strokeWidth="4"/><circle cx="50" cy="50" r="26" className="stroke-white/30" strokeWidth="4"/><circle cx="50" cy="50" r="14" className="stroke-white/40" strokeWidth="4"/><line x1="50" y1="50" x2="82" y2="18" className="stroke-white" strokeWidth="4" strokeLinecap="round"/><circle cx="50" cy="50" r="5" className="fill-white"/><g transform="translate(0, 5)"><path d="M22 85V68l8-8 8 8v17H22z" className="fill-white"/><rect x="25" y="72" width="3" height="4" className="fill-red-600"/><rect x="31" y="72" width="3" height="4" className="fill-red-600"/><path d="M40 85V62l10-10 10 10v23H40z" className="fill-white"/><rect x="44" y="65" width="3" height="4" className="fill-red-600"/><rect x="53" y="65" width="3" height="4" className="fill-red-600"/><rect x="44" y="73" width="3" height="4" className="fill-red-600"/><rect x="53" y="73" width="3" height="4" className="fill-red-600"/><path d="M62 85V68l8-8 8 8v17H62z" className="fill-white"/><rect x="65" y="72" width="3" height="4" className="fill-red-600"/><rect x="71" y="72" width="3" height="4" className="fill-red-600"/></g></svg>;
const AmsterdamHeartIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" className={className}><defs><clipPath id="h"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></clipPath></defs><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#dc2626"/><rect x="0" y="8.5" width="24" height="7" fill="black" clipPath="url(#h)"/><path d="M6 10.5L9 13.5M9 10.5L6 13.5" stroke="white" strokeWidth="1.5"/><path d="M10.5 10.5L13.5 13.5M13.5 10.5L10.5 13.5" stroke="white" strokeWidth="1.5"/><path d="M15 10.5L18 13.5M18 10.5L15 13.5" stroke="white" strokeWidth="1.5"/></svg>;

function App() {
  const { currentUser } = useAuth();
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [currentAddress, setCurrentAddress] = useState<AddressResult | null>(null);
  const [foundPermits, setFoundPermits] = useState<PermitRecord[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>();
  const [userLocation, setUserLocation] = useState<LatLngCoordinate | null>(null);
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
  
  const formatRelativeDate = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day:'numeric', month:'long', year:'numeric' });

  // Fix: Added a type assertion to the result of `Object.values` to correctly type sort parameters.
  const groupedLocations: GroupedLocation[] = useMemo(() => (Object.values(foundPermits.reduce((acc, p) => {
    if (!p.wgs84) return acc;
    if (!acc[p.address]) acc[p.address] = { address: p.address, wgs84: p.wgs84, status: PermitStatus.INACTIVE, permits: [] };
    acc[p.address].permits.push(p);
    if (p.date.startsWith('2025')) acc[p.address].status = PermitStatus.ACTIVE;
    return acc;
  }, {} as { [key: string]: GroupedLocation })) as GroupedLocation[]).sort((a,b) => a.address.localeCompare(b.address)), [foundPermits]);

  const handleAddressSelect = async (addr: AddressResult) => {
    if (!addr.centroide_rd || !addr.centroide_ll) return;
    setFoundPermits([]); setCurrentAddress(addr); setHasSearched(true); setLoading(true);
    const wgs = parsePointString(addr.centroide_ll);
    const rd = parsePointString(addr.centroide_rd);
    if (wgs) setUserLocation({ lat: wgs.y, lng: wgs.x });
    if (rd) { for (let y=2025; y>=2021; y--) { setLoadingStatus(String(y)); const p=await fetchPermitsForYear(rd,200,y); setFoundPermits(prev=>[...prev,...p]); }}
    setLoading(false);
  };
  
  const handleReset = () => { setHasSearched(false); };
  const handleRecentPermitClick = async (a: string) => { const s = await searchAddress(a); if(s[0]){const f=await lookupAddress(s[0].id); if(f)handleAddressSelect(f);} };
  const handleLogin = async () => { setLoginError(null); try { await loginWithGoogle(); setIsAlertModalOpen(false); } catch (e: any) { setLoginError({type: e.code, message: e.message}); } };
  const handleLogout = async () => { await logout(); };
  const handleDeleteAccount = async () => { await deleteCurrentUserAccount(); setIsProfileModalOpen(false); };
  const handleSubscribe = async () => { if (currentUser && currentAddress) { await addAlert(currentUser.uid, currentAddress.weergavenaam); setSavedAlerts(p=>[...p,{id: currentAddress.weergavenaam, address: currentAddress.weergavenaam, emailEnabled: true, createdAt: Date.now()}]); setIsAlertModalOpen(false); } };
  const handleUnsubscribe = async () => { if (currentUser && currentAddress) { await removeAlert(currentUser.uid, currentAddress.weergavenaam); setSavedAlerts(p=>p.filter(a=>a.address !== currentAddress.weergavenaam)); setIsAlertModalOpen(false); } };
  const handleRemoveSavedAlert = async (a: string) => { if (currentUser) { await removeAlert(currentUser.uid, a); setSavedAlerts(p=>p.filter(i=>i.address !== a)); } };
  const handleToggleAlertEmail = async (a: string) => { if (currentUser) { const al=savedAlerts.find(i=>i.address===a); if(al) { await toggleAlertEmail(currentUser.uid, a, al.emailEnabled); setSavedAlerts(p=>p.map(i=>i.address===a?{...i,emailEnabled:!i.emailEnabled}:i)); } } };
  const handleSelectSavedAlert = (a: string) => { setIsShowAlertsModalOpen(false); handleRecentPermitClick(a); };
  
  return (
    <div className="h-screen w-full flex flex-col font-sans">
      {!hasSearched ? (
        <div className="flex-1 overflow-y-auto"><div className="min-h-full flex flex-col items-center p-6"><div className="w-full max-w-xl text-center flex-grow pt-10"><div className="mb-6 flex items-center justify-center gap-3"><VerhuurRadarIcon className="w-16 h-16"/><h1 className="text-6xl font-bold"><span className="text-slate-900">Verhuur</span><span className="text-red-600">Radar</span></h1></div><p className="text-lg text-slate-600 mb-8">Inzicht in alle vergunningen voor vakantieverhuur in Amsterdam.</p><AddressSearch onAddressSelect={handleAddressSelect}/><div className="w-full max-w-md space-y-3 mt-10">{recentPermits.length>0 && <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Laatst verleend</div>}{recentPermits.map(p=><div key={p.id} onClick={()=>handleRecentPermitClick(p.address)} className="bg-white border rounded p-3 flex justify-between items-center cursor-pointer hover:bg-red-50"><span className="font-semibold text-sm">{p.address}</span><span className="text-xs text-slate-500">{formatRelativeDate(p.date)}</span></div>)}</div>{totalActiveCount && <div className="mt-8 text-center"><div className="bg-red-50 border rounded-lg p-4"><p className="font-medium mb-2">Vandaag zijn er <span className="font-bold text-red-600">{totalActiveCount.toLocaleString('nl-NL')}</span> vergunningen actief</p><a href="https://www.amsterdam.nl/wonen-leven/wonen/vakantieverhuur/" target="_blank" rel="noopener noreferrer" className="text-red-600 text-sm font-semibold hover:underline">Meer info op Amsterdam.nl →</a></div></div>}<FAQSection/></div><footer className="w-full mt-16 pb-6 text-center"><div className="flex flex-col items-center gap-2"><div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider"><span>Made with</span><AmsterdamHeartIcon className="w-4 h-4"/><span>in Amsterdam</span></div><div className="text-slate-300 text-[10px]">Data bron: Overheid.nl</div></div></footer></div></div>
      ) : (
        <div className="flex flex-col h-full"><header className="flex-none bg-white border-b h-16 px-4 flex items-center justify-between z-[2000] shadow-sm"><div onClick={handleReset} className="cursor-pointer flex items-center gap-3"><VerhuurRadarIcon className="w-8 h-8"/><div className="hidden sm:block"><span className="font-bold text-2xl"><span className="text-slate-900">Verhuur</span><span className="text-red-600">Radar</span></span></div></div><div className="flex-1 max-w-xl mx-auto hidden md:flex"><AddressSearch onAddressSelect={handleAddressSelect} isCompact initialValue={currentAddress?.weergavenaam} onClear={()=>{}}/></div><HeaderProfile onLogin={()=>setIsAlertModalOpen(true)} onLogout={handleLogout} onShowAlerts={()=>setIsShowAlertsModalOpen(true)} onShowProfile={()=>setIsProfileModalOpen(true)}/></header><div className="flex-1 flex flex-col md:flex-row overflow-hidden"><div className="flex flex-col flex-1"><div className="md:hidden p-2 bg-white border-b"><AddressSearch onAddressSelect={handleAddressSelect} isCompact initialValue={currentAddress?.weergavenaam} onClear={()=>{}}/></div><div className="flex-1 relative"><div className="absolute top-4 right-4 z-[999]"><StatsWidget permits={foundPermits}/></div>{userLocation && <MapComponent center={userLocation} locations={groupedLocations} onMarkerClick={setSelectedLocationId} selectedLocationId={selectedLocationId} isMobileListCollapsed={isMobileListCollapsed}/>}<MapLegend/></div></div><div className={`w-full md:w-72 flex flex-col border-t md:border-t-0 md:border-r transition-all duration-300 ${isMobileListCollapsed?'h-14':'h-[45vh]'} md:h-full`}><ResultList locations={groupedLocations} onSelect={setSelectedLocationId} selectedLocationId={selectedLocationId} isLoading={loading} loadingStatus={loadingStatus} isMobileCollapsed={isMobileListCollapsed} onToggleMobileCollapse={()=>setIsMobileListCollapsed(!isMobileListCollapsed)} hasActiveAlert={hasActiveAlert} onAlertClick={()=>{if(currentUser&&hasActiveAlert){setIsShowAlertsModalOpen(true)}else{setIsAlertModalOpen(true)}}}/></div></div></div>
      )}
      <AlertModal isOpen={isAlertModalOpen} onClose={()=>{setIsAlertModalOpen(false);setLoginError(null);}} isLoggedIn={!!currentUser} hasActiveAlert={hasActiveAlert} onLogin={handleLogin} onSubscribe={handleSubscribe} onUnsubscribe={handleUnsubscribe} userEmail={currentUser?.email||""} loginError={loginError}/>
      <ShowAlertsModal isOpen={isShowAlertsModalOpen} onClose={()=>setIsShowAlertsModalOpen(false)} alerts={savedAlerts} onSelectAlert={handleSelectSavedAlert} onRemoveAlert={handleRemoveSavedAlert} onToggleEmail={handleToggleAlertEmail}/>
      <ProfileModal isOpen={isProfileModalOpen} onClose={()=>setIsProfileModalOpen(false)} onDeleteAccount={handleDeleteAccount}/>
    </div>
  );
}
export default App;