import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity as WebActivity,
  AlertTriangle,
  ShieldAlert as WebShieldAlert,
  Users as WebUsers,
  CloudLightning as WebCloudLightning,
  ShieldCheck as WebShieldCheck,
  RefreshCw as WebRefreshCw,
} from 'lucide-react';
import qcLogo from './assets/qclogo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type RiskLevel = 'Low' | 'Medium' | 'High' | string;

type DashboardState = {
  isTripActive: boolean;
  currentMicroFee?: number;
  disruption: boolean;
  currentRiskLevel: RiskLevel;
};

function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<string, string> = {
    Low: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
    Medium: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    High: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-[12px] font-semibold border uppercase tracking-[0.05em] ${styles[level] || 'bg-[#F5F5F5] text-[#888888] border-[#E5E5E5]'
        }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${level === 'Low'
          ? 'bg-[#16A34A]'
          : level === 'Medium'
            ? 'bg-[#D97706]'
            : 'bg-[#DC2626]'
          }`}
      />
      {level}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full ${active ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`}
      />
      <span
        className={`text-[12px] font-semibold uppercase tracking-[0.05em] ${active ? 'text-[#16A34A]' : 'text-[#DC2626]'
          }`}
      >
        {active ? 'Connected' : 'Offline'}
      </span>
    </span>
  );
}

