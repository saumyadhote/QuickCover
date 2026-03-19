import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity as WebActivity, AlertTriangle, ShieldAlert as WebShieldAlert, Users as WebUsers, CloudLightning as WebCloudLightning, ShieldCheck as WebShieldCheck, RefreshCw as WebRefreshCw } from 'lucide-react';
import qcLogo from './assets/qclogo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type RiskLevel = 'Low' | 'Medium' | 'High' | string;

type DashboardState = {
  isTripActive: boolean;
  currentMicroFee?: number;
  disruption: boolean;
  currentRiskLevel: RiskLevel;
};

function App() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);

  // Poll backend every 2s
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/status`);
        setState(res.data as DashboardState);
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
      <div className="flex h-screen w-full items-center justify-center bg-[#FAFAFA] text-[#333333]">
        <div className="animate-pulse text-[#2563EB] font-bold text-xl flex items-center gap-3">
          <WebRefreshCw className="animate-spin" /> Connecting to Core...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-[#333333] flex">
      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 bg-white border-r border-[#E5E5E5] p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-[8px] bg-[#2563EB] flex items-center justify-center text-white font-semibold text-sm">
            QC
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm">QuickCover</div>
            <div className="text-[14px] text-[#333333]">Admin</div>
          </div>
        </div>

        <nav className="space-y-2">
          <a className="block rounded-[8px] px-3 py-2 text-[14px] text-[#333333] hover:bg-[#2563EB]/5 transition-colors" href="#">
            Dashboard
          </a>
          <a className="block rounded-[8px] px-3 py-2 text-[14px] text-[#333333] hover:bg-[#2563EB]/5 transition-colors" href="#">
            Integrations
          </a>
          <a className="block rounded-[8px] px-3 py-2 text-[14px] text-[#333333] hover:bg-[#2563EB]/5 transition-colors" href="#">
            Simulator
          </a>
        </nav>

        <div className="mt-8 text-[14px] text-[#333333]">
          Live Telemetry & Underwriting
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-[#E5E5E5] shadow-sm flex items-center justify-between px-6">
          <div className="flex flex-col">
            <img src={qcLogo} alt="QuickCover" className="h-8 w-auto mb-1" />
            <div className="text-[14px] text-[#333333]">Live Telemetry & Underwriting</div>
          </div>

          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-5 py-3 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[14px] transition-colors"
          >
            <WebRefreshCw size={18} /> Reset Demo Data
          </button>
        </header>

        <main className="flex-1 p-6 overflow-auto bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto">
            {/* Global Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Active Deliveries */}
              <div className="bg-white border border-[#E5E5E5] rounded-[8px] p-4 transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-[#2563EB]/5 rounded-[8px] border border-[#E5E5E5]">
                    <WebUsers className="text-[#2563EB]" size={24} />
                  </div>
                  <span className="px-3 py-1 bg-white text-[#888888] text-[12px] font-medium rounded-[8px] border border-[#E5E5E5] uppercase tracking-[0.05em]">
                    MOCK SCALE
                  </span>
                </div>
                <h3 className="text-[12px] font-medium text-[#888888] uppercase tracking-[0.05em] mb-1">Live Active Deliveries</h3>
                <p className="text-4xl font-semibold">{state.isTripActive ? '24,893' : '24,892'}</p>
              </div>

              {/* Daily Premium Volume */}
              <div className="bg-white border border-[#E5E5E5] rounded-[8px] p-4 transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-[#2563EB]/5 rounded-[8px] border border-[#E5E5E5]">
                    <WebActivity className="text-[#2563EB]" size={24} />
                  </div>
                </div>
                <h3 className="text-[12px] font-medium text-[#888888] uppercase tracking-[0.05em] mb-1">24h Premium Volume (Gross)</h3>
                <p className="text-4xl font-semibold text-[#2563EB]">
                  ₹{((state.currentMicroFee || 2.0) * 213120).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>

              {/* Estimated Daily Profit */}
              <div className="bg-white rounded-[8px] p-4 border border-[#E5E5E5] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`p-3 rounded-[8px] border ${
                      state.disruption ? 'bg-red-50 border-red-200' : 'bg-[#2563EB]/5 border-[#E5E5E5]'
                    }`}
                  >
                    {state.disruption ? (
                      <AlertTriangle className="text-red-600" size={24} />
                    ) : (
                      <WebShieldCheck className="text-[#2563EB]" size={24} />
                    )}
                  </div>
                  <span
                    className="px-3 py-1 bg-white text-[#888888] text-[12px] font-medium rounded-[8px] border border-[#E5E5E5] uppercase tracking-[0.05em]"
                  >
                    {state.disruption
                      ? 'PAYOUT RISK SPIKE'
                      : `${state.currentRiskLevel === 'Low' ? '92%' : state.currentRiskLevel === 'Medium' ? '78%' : '45%'} MARGIN`}
                  </span>
                </div>
                <h3 className="text-[12px] font-medium text-[#888888] uppercase tracking-[0.05em] mb-1">Estimated Net Profit (Daily)</h3>
                <p
                  className={`text-4xl font-semibold ${
                    state.disruption ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {state.disruption
                    ? '₹' +
                      (((state.currentMicroFee || 2.0) * 213120) * 0.15).toLocaleString('en-IN', {
                        maximumFractionDigits: 0
                      })
                    : '₹' +
                      (((state.currentMicroFee || 2.0) * 213120) *
                        (state.currentRiskLevel === 'Low'
                          ? 0.92
                          : state.currentRiskLevel === 'Medium'
                            ? 0.78
                            : 0.45)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {/* Enterprise Partners B2B Section */}
            <div className="mb-10">
              <h2 className="text-[20px] font-semibold text-[#111111] mb-6 flex items-center gap-3">
                <WebCloudLightning className="text-[#2563EB]" /> Enterprise Integrations (B2B)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blinkit Partner Card */}
                <div className="bg-white border border-[#E5E5E5] rounded-[8px] p-4 transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[8px] bg-yellow-400 flex items-center justify-center font-semibold text-[#111111] text-[14px]">
                        B
                      </div>
                      <div>
                        <h3 className="text-[14px] font-semibold text-[#111111]">Blinkit</h3>
                        <p className="text-[14px] text-[#333333]">Delivery Partner API</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white text-[#888888] text-[12px] font-medium rounded-[8px] border border-[#E5E5E5] uppercase tracking-[0.05em]">
                      CONNECTED
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-[8px] border border-[#E5E5E5] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                      <p className="text-[12px] font-medium text-[#888888] uppercase tracking-[0.05em] mb-1">
                        Active Webhook (Payout Sync)
                      </p>
                      <p className="text-[14px] text-[#333333] break-all">
                        https://api.blinkit.co.in/v1/quickcover/payout
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-[8px] border border-[#E5E5E5] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                      <p className="text-[12px] font-medium text-[#888888] uppercase tracking-[0.05em] mb-1">
                        Live Worker Telemetry Pool
                      </p>
                      <p className="text-[14px] font-medium text-[#333333]">114,208 Riders (NCR Region)</p>
                    </div>
                  </div>
                </div>

                {/* ML Dynamic Pricing Engine Card */}
                <div className="bg-white border border-[#E5E5E5] rounded-[8px] p-4 transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#2563EB]/10 rounded-[8px] text-[#2563EB]">
                        <WebActivity size={24} />
                      </div>
                      <h3 className="text-[14px] font-semibold text-[#111111]">ML Forecast Engine</h3>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await axios.post(`${API_URL}/refresh-forecast`);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="px-5 py-3 bg-white hover:bg-[#F5F5F5] rounded-[8px] text-[14px] font-semibold text-[#111111] flex items-center gap-1.5 transition-colors border border-[#E5E5E5]"
                    >
                      <WebRefreshCw size={14} /> REFRESH
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-[12px] font-medium text-[#888888] uppercase tracking-[0.05em] mb-1">
                        Current Micro-Fee
                      </p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-semibold text-[#111111]">₹{state.currentMicroFee?.toFixed(2)}</p>
                        <p className="text-[14px] text-[#333333] font-medium">/ order</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[12px] font-medium text-[#888888] uppercase tracking-[0.05em] mb-1">
                        Predicted Risk
                      </p>
                      <div
                        className="inline-flex px-3 py-1 rounded-[8px] text-[12px] font-medium border border-[#E5E5E5] text-[#888888] uppercase tracking-[0.05em]"
                      >
                        {state.currentRiskLevel?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="text-[14px] text-[#333333] bg-white p-4 rounded-[8px] border border-[#E5E5E5] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                    <p>Fee auto-fluctuates (₹1.5 - ₹4) based on real-time external API streams (IMD Weather, Traffic, AQI).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disruption Simulator */}
            <div className="bg-white rounded-[8px] p-4 border border-[#E5E5E5] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <h2 className="text-[20px] font-semibold text-[#111111] mb-2 flex items-center gap-3">
                <WebCloudLightning className="text-[#2563EB]" /> API Disruption Simulator
              </h2>
              <p className="text-[14px] text-[#333333] mb-8 max-w-2xl">
                As an underwriter, trigger Mock API events simulating external civic or environmental hazards. If a gig worker has an active trip when standard thresholds are breached, a claim is auto-generated.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Action 1 */}
                <button
                  onClick={() => triggerDisruption('Flood', 'critical', 'Severe waterlogging reported in Sector 42.')}
                  className="bg-white border border-[#E5E5E5] p-4 rounded-[8px] text-left transition-colors hover:bg-[#F5F5F5] group text-[#111111]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-[#2563EB]/10 rounded-[8px] text-[#2563EB] group-hover:scale-105 transition-transform">
                      <WebCloudLightning size={20} />
                    </div>
                    <h4 className="text-[12px] font-medium text-[#888888] uppercase tracking-[0.05em]">Flash Flood Warning</h4>
                  </div>
                  <p className="text-[14px] text-[#333333]">
                    Simulates sudden heavy rainfall and zone waterlogging thresholds breached.
                  </p>
                </button>

                {/* Action 2 */}
                <button
                  onClick={() => triggerDisruption('Pollution', 'high', 'AQI crossed 450 in primary delivery grid.')}
                  className="bg-white border border-[#E5E5E5] p-4 rounded-[8px] text-left transition-colors hover:bg-[#F5F5F5] group text-[#111111]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-100 rounded-[8px] text-orange-700 group-hover:scale-105 transition-transform">
                      <WebActivity size={20} />
                    </div>
                    <h4 className="text-[12px] font-medium text-[#888888] uppercase tracking-[0.05em]">Severe AQI Spike</h4>
                  </div>
                  <p className="text-[14px] text-[#333333]">
                    Triggers hazardous air quality limits. Automatically protects workers outdoors.
                  </p>
                </button>

                {/* Action 3 */}
                <button
                  onClick={() => triggerDisruption('Curfew', 'critical', 'Unplanned Section 144 grid disruption.')}
                  className="bg-white border border-[#E5E5E5] p-4 rounded-[8px] text-left transition-colors hover:bg-[#F5F5F5] group text-[#111111]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-[8px] text-purple-700 group-hover:scale-105 transition-transform">
                      <WebShieldAlert size={20} />
                    </div>
                    <h4 className="text-[12px] font-medium text-[#888888] uppercase tracking-[0.05em]">Civic Disruption</h4>
                  </div>
                  <p className="text-[14px] text-[#333333]">
                    Mocks an external localized curfew or emergency roadblock zone mapping.
                  </p>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
