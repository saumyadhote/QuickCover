import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity as WebActivity, AlertTriangle, ShieldAlert as WebShieldAlert, Users as WebUsers, CloudLightning as WebCloudLightning, ShieldCheck as WebShieldCheck, RefreshCw as WebRefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:4000';

function App() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Poll backend every 2s
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/status`);
        setState(res.data);
      } catch (err) {
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerDisruption = async (type: string, severity: string, message: string) => {
    try {
      await axios.post(`${API_URL}/trigger-disruption`, {
        type,
        zone: 'NCR Region',
        severity,
        message
      });
    } catch (err) {
      console.error(err);
    }
  };

  const resetAll = async () => {
    try {
      await axios.post(`${API_URL}/reset`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !state) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#020617]">
        <div className="animate-pulse text-blue-500 font-bold text-xl flex items-center gap-3">
          <WebRefreshCw className="animate-spin" /> Connecting to Core...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white p-8 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/40 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <span className="text-2xl font-black text-white">QC</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">QuickCover <span className="font-light text-slate-400">Admin</span></h1>
              <p className="text-blue-400 text-sm font-medium tracking-widest uppercase mt-1">Live Telemetry & Underwriting</p>
            </div>
          </div>
          <button 
            onClick={resetAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all font-semibold text-slate-300 shadow-lg"
          >
            <WebRefreshCw size={18} /> Reset Demo Data
          </button>
        </header>

        {/* Global Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Active Workers */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-[100px] transition-all group-hover:scale-110" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <WebUsers className="text-emerald-400" size={24} />
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">LIVE</span>
            </div>
            <h3 className="text-slate-400 font-medium mb-1">Active Protected Trips</h3>
            <p className="text-4xl font-black">{state.isTripActive ? '1' : '0'}</p>
          </div>

          {/* At Risk Payouts */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-[100px] transition-all group-hover:scale-110" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <WebActivity className="text-blue-400" size={24} />
              </div>
            </div>
            <h3 className="text-slate-400 font-medium mb-1">Total Payouts Triggered</h3>
            <p className="text-4xl font-black">₹{state.weeklyProtected.toLocaleString()}</p>
          </div>

          {/* Global Network Status */}
          <div className={`glass-panel p-6 rounded-3xl relative overflow-hidden group ${state.disruption ? 'border-red-500/50 shadow-red-900/20' : ''}`}>
             <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] transition-all group-hover:scale-110 ${state.disruption ? 'bg-red-500/20' : 'bg-slate-600/10'}`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                {state.disruption ? (
                  <AlertTriangle className="text-red-500" size={24} />
                ) : (
                  <WebShieldCheck className="text-slate-400" size={24} />
                )}
              </div>
              {state.disruption && (
                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30 uppercase animate-pulse">
                  CRITICAL
                </span>
              )}
            </div>
            <h3 className="text-slate-400 font-medium mb-1">Grid Status</h3>
            <p className={`text-2xl font-black ${state.disruption ? 'text-red-400' : 'text-slate-200'}`}>
              {state.disruption ? state.disruption.type.toUpperCase() : 'NOMINAL'}
            </p>
          </div>

        </div>

        {/* Disruption Simulator */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-700/60 shadow-2xl shadow-blue-900/10 relative overflow-hidden">
          <div className="absolute -left-32 -top-32 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
          
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <WebCloudLightning className="text-blue-400" /> API Disruption Simulator
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl">
            As an underwriter, trigger Mock API events simulating external civic or environmental hazards. If a gig worker has an active trip when standard thresholds are breached, a claim is auto-generated.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Action 1 */}
            <button 
              onClick={() => triggerDisruption('Flood', 'critical', 'Severe waterlogging reported in Sector 42.')}
              className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 p-6 rounded-2xl text-left transition-all group shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform"><WebCloudLightning size={20}/></div>
                <h4 className="font-bold text-lg">Flash Flood Warning</h4>
              </div>
              <p className="text-slate-400 text-sm">Simulates sudden heavy rainfall and zone waterlogging thresholds breached.</p>
            </button>

            {/* Action 2 */}
            <button 
              onClick={() => triggerDisruption('Pollution', 'high', 'AQI crossed 450 in primary delivery grid.')}
               className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-orange-500/50 p-6 rounded-2xl text-left transition-all group shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 group-hover:scale-110 transition-transform"><WebActivity size={20}/></div>
                <h4 className="font-bold text-lg">Severe AQI Spike</h4>
              </div>
              <p className="text-slate-400 text-sm">Triggers hazardous air quality limits. Automatically protects workers outdoors.</p>
            </button>

            {/* Action 3 */}
            <button 
              onClick={() => triggerDisruption('Curfew', 'critical', 'Unplanned Section 144 grid disruption.')}
               className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 p-6 rounded-2xl text-left transition-all group shadow-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform"><WebShieldAlert size={20}/></div>
                <h4 className="font-bold text-lg">Civic Disruption</h4>
              </div>
              <p className="text-slate-400 text-sm">Mocks an external localized curfew or emergency roadblock zone mapping.</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