function App() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);

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
        message,
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
      <div className="flex h-screen w-full items-center justify-center bg-[#FAFAFA]">
        <div className="animate-pulse text-[#2563EB] font-bold text-xl flex items-center gap-3">
          <WebRefreshCw className="animate-spin" /> Connecting to Core...
        </div>
      </div>
    );
  }

  const grossPremium = (state.currentMicroFee || 2.0) * 213120;
  const marginRate =
    state.currentRiskLevel === 'Low'
      ? 0.92
      : state.currentRiskLevel === 'Medium'
        ? 0.78
        : 0.45;
  const netProfit = state.disruption ? grossPremium * 0.15 : grossPremium * marginRate;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#333333]">

      {/* Top Navbar */}
      <header className="h-14 bg-[#111111] border-b border-[#333333] flex items-center justify-between px-8 mt-5 mx-6 rounded-[12px]">        <div className="flex items-center gap-6">
        <img src={qcLogo} alt="QuickCover" className="h-7 w-auto" />
        <div className="h-4 w-px bg-[#333333]" />
        <nav className="flex items-center gap-1">
        

        </nav>
      </div>

        <div className="flex items-center gap-4">
          {state.disruption && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[12px] font-semibold uppercase tracking-[0.05em]">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
              Disruption Active
            </span>
          )}
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#111111] hover:bg-[#222222] text-white text-[13px] font-semibold transition-colors"
          >
            <WebRefreshCw size={14} /> Reset Demo
          </button>
        </div>
      </header >

      {/* Main Content */}
      < main className="p-6 max-w-7xl mx-auto" >

        {/* Bento Grid */}
        < div className="grid grid-cols-4 gap-4 auto-rows-auto" >

          {/* Card 1 — Live Active Deliveries (span 1) */}
          < div className="col-span-1 bg-white border border-[#E5E5E5] rounded-[12px] p-5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow" >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[#EFF6FF] rounded-[8px]">
                <WebUsers className="text-[#2563EB]" size={18} />
              </div>
              <span className="text-[11px] font-medium text-[#888888] uppercase tracking-[0.06em]">Mock Scale</span>
            </div>
            <p className="text-[11px] font-medium text-[#888888] uppercase tracking-[0.06em] mb-1">
              Live Active Deliveries
            </p>
            <p className="text-[32px] font-bold text-[#111111] leading-tight">
              {state.isTripActive ? '24,893' : '24,892'}
            </p>
            <div className="mt-3">
              <StatusDot active={true} />
            </div>
          </div >

          {/* Card 2 — Gross Premium (span 1) */}
          < div className="col-span-1 bg-white border border-[#E5E5E5] rounded-[12px] p-5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow" >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[#EFF6FF] rounded-[8px]">
                <WebActivity className="text-[#2563EB]" size={18} />
              </div>
            </div>
            <p className="text-[11px] font-medium text-[#888888] uppercase tracking-[0.06em] mb-1">
              24h Premium Volume
            </p>
            <p className="text-[32px] font-bold text-[#2563EB] leading-tight">
              ₹{grossPremium.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[12px] text-[#888888] mt-2">Gross collected today</p>
          </div >

          {/* Card 3 — Net Profit (span 1) */}
          < div
            className={`col-span-1 rounded-[12px] p-5 border hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow ${state.disruption
              ? 'bg-[#FEF2F2] border-[#FECACA]'
              : 'bg-[#F0FDF4] border-[#BBF7D0]'
              }`
            }
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-2 rounded-[8px] ${state.disruption ? 'bg-[#FECACA]' : 'bg-[#BBF7D0]'
                  }`}
              >
                {state.disruption ? (
                  <AlertTriangle className="text-[#DC2626]" size={18} />
                ) : (
                  <WebShieldCheck className="text-[#16A34A]" size={18} />
                )}
              </div>
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.06em] ${state.disruption ? 'text-[#DC2626]' : 'text-[#16A34A]'
                  }`}
              >
                {state.disruption ? 'Payout Risk' : `${Math.round(marginRate * 100)}% Margin`}
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#888888] uppercase tracking-[0.06em] mb-1">
              Est. Net Profit (Daily)
            </p>
            <p
              className={`text-[32px] font-bold leading-tight ${state.disruption ? 'text-[#DC2626]' : 'text-[#16A34A]'
                }`}
            >
              ₹{netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div >

          {/* Card 4 — Risk Level (span 1) */}
          < div className="col-span-1 bg-white border border-[#E5E5E5] rounded-[12px] p-5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow" >
            <div className="mb-4">
              <p className="text-[11px] font-medium text-[#888888] uppercase tracking-[0.06em] mb-3">
                Current Risk Level
              </p>
              <RiskBadge level={state.currentRiskLevel} />
            </div>
            <p className="text-[11px] font-medium text-[#888888] uppercase tracking-[0.06em] mb-1">
              Current Micro-Fee
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-[28px] font-bold text-[#111111]">
                ₹{state.currentMicroFee?.toFixed(2)}
              </p>
              <p className="text-[13px] text-[#888888]">/ order</p>
            </div>
          </div >

          {/* Card 5 — Blinkit Integration (span 2) */}
          < div className="col-span-2 bg-white border border-[#E5E5E5] rounded-[12px] p-5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow" >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[8px] bg-yellow-400 flex items-center justify-center font-bold text-[#111111] text-[15px]">
                  B
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#111111]">Blinkit</h3>
                  <p className="text-[12px] text-[#888888]">Delivery Partner API</p>
                </div>
              </div>
              <StatusDot active={true} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#FAFAFA] p-3 rounded-[8px] border border-[#E5E5E5]">
                <p className="text-[11px] font-medium text-[#888888] uppercase tracking-[0.06em] mb-1">
                  Active Webhook
                </p>
                <p className="text-[12px] text-[#333333] break-all">
                  api.blinkit.co.in/v1/quickcover/payout
                </p>
              </div>
              <div className="bg-[#FAFAFA] p-3 rounded-[8px] border border-[#E5E5E5]">
                <p className="text-[11px] font-medium text-[#888888] uppercase tracking-[0.06em] mb-1">
                  Worker Pool
                </p>
                <p className="text-[14px] font-semibold text-[#111111]">114,208 Riders</p>
                <p className="text-[12px] text-[#888888]">NCR Region</p>
              </div>
            </div>
          </div >

          {/* Card 6 — ML Forecast Engine (span 2) */}
          < div className="col-span-2 bg-white border border-[#E5E5E5] rounded-[12px] p-5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow" >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#EFF6FF] rounded-[8px]">
                  <WebActivity className="text-[#2563EB]" size={18} />
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-[6px] text-[12px] font-semibold text-[#111111] border border-[#E5E5E5] transition-colors"
              >
                <WebRefreshCw size={12} /> Refresh
              </button>
            </div>

            <p className="text-[12px] text-[#888888] bg-[#FAFAFA] p-3 rounded-[8px] border border-[#E5E5E5]">
              Fee auto-fluctuates (₹1.5 – ₹4) based on real-time IMD Weather, Traffic & AQI streams.
            </p>
          </div >

          {/* Card 7 — Disruption Simulator (span 4) */}
          < div className="col-span-4 bg-white border border-[#E5E5E5] rounded-[12px] p-5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow" >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-[16px] font-semibold text-[#111111] flex items-center gap-2 mb-1">
                  <WebCloudLightning className="text-[#2563EB]" size={18} /> API Disruption Simulator
                </h2>
                <p className="text-[13px] text-[#888888] max-w-2xl">
                  Trigger mock API events simulating civic or environmental hazards. Active trip workers auto-generate claims when thresholds are breached.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5">
              {/* Flash Flood */}
              <button
                onClick={() => triggerDisruption('Flood', 'critical', 'Severe waterlogging reported in Sector 42.')}
                className="bg-[#FAFAFA] border border-[#E5E5E5] p-4 rounded-[10px] text-left hover:border-[#2563EB] hover:bg-[#EFF6FF] group transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-[#EFF6FF] rounded-[6px] group-hover:scale-105 transition-transform">
                    <WebCloudLightning className="text-[#2563EB]" size={16} />
                  </div>
                  <h4 className="text-[12px] font-semibold text-[#111111] uppercase tracking-[0.05em]">Flash Flood</h4>
                </div>
                <p className="text-[12px] text-[#888888]">
                  Simulates sudden rainfall and zone waterlogging thresholds breached.
                </p>
              </button>

              {/* AQI Spike */}
              <button
                onClick={() => triggerDisruption('Pollution', 'high', 'AQI crossed 450 in primary delivery grid.')}
                className="bg-[#FAFAFA] border border-[#E5E5E5] p-4 rounded-[10px] text-left hover:border-orange-400 hover:bg-orange-50 group transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-orange-100 rounded-[6px] group-hover:scale-105 transition-transform">
                    <WebActivity className="text-orange-600" size={16} />
                  </div>
                  <h4 className="text-[12px] font-semibold text-[#111111] uppercase tracking-[0.05em]">AQI Spike</h4>
                </div>
                <p className="text-[12px] text-[#888888]">
                  Triggers hazardous air quality limits. Auto-protects outdoor workers.
                </p>
              </button>

              {/* Civic Disruption */}
              <button
                onClick={() => triggerDisruption('Curfew', 'critical', 'Unplanned Section 144 grid disruption.')}
                className="bg-[#FAFAFA] border border-[#E5E5E5] p-4 rounded-[10px] text-left hover:border-purple-400 hover:bg-purple-50 group transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-purple-100 rounded-[6px] group-hover:scale-105 transition-transform">
                    <WebShieldAlert className="text-purple-700" size={16} />
                  </div>
                  <h4 className="text-[12px] font-semibold text-[#111111] uppercase tracking-[0.05em]">Civic Disruption</h4>
                </div>
                <p className="text-[12px] text-[#888888]">
                  Mocks a localized curfew or emergency roadblock zone mapping.
                </p>
              </button>
            </div>
          </div >

        </div >
      </main >
    </div >
  );
}

export default App;