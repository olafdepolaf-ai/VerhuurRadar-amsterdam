import React, { useEffect, useState } from 'react';
import { getTodaySearchCount, getRecentSearches, SearchLog } from '../services/adminService';

interface AdminPageProps {
  onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const count = await getTodaySearchCount();
        const recent = await getRecentSearches(10);
        setTodayCount(count);
        setRecentSearches(recent);
      } catch (error) {
        console.error("Error loading admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Onbekend';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('nl-NL');
  };

  return (
    <div className="h-screen w-full flex flex-col font-sans bg-slate-50">
      <header className="flex-none bg-white border-b h-16 px-4 flex items-center justify-between shadow-sm z-[2000]">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            <span className="font-medium">Terug naar App</span>
          </button>
        </div>
        <div className="font-bold text-xl text-slate-900">Admin Dashboard</div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Systeem Overzicht</h1>
            <p className="text-slate-500 mt-2">Inzicht in het gebruik en de prestaties van VerhuurRadar.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Gebruik Metrics Kaart */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="font-semibold text-slate-800">Zoekopdrachten Vandaag</h2>
                </div>
                <div className="p-6 flex-grow flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-red-600 mb-2">
                      {todayCount !== null ? todayCount : '-'}
                    </div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                      Uitgevoerde zoekopdrachten
                    </div>
                  </div>
                </div>
              </div>

              {/* Recente Zoekopdrachten Kaart */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h2 className="font-semibold text-slate-800">Laatste 10 Zoekopdrachten</h2>
                </div>
                <div className="flex-grow overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-6 py-3 font-medium">Tijdstip</th>
                        <th className="px-6 py-3 font-medium">Adres</th>
                        <th className="px-6 py-3 font-medium">Sessie / Gebruiker ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentSearches.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                            Geen zoekopdrachten gevonden.
                          </td>
                        </tr>
                      ) : (
                        recentSearches.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="px-6 py-3 text-slate-500">{formatTimestamp(log.timestamp)}</td>
                            <td className="px-6 py-3 font-medium text-slate-700">{log.address}</td>
                            <td className="px-6 py-3 font-mono text-xs text-slate-400">{log.userId || 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Placeholder voor toekomstige metrics (Health / Performance) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col opacity-50 border-dashed">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="font-semibold text-slate-800">Systeem Health (Binnenkort)</h2>
                </div>
                <div className="p-6 flex-grow flex items-center justify-center">
                  <span className="text-sm text-slate-400 font-medium">API Response tijden & Fouten</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
