import React, { useState, useMemo, useEffect } from 'react';
import AddressSearch from './components/AddressSearch';
import MapComponent from './components/MapComponent';
import ResultList from './components/ResultList';
import StatsWidget from './components/StatsWidget';
import MapLegend from './components/MapLegend';
import AlertModal from './components/AlertModal';
import ShowAlertsModal from './components/ShowAlertsModal';
import HeaderProfile from './components/HeaderProfile';
import ProfileModal from './components/ProfileModal';
import LandingPage from './components/LandingPage';
import { VerhuurRadarIcon } from './components/Icons';
import { AddressResult, GroupedLocation, MapFilters, PermitRecord, PermitStatus, LatLngCoordinate, SavedAlert, RDCoordinate } from './types';
import { fetchPermitsForYear, fetchRecentPermits, fetchActivePermitCount, searchAddress, lookupAddress } from './services/apiService';
import { parsePointString, wgs84ToRd } from './services/geoService';
import { useAuth } from './contexts/AuthContext';
import { loginWithGoogle, logout, deleteCurrentUserAccount } from './services/authService';
import { fetchAlerts, addAlert, removeAlert, toggleAlertEmail } from './services/alertService';
import { ALERTS_ENABLED } from './features';
import { PERMIT_YEARS, SEARCH_RADIUS_M, ACTIVE_YEAR, MAP_MOVE_THRESHOLD_DEG } from './constants';

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
  const [filters, setFilters] = useState<MapFilters>({ showActive: true, showInactive: true });
  const [modals, setModals] = useState({ alertOpen: false, showAlertsOpen: false, profileOpen: false, loginError: null as { type: string; message: string } | null });
  const setModal = (patch: Partial<typeof modals>) => setModals(prev => ({ ...prev, ...patch }));
  const [savedAlerts, setSavedAlerts] = useState<SavedAlert[]>([]);

  useEffect(() => {
    if (!ALERTS_ENABLED) return;
    if (currentUser) { fetchAlerts(currentUser.uid).then(setSavedAlerts); }
    else { setSavedAlerts([]); }
  }, [currentUser]);

  const hasActiveAlert = useMemo(
    () => ALERTS_ENABLED && savedAlerts.some(a => a.address === currentAddress?.weergavenaam),
    [currentAddress, savedAlerts]
  );

  useEffect(() => {
    fetchRecentPermits().then(setRecentPermits);
    fetchActivePermitCount().then(setTotalActiveCount);
  }, []);

  const groupedLocations: GroupedLocation[] = useMemo(() => {
    const byAddress = foundPermits.reduce((acc, p) => {
      if (!p.wgs84) return acc;
      if (!acc[p.address]) acc[p.address] = { address: p.address, wgs84: p.wgs84, status: PermitStatus.INACTIVE, permits: [] };
      acc[p.address].permits.push(p);
      if (p.date.startsWith(String(ACTIVE_YEAR))) acc[p.address].status = PermitStatus.ACTIVE;
      return acc;
    }, {} as { [key: string]: GroupedLocation });
    return (Object.values(byAddress) as GroupedLocation[])
      .filter(loc => loc.address !== "Adres onbekend")
      .sort((a, b) => a.address.localeCompare(b.address));
  }, [foundPermits]);

  const filteredLocations = useMemo(() =>
    groupedLocations.filter(loc =>
      loc.status === PermitStatus.ACTIVE ? filters.showActive : filters.showInactive
    ),
    [groupedLocations, filters]
  );

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
    setCurrentAddress({
      id: 'loc',
      weergavenaam: addressLabel,
      centroide_rd: `POINT(${rd.x} ${rd.y})`,
      centroide_ll: wgs ? `POINT(${wgs.lng} ${wgs.lat})` : '',
    } as AddressResult);
    setLoadingStatus("laden...");
    const results = await Promise.all(
      PERMIT_YEARS.map(y => fetchPermitsForYear(rd, SEARCH_RADIUS_M, y))
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
      const dist = Math.sqrt(
        Math.pow(center.lat - lastSearchedCenter.lat, 2) +
        Math.pow(center.lng - lastSearchedCenter.lng, 2)
      );
      if (dist > MAP_MOVE_THRESHOLD_DEG) setShowSearchHere(true);
    }
  };

  const handleSearchHere = () => {
    if (mapCenter) {
      const rd = wgs84ToRd(mapCenter.lat, mapCenter.lng);
      searchByRD(rd, mapCenter, "Geselecteerde locatie");
    }
  };

  const handleReset = () => setHasSearched(false);

  const handleRecentPermitClick = async (address: string) => {
    const suggestions = await searchAddress(address);
    if (suggestions[0]) {
      const full = await lookupAddress(suggestions[0].id);
      if (full) handleAddressSelect(full);
    }
  };

  const handleLogin = async () => {
    setModal({ loginError: null });
    try {
      await loginWithGoogle();
      setModal({ alertOpen: false });
    } catch (e: unknown) {
      const err = e as { code: string; message: string };
      setModal({ loginError: { type: err.code, message: err.message } });
    }
  };

  const handleLogout = async () => logout();
  const handleDeleteAccount = async () => { await deleteCurrentUserAccount(); setModal({ profileOpen: false }); };

  const handleSubscribe = async () => {
    if (currentUser && currentAddress) {
      await addAlert(currentUser.uid, currentAddress.weergavenaam);
      setSavedAlerts(prev => [...prev, { id: currentAddress.weergavenaam, address: currentAddress.weergavenaam, emailEnabled: true, createdAt: Date.now() }]);
      setModal({ alertOpen: false });
    }
  };

  const handleUnsubscribe = async () => {
    if (currentUser && currentAddress) {
      await removeAlert(currentUser.uid, currentAddress.weergavenaam);
      setSavedAlerts(prev => prev.filter(a => a.address !== currentAddress.weergavenaam));
      setModal({ alertOpen: false });
    }
  };

  const handleRemoveSavedAlert = async (address: string) => {
    if (currentUser) {
      await removeAlert(currentUser.uid, address);
      setSavedAlerts(prev => prev.filter(a => a.address !== address));
    }
  };

  const handleToggleAlertEmail = async (address: string) => {
    if (currentUser) {
      const alert = savedAlerts.find(a => a.address === address);
      if (alert) {
        await toggleAlertEmail(currentUser.uid, address, alert.emailEnabled);
        setSavedAlerts(prev => prev.map(a => a.address === address ? { ...a, emailEnabled: !a.emailEnabled } : a));
      }
    }
  };

  const handleSelectSavedAlert = (address: string) => {
    setModal({ showAlertsOpen: false });
    handleRecentPermitClick(address);
  };

  const handleAlertClick = () => {
    if (currentUser && hasActiveAlert) {
      setModal({ showAlertsOpen: true });
    } else {
      setModal({ alertOpen: true });
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col font-sans">
      {!hasSearched ? (
        <LandingPage
          recentPermits={recentPermits}
          totalActiveCount={totalActiveCount}
          onAddressSelect={handleAddressSelect}
          onUseLocation={handleUseLocation}
          onRecentPermitClick={handleRecentPermitClick}
        />
      ) : (
        <div className="flex flex-col h-full">
          <header className="flex-none bg-white/85 backdrop-blur-sm border-b border-slate-200 h-16 px-4 flex items-center justify-between z-[2000]">
            <div onClick={handleReset} className="cursor-pointer flex items-center gap-3">
              <VerhuurRadarIcon className="w-8 h-8" />
              <span className="font-bold text-xl">
                <span className="text-slate-900">Verhuur</span>
                <span className="text-red-600">Radar</span>
              </span>
            </div>
            <div className="flex-1 max-w-xl mx-auto hidden md:flex">
              <AddressSearch
                onAddressSelect={handleAddressSelect}
                isCompact
                initialValue={currentAddress?.weergavenaam}
                onClear={() => {}}
                onUseLocation={handleUseLocation}
              />
            </div>
            {ALERTS_ENABLED && (
              <HeaderProfile
                onLogin={() => setModal({ alertOpen: true })}
                onLogout={handleLogout}
                onShowAlerts={() => setModal({ showAlertsOpen: true })}
                onShowProfile={() => setModal({ profileOpen: true })}
              />
            )}
          </header>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="flex flex-col flex-1">
              <div className="md:hidden p-2 bg-white/85 backdrop-blur-sm border-b border-slate-200 relative z-[2500]">
                <AddressSearch
                  onAddressSelect={handleAddressSelect}
                  isCompact
                  initialValue={currentAddress?.weergavenaam}
                  onClear={() => {}}
                  onUseLocation={handleUseLocation}
                />
              </div>
              <div className="flex-1 relative">
                {foundPermits.length > 0 && (
                  <div className="absolute top-4 right-4 z-[999] hidden sm:block">
                    <StatsWidget permits={foundPermits} />
                  </div>
                )}
                {showSearchHere && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
                    <button
                      onClick={handleSearchHere}
                      className="bg-white text-slate-900 px-4 py-2 rounded-full shadow-lg font-semibold flex items-center gap-2 hover:bg-slate-50 border border-slate-200 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600">
                        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Zoek in dit gebied
                    </button>
                  </div>
                )}
                {userLocation && (
                  <MapComponent
                    center={userLocation}
                    locations={filteredLocations}
                    onMarkerClick={setSelectedLocationId}
                    selectedLocationId={selectedLocationId}
                    isMobileListCollapsed={isMobileListCollapsed}
                    onMapMoveEnd={handleMapMoveEnd}
                  />
                )}
                <div className="hidden sm:block">
                  <MapLegend />
                </div>
              </div>
            </div>

            <div className={`w-full md:w-72 flex flex-col border-t md:border-t-0 md:border-r transition-all duration-300 ${isMobileListCollapsed ? 'h-14' : 'h-[45vh]'} md:h-full`}>
              <ResultList
                locations={filteredLocations}
                onSelect={setSelectedLocationId}
                selectedLocationId={selectedLocationId}
                isLoading={loading}
                loadingStatus={loadingStatus}
                isMobileCollapsed={isMobileListCollapsed}
                onToggleMobileCollapse={() => setIsMobileListCollapsed(prev => !prev)}
                hasActiveAlert={ALERTS_ENABLED ? hasActiveAlert : undefined}
                onAlertClick={ALERTS_ENABLED ? handleAlertClick : undefined}
                searchedAddress={currentAddress?.weergavenaam}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </div>
        </div>
      )}

      {ALERTS_ENABLED && (
        <AlertModal
          isOpen={modals.alertOpen}
          onClose={() => setModal({ alertOpen: false, loginError: null })}
          isLoggedIn={!!currentUser}
          hasActiveAlert={hasActiveAlert}
          onLogin={handleLogin}
          onSubscribe={handleSubscribe}
          onUnsubscribe={handleUnsubscribe}
          userEmail={currentUser?.email || ""}
          loginError={modals.loginError}
        />
      )}
      {ALERTS_ENABLED && (
        <ShowAlertsModal
          isOpen={modals.showAlertsOpen}
          onClose={() => setModal({ showAlertsOpen: false })}
          alerts={savedAlerts}
          onSelectAlert={handleSelectSavedAlert}
          onRemoveAlert={handleRemoveSavedAlert}
          onToggleEmail={handleToggleAlertEmail}
        />
      )}
      {ALERTS_ENABLED && (
        <ProfileModal
          isOpen={modals.profileOpen}
          onClose={() => setModal({ profileOpen: false })}
          onDeleteAccount={handleDeleteAccount}
        />
      )}
    </div>
  );
}

export default VerhuurRadarApp;
