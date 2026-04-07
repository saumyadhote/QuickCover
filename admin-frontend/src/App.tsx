import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, CreditCard, Network, Settings, HelpCircle,
  Zap, TrendingUp, TrendingDown, RefreshCw, Brain,
  AlertTriangle, Droplets, Wind, ShieldCheck, CheckCircle, LoaderCircle,
  Eye, Trash2, KeyRound, ChevronsDown, FileText, Plus,
  History, Cloud, CloudLightning, Sun, Banknote,
  ArrowRight, Activity, Radio, MapPin, PowerOff, Timer, Play,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type Tab = 'overview' | 'pricing' | 'partners';

type AppState = {
  isTripActive: boolean;
  disruption: { type: string; zone: string; severity: string; message: string; timestamp: string } | null;
  claimStatus: 'none' | 'processing' | 'approved' | 'paid';
  weeklyEarnings: number;
  weeklyProtected: number;
  lastPayoutAmount: number;
  currentMicroFee: number;
  currentRiskLevel: 'Low' | 'Medium' | 'High';
};

type FeePoint = { fee: number; ts: number };

type OpsEvent = {
  id: number;
  time: string;
  color: string;
  msg: string;
  tag?: string;
  tagColor?: string;
};

type ZoneOutage = {
  id: number;
  zoneId: string;
  startTime: string;
  reason: string;
  status: string;
  elapsed_minutes: number;
  will_trigger: boolean;
};

const FALLBACK: AppState = {
  isTripActive: false,
  disruption: null,
  claimStatus: 'none',
  weeklyEarnings: 3200,
  weeklyProtected: 0,
  lastPayoutAmount: 0,
  currentMicroFee: 2.0,
  currentRiskLevel: 'Low',
};

function useISTClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// Smoothly counts up/down to a new number over `duration` ms
function useAnimatedNumber(target: number, duration = 650): number {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  const raf = useRef<number | undefined>(undefined);
  useEffect(() => {
    const from = prev.current;
    if (from === target) return;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(from + (target - from) * eased);
      if (t < 1) {
        raf.current = requestAnimationFrame(animate);
      } else {
        prev.current = target;
        setDisplay(target);
      }
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return display;
}

// Sonar-ping status dot for topnav
function SonarDot({ online }: { online: boolean }) {
  if (!online) return <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]" />;
  return (
    <span className="relative flex items-center justify-center w-3 h-3">
      <span className="sonar-ring absolute w-3 h-3 rounded-full bg-[#4edea3]" />
      <span className="relative w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
    </span>
  );
}

function nowIST() {
  return new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
}

// ─────────────────────────────────────────────
// QuickCover Logo SVG
// ─────────────────────────────────────────────
function QCLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2L4 7v9c0 6.075 5.144 11.5 12 13 6.856-1.5 12-6.925 12-13V7L16 2z"
        fill="url(#shield-grad)" />
      <path d="M16 2L4 7v9c0 6.075 5.144 11.5 12 13 6.856-1.5 12-6.925 12-13V7L16 2z"
        fill="none" stroke="#4edea3" strokeWidth="0.8" strokeOpacity="0.4" />
      {/* Q */}
      <circle cx="13" cy="15.5" r="4" stroke="#dce1fb" strokeWidth="1.8" fill="none" />
      <line x1="16" y1="18" x2="18" y2="20" stroke="#dce1fb" strokeWidth="1.8" strokeLinecap="round" />
      {/* C arc */}
      <path d="M21 13.5 A4 4 0 0 0 21 18.5" stroke="#4edea3" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <defs>
        <linearGradient id="shield-grad" x1="4" y1="2" x2="28" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a2540" />
          <stop offset="100%" stopColor="#0c1324" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Shared Shell
// ─────────────────────────────────────────────
function Shell({
  tab, setTab, backendOnline, clock, onReset, children,
}: {
  tab: Tab; setTab: (t: Tab) => void;
  backendOnline: boolean; clock: string;
  onReset: () => void; children: React.ReactNode;
}) {
  const nav = [
    { id: 'overview' as Tab, label: 'Overview', Icon: LayoutDashboard },
    { id: 'pricing' as Tab, label: 'Pricing Engine', Icon: CreditCard },
    { id: 'partners' as Tab, label: 'Partner APIs', Icon: Network },
  ];

  return (
    <div className="text-[#dce1fb]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[240px] z-50 bg-[#020202]/90 backdrop-blur-2xl flex flex-col border-r border-white/5 shadow-2xl">
        {/* Logo — same height as topnav */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.05] flex-shrink-0">
          <QCLogo size={30} />
          <div>
            <h1 className="text-[13px] font-bold tracking-tight text-white leading-none">QuickCover</h1>
            <p className="text-[9px] uppercase tracking-[0.18em] text-[#4edea3]/80 font-semibold mt-0.5">Ops Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] uppercase tracking-[0.15em] text-[#3d4560] font-semibold px-3 mb-2 mt-1">Navigation</p>
          {nav.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 text-left rounded-lg ${
                tab === n.id
                  ? 'text-white font-semibold bg-white/[0.07]'
                  : 'text-[#6b7898] hover:text-[#c8d0e8] hover:bg-white/[0.04] font-medium'
              }`}
            >
              <n.Icon size={16} className={tab === n.id ? 'text-[#adc6ff]' : ''} />
              <span>{n.label}</span>
              {tab === n.id && <span className="ml-auto w-1 h-4 rounded-full bg-[#adc6ff]" />}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-1 border-t border-white/[0.05] pt-3">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${backendOnline ? 'bg-[#4edea3]' : 'bg-[#ffb4ab]'}`}
              style={backendOnline ? { boxShadow: '0 0 6px #4edea3' } : {}} />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#c8d0e8]">{backendOnline ? 'Engine Online' : 'Engine Offline'}</p>
              <p className="text-[9px] text-[#3d4560]">{backendOnline ? 'All systems nominal' : 'Reconnecting…'}</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-[#6b7898] hover:text-[#c8d0e8] hover:bg-white/[0.04] transition-colors rounded-lg">
            <Settings size={15} /><span className="text-sm font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-[#6b7898] hover:text-[#c8d0e8] hover:bg-white/[0.04] transition-colors rounded-lg">
            <HelpCircle size={15} /><span className="text-sm font-medium">Support</span>
          </button>
        </div>
      </aside>

      {/* Topnav */}
      <header className="fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-[#020202]/70 backdrop-blur-2xl border-b border-white/5 flex items-center h-16 px-8 gap-6 shadow-sm">
        <div className="flex items-center gap-3 mr-auto">
          <span className="text-[10px] uppercase tracking-[0.15em] text-[#3d4560] font-semibold">Environment</span>
          <div className="h-3.5 w-px bg-white/[0.08]" />
          <span className={`flex items-center gap-2 text-xs font-semibold ${backendOnline ? 'text-[#4edea3]' : 'text-[#ffb4ab]'}`}>
            <SonarDot online={backendOnline} />
            {backendOnline ? 'Production · Live' : 'Offline'}
          </span>
        </div>
        <span className="text-xs font-mono text-[#3d4560]">{clock} IST</span>
        <div className="h-3.5 w-px bg-white/[0.08]" />
        <button
          onClick={onReset}
          className="px-3 py-1.5 text-[#6b7898] border border-white/[0.08] text-xs hover:text-white hover:border-white/[0.15] hover:bg-white/[0.04] transition-all rounded-md"
        >
          Reset Demo
        </button>
        <div className="flex items-center justify-center bg-white/[0.04] border border-white/[0.08] w-8 h-8 rounded-lg">
          <QCLogo size={20} />
        </div>
      </header>

      {/* Content */}
      <main className="ml-[240px] pt-16 min-h-screen bg-[#000000] p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#4edea3]/[0.02] to-[#adc6ff]/[0.03] pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// Live Micro-Fee Sparkline (rolling history)
// ─────────────────────────────────────────────
let sparklineIdCounter = 0;
function FeeSparkline({ history, color = '#adc6ff' }: { history: FeePoint[]; color?: string }) {
  const gradId = useRef(`spark-fill-${++sparklineIdCounter}`).current;
  if (history.length < 2) return null;
  const fees = history.map(h => h.fee);
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  const range = max - min || 0.5;
  const W = 200, H = 48;
  const pts = history.map((h, i) => {
    const x = (i / (history.length - 1)) * W;
    const y = H - ((h.fee - min) / range) * (H - 8) - 4;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const areaClose = `${W},${H} 0,${H}`;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${polyline} ${areaClose}`} fill={`url(#${gradId})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2"
        style={{ filter: `drop-shadow(0 0 4px ${color}88)` }} />
      <circle cx={W} cy={pts[pts.length - 1].split(',')[1]} r="3" fill={color} />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Live Operations Feed (replaces claim timeline)
// ─────────────────────────────────────────────
function LiveOpsFeed({ events }: { events: OpsEvent[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, [events.length]);

  return (
    <div ref={ref} className="overflow-y-auto max-h-[340px] space-y-0 scrollbar-none"
      style={{ scrollbarWidth: 'none' }}>
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Radio size={48} className="text-[#2e3447] mb-3" />
          <p className="text-sm text-[#8c909f]">Awaiting engine events…</p>
        </div>
      ) : events.map((e, i) => (
        <div
          key={e.id}
          className={`flex items-start gap-3 px-5 py-4 border-b border-white/[0.02] transition-colors duration-300 ${
            i === 0 ? 'bg-white/[0.03] ops-entry-new' : 'hover:bg-white/[0.02]'
          }`}
          style={{ opacity: Math.max(0.3, 1 - i * 0.045) }}
        >
          <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full mt-1.5"
            style={{ backgroundColor: e.color, boxShadow: `0 0 6px ${e.color}88`, flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#c2c6d6] leading-snug">{e.msg}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-[#424754]">{e.time}</span>
              {e.tag && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ color: e.tagColor || e.color, backgroundColor: (e.tagColor || e.color) + '18' }}>
                  {e.tag}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Zone Outage Manager (4th Parametric Trigger)
// ─────────────────────────────────────────────
const ZONE_LABELS: Record<string, string> = {
  ZONE_A: 'Bengaluru — Koramangala',
  ZONE_B: 'Mumbai — Bandra / Andheri',
  ZONE_C: 'Delhi — Gurugram / Cyber City',
};

function ZoneOutagePanel({
  outages, startOutage, resolveOutage,
}: {
  outages: ZoneOutage[];
  startOutage: (zoneId: string) => Promise<void>;
  resolveOutage: (zoneId: string) => Promise<void>;
}) {
  const activeByZone: Record<string, ZoneOutage> = {};
  for (const o of outages) activeByZone[o.zoneId] = o;

  return (
    <section className="bg-white/[0.015] p-6 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <PowerOff size={18} className="text-[#ffb4ab]" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Zone Outage Manager</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#ffb4ab]/10 text-[#ffb4ab] text-[10px] font-bold uppercase border border-[#ffb4ab]/20">
          4th Trigger
        </span>
      </div>
      <p className="text-[10px] text-[#8c909f] mb-5 relative z-10">
        Log a platform outage per zone. Claims auto-file for all active workers after 90 min.
      </p>
      <div className="space-y-3 relative z-10">
        {(['ZONE_A', 'ZONE_B', 'ZONE_C'] as const).map(zoneId => {
          const active = activeByZone[zoneId];
          return (
            <div key={zoneId} className={`bg-white/[0.02] rounded-xl border p-4 transition-colors backdrop-blur-md ${active ? 'border-[#ffb4ab]/30' : 'border-white/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin size={13} className={active ? 'text-[#ffb4ab]' : 'text-[#424754]'} />
                  <span className="text-xs font-bold">{zoneId}</span>
                  <span className="text-[10px] text-[#8c909f] truncate">{ZONE_LABELS[zoneId]}</span>
                </div>
                {active ? (
                  <button
                    onClick={() => resolveOutage(zoneId)}
                    className="ml-3 flex-shrink-0 text-[10px] font-bold text-[#4edea3] border border-[#4edea3]/30 px-2 py-1 rounded hover:bg-[#4edea3]/10 transition-colors"
                  >
                    Resolve
                  </button>
                ) : (
                  <button
                    onClick={() => startOutage(zoneId)}
                    className="ml-3 flex-shrink-0 text-[10px] font-bold text-[#ffb4ab] border border-[#ffb4ab]/30 px-2 py-1 rounded hover:bg-[#ffb4ab]/10 transition-colors"
                  >
                    Start Outage
                  </button>
                )}
              </div>
              {active && (
                <div className="mt-2 flex items-center gap-2">
                  <Timer size={11} className={active.will_trigger ? 'text-[#ffb4ab]' : 'text-[#ffb95f]'} />
                  <span className={`text-[10px] font-bold ${active.will_trigger ? 'text-[#ffb4ab]' : 'text-[#ffb95f]'}`}>
                    {active.elapsed_minutes}m elapsed
                    {active.will_trigger
                      ? ' — threshold breached, trigger fired'
                      : ` — trigger fires in ${90 - active.elapsed_minutes}m`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Zero-Touch Cron Evaluation Panel
// ─────────────────────────────────────────────
function CronEvalPanel({
  onRun,
}: {
  onRun: () => Promise<{ claims_created: number; breached_zones: { zone_id: string; type: string }[] } | null>;
}) {
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    claims_created: number;
    breached_zones: { zone_id: string; type: string }[];
    ran_at: string;
  } | null>(null);

  const handleRun = async () => {
    setRunning(true);
    try {
      const result = await onRun();
      if (result) {
        setLastResult({ ...result, ran_at: nowIST() });
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="bg-white/[0.015] p-6 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-[#adc6ff]" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Zero-Touch Cron Eval</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#adc6ff]/10 text-[#adc6ff] text-[10px] font-bold uppercase border border-[#adc6ff]/20">
          Auto-Claims
        </span>
      </div>
      <p className="text-[10px] text-[#8c909f] mb-5 relative z-10">
        Poll all zones against live APIs. Auto-creates Pending Review claims for every active worker in a breached zone — no driver action needed.
      </p>

      <div className="relative z-10">
        <button
          onClick={handleRun}
          disabled={running}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] text-[#002e6a] font-bold text-sm rounded-xl shadow-lg shadow-[#adc6ff]/10 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-5"
        >
          {running ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Evaluating all zones…
            </>
          ) : (
            <>
              <Play size={16} />
              Run Trigger Evaluation Now
            </>
          )}
        </button>

      {lastResult ? (
        <div className={`p-4 rounded-xl border backdrop-blur-md ${lastResult.claims_created > 0 ? 'bg-[#ffb4ab]/5 border-[#ffb4ab]/20' : 'bg-[#4edea3]/5 border-[#4edea3]/20'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${lastResult.claims_created > 0 ? 'text-[#ffb4ab]' : 'text-[#4edea3]'}`}>
              {lastResult.claims_created > 0
                ? `${lastResult.claims_created} auto-claim(s) created`
                : 'No thresholds breached'}
            </span>
            <span className="text-[10px] font-mono text-[#8c909f]">{lastResult.ran_at}</span>
          </div>
          {lastResult.breached_zones.length > 0 && (
            <div className="space-y-1">
              {lastResult.breached_zones.map((z, i) => (
                <div key={i} className="text-[10px] text-[#ffb95f] flex items-center gap-1.5">
                  <AlertTriangle size={10} />
                  {z.zone_id} — {z.type}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center backdrop-blur-md">
          <p className="text-[10px] text-[#8c909f]">No evaluation run yet this session</p>
        </div>
      )}

      <p className="text-[9px] text-[#424754] mt-3 text-right">Also runs automatically every 60s when WEATHER_API_KEY is set</p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Overview Tab
// ─────────────────────────────────────────────
function OverviewTab({
  state, feeHistory, opsEvents, triggerDisruption, refreshForecast,
  outages, startOutage, resolveOutage, runCronEval,
}: {
  state: AppState;
  feeHistory: FeePoint[];
  opsEvents: OpsEvent[];
  triggerDisruption: (type: string, severity: string, message: string) => Promise<void>;
  refreshForecast: () => Promise<void>;
  outages: ZoneOutage[];
  startOutage: (zoneId: string) => Promise<void>;
  resolveOutage: (zoneId: string) => Promise<void>;
  runCronEval: () => Promise<{ claims_created: number; breached_zones: { zone_id: string; type: string }[] } | null>;
}) {
  const LOCALES = {
    ZONE_A: { id: 'ZONE_A', name: 'Bengaluru', active: 34210, dailyOrders: 284100, payoutExtrapolation: 1250, feeOffset: 0.8 },
    ZONE_B: { id: 'ZONE_B', name: 'Mumbai', active: 41890, dailyOrders: 312050, payoutExtrapolation: 1650, feeOffset: -0.2 },
    ZONE_C: { id: 'ZONE_C', name: 'Delhi NCR', active: 24890, dailyOrders: 213120, payoutExtrapolation: 890, feeOffset: 0.0 },
  };
  const [selectedZone, setSelectedZone] = useState<keyof typeof LOCALES>('ZONE_C');
  const locale = LOCALES[selectedZone];

  const dailyOrders = locale.dailyOrders;
  const zoneMicroFee = Math.max(1.5, state.currentMicroFee + locale.feeOffset);
  const grossPremium = zoneMicroFee * dailyOrders;
  const driversPaid = state.weeklyProtected > 0 ? locale.payoutExtrapolation : 0;
  const claimsPayout = state.weeklyProtected * driversPaid;
  const netMarginPct = grossPremium > 0
    ? (((grossPremium - claimsPayout) / grossPremium) * 100).toFixed(1)
    : '71.2';

  // Animated display values for P&L cards
  const animGWP = useAnimatedNumber(grossPremium / 100000);
  const animClaims = useAnimatedNumber(claimsPayout);
  const animMargin = useAnimatedNumber(parseFloat(netMarginPct));
  const animSurplus = useAnimatedNumber(Math.max(0, grossPremium - claimsPayout));

  // Pool health: reduces when claims are paid out relative to pool
  const poolHealth = Math.min(100, Math.max(60, 100 - (claimsPayout / (grossPremium * 0.01))));
  const riskColor = state.currentRiskLevel === 'Low' ? '#4edea3'
    : state.currentRiskLevel === 'Medium' ? '#ffb95f'
    : '#ffb4ab';

  // Fee delta vs previous reading
  const prevFeeRaw = feeHistory.length >= 2 ? feeHistory[feeHistory.length - 2].fee : state.currentMicroFee;
  const prevZoneFee = Math.max(1.5, prevFeeRaw + locale.feeOffset);
  const feeDelta = zoneMicroFee - prevZoneFee;

  return (
    <>
      {/* Partner Status Strip */}
      <section className="mb-8 flex items-center justify-between px-5 py-3.5 bg-white/[0.015] border border-white/5 rounded-2xl backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center">
              <Zap size={13} className="text-[#4edea3]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Blinkit</p>
              <p className="text-[9px] text-[#4edea3] font-semibold uppercase tracking-widest">Active Partner</p>
            </div>
          </div>
          <div className="h-4 w-px bg-white/[0.07]" />
          {['Instamart', 'Zepto'].map(p => (
            <span key={p} className="text-xs text-[#3d4560] flex items-center gap-1.5">
              {p}
              <span className="text-[8px] border border-white/[0.08] px-1 py-px rounded text-[#3d4560]">PENDING</span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-[#4edea3] font-mono">
          <span className="w-1.5 h-1.5 bg-[#4edea3] rounded-full animate-pulse" />
          1.2ms latency
        </div>
      </section>

      {/* P&L Cards */}
      <section className="mb-8">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#3d4560] mb-1">Financial Performance</p>
            <h3 className="text-xl font-bold text-white tracking-tight">Revenue, Profit &amp; Loss</h3>
          </div>
          <div className="flex bg-white/[0.02] border border-white/5 rounded-lg p-1 backdrop-blur-md">
            {(Object.keys(LOCALES) as Array<keyof typeof LOCALES>).map(key => (
              <button
                key={key}
                onClick={() => setSelectedZone(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  selectedZone === key
                    ? 'bg-[#adc6ff]/10 text-[#adc6ff] border border-[#adc6ff]/20 shadow-sm'
                    : 'text-[#8c909f] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {LOCALES[key].name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* GWP */}
          <div className="relative bg-white/[0.015] border border-white/5 p-6 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl group hover:border-[#adc6ff]/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#adc6ff]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#adc6ff]/80 via-[#6e9fff]/80 to-transparent" />
            <div className="flex items-start justify-between mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4d5f80]">Gross Written Premium</p>
              <span className="text-[10px] font-bold text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded-full">+12.4%</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-medium text-[#adc6ff]/60">₹</span>
              <h4 className="text-4xl font-bold text-white tracking-tight">{animGWP.toFixed(2)}<span className="text-2xl font-semibold text-[#adc6ff]/70 ml-0.5">L</span></h4>
            </div>
            <p className="text-[11px] text-[#4d5f80] mt-2">₹{zoneMicroFee.toFixed(2)}/order × {dailyOrders.toLocaleString('en-IN')}</p>
            <div className="mt-5 h-10">
              <FeeSparkline history={feeHistory} color="#adc6ff" />
            </div>
          </div>

          {/* Claims */}
          <div className={`relative bg-white/[0.015] border border-white/5 p-6 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl group hover:border-[#ffb4ab]/20 transition-all duration-300 ${state.disruption ? 'disruption-active-glow' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffb4ab]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r ${claimsPayout > 0 ? 'from-[#ffb4ab]/80 via-[#ff8a7a]/80 to-transparent' : 'from-white/[0.08] to-transparent'}`} />
            <div className="flex items-start justify-between mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4d5f80]">Claims Payouts</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${claimsPayout > 0 ? 'text-[#ffb4ab] bg-[#ffb4ab]/10' : 'text-[#4edea3] bg-[#4edea3]/10'}`}>
                {claimsPayout > 0 ? 'Active' : 'None'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-medium text-[#ffb4ab]/60">₹</span>
              <h4 className="text-4xl font-bold text-white tracking-tight">{Math.round(animClaims).toLocaleString('en-IN')}</h4>
            </div>
            <p className="text-[11px] text-[#4d5f80] mt-2">{driversPaid > 0 ? `${driversPaid.toLocaleString('en-IN')} drivers paid — ` : ''}Total sums disbursed</p>
            <div className="mt-5 h-10">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0 30 L15 32 L30 28 L45 35 L60 33 L75 38 L90 34 L100 36" fill="none" stroke="#ffb4ab44" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Net Margin */}
          <div className="relative bg-white/[0.015] border border-white/5 p-6 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl group hover:border-[#4edea3]/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4edea3]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#4edea3]/80 via-[#2dc98e]/80 to-transparent" />
            <div className="flex items-start justify-between mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4d5f80]">Net Margin</p>
              <span className="text-[10px] font-bold text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded-full">↑ live</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <h4 className="text-4xl font-bold text-white tracking-tight">{animMargin.toFixed(1)}</h4>
              <span className="text-2xl font-semibold text-[#4edea3]/70">%</span>
            </div>
            <p className="text-[11px] text-[#4d5f80] mt-2">Pool surplus ₹{Math.round(animSurplus).toLocaleString('en-IN')}</p>
            <div className="mt-4 h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, animMargin)}%`, background: 'linear-gradient(90deg, #4edea3, #2dc98e)' }} />
            </div>
            <p className="text-[10px] text-[#4edea3]/60 mt-1.5">Loss ratio ~{(100 - animMargin).toFixed(1)}%</p>
          </div>

        </div>
      </section>

      {/* Metric Row */}
      <section className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.015] p-6 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c909f] mb-2 relative">Active Deliveries</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold">{state.isTripActive ? (locale.active + 1).toLocaleString('en-IN') : locale.active.toLocaleString('en-IN')}</p>
            {state.isTripActive && <span className="w-2 h-2 bg-[#4edea3] rounded-full animate-pulse" />}
          </div>
          <p className="text-[10px] text-[#8c909f] mt-1">{locale.name} Region — Blinkit</p>
        </div>
        <div className="bg-white/[0.015] p-6 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c909f] mb-2 relative">AI Micro-Fee</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-3xl font-bold" style={{ color: riskColor }}>₹{zoneMicroFee.toFixed(2)}</p>
            {feeDelta !== 0 && (
              <span className={`text-xs font-bold ${feeDelta > 0 ? 'text-[#ffb95f]' : 'text-[#4edea3]'}`}>
                {feeDelta > 0 ? '▲' : '▼'}{Math.abs(feeDelta).toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#8c909f] mt-1">Dynamic · updates ~15s</p>
          {/* live risk ribbon */}
          <div className="absolute right-0 top-0 bottom-0 w-1 transition-colors duration-700" style={{ backgroundColor: riskColor }} />
        </div>
        <div className="bg-white/[0.015] p-6 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c909f] mb-2 relative">Risk Level</p>
          <span className={`inline-block text-xl font-bold px-3 py-1 rounded-full border mt-1 transition-colors duration-500 ${
            state.currentRiskLevel === 'Low'
              ? 'text-[#4edea3] bg-[#4edea3]/10 border-[#4edea3]/30'
              : state.currentRiskLevel === 'Medium'
              ? 'text-[#ffb95f] bg-[#ffb95f]/10 border-[#ffb95f]/30 risk-badge-medium'
              : 'text-[#ffb4ab] bg-[#ffb4ab]/10 border-[#ffb4ab]/30 risk-badge-high'
          }`}>{state.currentRiskLevel}</span>
          <p className="text-[10px] text-[#8c909f] mt-2">AI pricing classification</p>
        </div>
        <div className="bg-white/[0.015] p-6 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c909f] mb-2 relative">Pool Health</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-[#4edea3]">{poolHealth.toFixed(1)}%</p>
          </div>
          <div className="mt-2 h-1.5 w-full bg-[#2e3447] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${poolHealth}%`, backgroundColor: poolHealth > 80 ? '#4edea3' : poolHealth > 65 ? '#ffb95f' : '#ffb4ab' }} />
          </div>
          <p className="text-[10px] text-[#8c909f] mt-1.5">Liquidity buffer</p>
        </div>
      </section>

      {/* Ops Feed + Disruption Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* Live Operations Feed */}
        <section className="bg-white/[0.015] rounded-3xl border border-white/5 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#4edea3] rounded-full animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Live Operations Feed</h3>
            </div>
            <span className="text-[10px] font-mono text-[#8c909f]">{opsEvents.length} events</span>
          </div>
          <LiveOpsFeed events={opsEvents} />
          {/* Claim status banner if active */}
          {state.claimStatus !== 'none' && (
            <div className={`mx-4 mb-4 mt-2 p-3 rounded-lg border text-center ${
              state.claimStatus === 'paid'
                ? 'bg-[#4edea3]/10 border-[#4edea3]/30'
                : state.claimStatus === 'approved'
                ? 'bg-[#adc6ff]/10 border-[#adc6ff]/30'
                : 'bg-[#ffb95f]/10 border-[#ffb95f]/30'
            }`}>
              <p className={`text-xs font-bold flex items-center justify-center gap-2 ${
                state.claimStatus === 'paid' ? 'text-[#4edea3]' :
                state.claimStatus === 'approved' ? 'text-[#adc6ff]' : 'text-[#ffb95f]'
              }`}>
                {state.claimStatus === 'paid' && <CheckCircle size={14} />}
                {state.claimStatus === 'approved' && <Banknote size={14} />}
                {state.claimStatus === 'processing' && <LoaderCircle size={14} className="animate-spin" />}
                {state.claimStatus === 'processing' && `Disruption Processing — Authenticating ${driversPaid > 0 ? driversPaid.toLocaleString('en-IN') : locale.payoutExtrapolation.toLocaleString('en-IN')} workers…`}
                {state.claimStatus === 'approved' && `Disruption Approved — ₹${((state.lastPayoutAmount || state.weeklyProtected) * (driversPaid > 0 ? driversPaid : locale.payoutExtrapolation)).toLocaleString('en-IN')} total payout authorised`}
                {state.claimStatus === 'paid' && `₹${(state.weeklyProtected * driversPaid).toLocaleString('en-IN')} total pool sums transferred to ${driversPaid.toLocaleString('en-IN')} drivers via UPI`}
              </p>
            </div>
          )}
        </section>

        {/* Disruption Simulator */}
        <section className="bg-white/[0.015] p-6 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-[#ffb95f]" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Disruption Simulator</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#ffb95f]/10 text-[#ffb95f] text-[10px] font-bold uppercase border border-[#ffb95f]/20">Live Scenario</span>
          </div>
          <div className="space-y-3 mb-6">
            {[
              { type: 'WEATHER', sev: 'HIGH', msg: `Severe waterlogging in ${locale.name}. IMD: 28mm/hr.`, label: 'Flash Flood Warning', sub: `IMD threshold breached · ₹${(450 * locale.payoutExtrapolation).toLocaleString('en-IN')} sum payout`, Icon: Droplets, color: '#adc6ff', btnClass: 'disruption-btn-weather' },
              { type: 'POLLUTION', sev: 'HIGH', msg: 'AQI crossed 450 in primary delivery grid.', label: 'Severe AQI Spike', sub: `CPCB AQI >450 · ₹${(450 * locale.payoutExtrapolation).toLocaleString('en-IN')} sum payout`, Icon: Wind, color: '#ffb95f', btnClass: 'disruption-btn-pollution' },
              { type: 'CURFEW', sev: 'CRITICAL', msg: `Unplanned Section 144 grid disruption in ${locale.name}.`, label: 'Civic Disruption', sub: `Section 144 / curfew · ₹${(450 * locale.payoutExtrapolation).toLocaleString('en-IN')} sum payout`, Icon: ShieldCheck, color: '#ffb4ab', btnClass: 'disruption-btn-curfew' },
            ].map(evt => (
              <button
                key={evt.type}
                onClick={() => triggerDisruption(evt.type, evt.sev, evt.msg)}
                disabled={state.claimStatus === 'processing' || state.claimStatus === 'approved'}
                className={`w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 p-4 rounded-xl text-left transition-all duration-300 group/btn disabled:opacity-40 disabled:cursor-not-allowed ${evt.btnClass} backdrop-blur-md relative z-10`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <evt.Icon size={18} className="group-hover:scale-110 transition-transform flex-shrink-0" style={{ color: evt.color }} />
                    <div>
                      <p className="text-sm font-bold">{evt.label}</p>
                      <p className="text-[10px] text-[#8c909f]">{evt.sub}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: evt.color }}>FIRE →</span>
                </div>
              </button>
            ))}
          </div>

          {/* ML fee refresh strip */}
          <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4 mt-6 backdrop-blur-md relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-[#adc6ff]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#c2c6d6]">AI Pricing Engine</span>
              </div>
              <button onClick={refreshForecast} className="text-[10px] font-bold text-[#adc6ff] border border-[#adc6ff]/30 px-2 py-1 rounded hover:bg-[#adc6ff]/10 transition-colors flex items-center gap-1">
                <RefreshCw size={10} />REFRESH
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-[#8c909f]">Current micro-fee</span>
              <span className="font-mono font-bold" style={{ color: riskColor }}>₹{state.currentMicroFee.toFixed(2)} / order</span>
            </div>
            <p className="text-[9px] text-[#424754] mt-1.5 text-right">Auto-updates every 15s</p>
          </div>
        </section>
      </div>

      {/* Parametric Trigger Controls — Zone Outage + Zero-Touch Cron */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ZoneOutagePanel outages={outages} startOutage={startOutage} resolveOutage={resolveOutage} />
        <CronEvalPanel onRun={runCronEval} />
      </div>

      {/* Predictive Analytics */}
      <PredictiveAnalyticsPanel riskLevel={state.currentRiskLevel} />
    </>
  );
}

// ─────────────────────────────────────────────
// Predictive Analytics Panel
// Week-ahead claim volume forecast seeded from current risk level.
// In production: XGBoost model trained on 90-day rolling trip/weather data.
// ─────────────────────────────────────────────
function PredictiveAnalyticsPanel({ riskLevel }: { riskLevel: string }) {
  // Deterministic 7-day forecast anchored to current risk signal
  const today = new Date();
  const riskMultiplier = riskLevel === 'Critical' ? 1.6 : riskLevel === 'High' ? 1.3 : riskLevel === 'Medium' ? 1.0 : 0.7;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    // Seasonal base: higher Mon/Fri, dip Wed; weekend spike for Q-commerce
    const dayOfWeek = d.getDay();
    const dayBase = [1.1, 1.0, 0.85, 0.9, 1.15, 1.35, 1.25][dayOfWeek];
    const jitter = 0.85 + Math.sin(i * 2.3 + 1.1) * 0.15;

    const weather  = Math.round(18 * riskMultiplier * dayBase * jitter);
    const heat     = Math.round(8  * riskMultiplier * dayBase * jitter * 0.6);
    const aqi      = Math.round(6  * riskMultiplier * dayBase * jitter * 0.5);
    const outage   = Math.round(4  * dayBase * jitter * 0.4);
    const total    = weather + heat + aqi + outage;
    const poolDraw = Math.round(total * 320); // avg ₹320/claim
    return { label, weather, heat, aqi, outage, total, poolDraw };
  });

  const maxTotal = Math.max(...days.map(d => d.total));
  const totalWeekClaims = days.reduce((s, d) => s + d.total, 0);
  const totalPoolDraw   = days.reduce((s, d) => s + d.poolDraw, 0);

  const barColors = {
    weather: '#adc6ff',
    heat:    '#ffb95f',
    aqi:     '#c084fc',
    outage:  '#ffb4ab',
  } as const;

  return (
    <section className="bg-white/[0.015] p-6 rounded-3xl border border-white/5 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp size={18} className="text-[#c084fc]" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Predictive Analytics</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#c084fc]/10 text-[#c084fc] text-[10px] font-bold uppercase border border-[#c084fc]/20">
              7-Day Forecast
            </span>
          </div>
          <p className="text-[10px] text-[#8c909f]">
            Expected claim volumes by disruption type · anchored to live risk signal ({riskLevel})
          </p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-[10px] text-[#8c909f] mb-0.5">Est. Claims</p>
            <p className="text-lg font-bold text-white">{totalWeekClaims}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#8c909f] mb-0.5">Pool Draw</p>
            <p className="text-lg font-bold text-[#ffb4ab]">₹{(totalPoolDraw / 1000).toFixed(1)}K</p>
          </div>
        </div>
      </div>

      {/* Stacked bar chart */}
      <div className="flex items-end gap-2 h-32 mb-4 relative z-10">
        {days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end group/bar">
            <p className="text-[9px] font-bold text-[#8c909f] mb-1 tabular-nums">{d.total}</p>
            <div className="w-full flex flex-col-reverse rounded-sm overflow-hidden" style={{ height: `${Math.max(8, (d.total / maxTotal) * 100)}%` }}>
              {(['outage', 'aqi', 'heat', 'weather'] as const).map(k => (
                d[k] > 0 && (
                  <div
                    key={k}
                    title={`${k}: ${d[k]} claims`}
                    style={{
                      height: `${(d[k] / d.total) * 100}%`,
                      backgroundColor: barColors[k],
                      opacity: 0.85,
                      minHeight: 3,
                    }}
                  />
                )
              ))}
            </div>
            <p className="text-[9px] text-[#424754] mt-1 text-center leading-tight">{d.label}</p>
          </div>
        ))}
      </div>

      {/* Legend + pool draw sparkline */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex gap-4">
          {(Object.entries(barColors) as [string, string][]).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1.5 text-[10px] text-[#8c909f] capitalize">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: c }} />
              {k === 'aqi' ? 'AQI' : k.charAt(0).toUpperCase() + k.slice(1)}
            </span>
          ))}
        </div>
        <p className="text-[9px] text-[#424754]">
          Model: XGBoost v4.2 · retrained Sun 02:00 IST · AUC 0.83
        </p>
      </div>

      {/* Confidence ribbon */}
      <div className="mt-4 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Brain size={13} className="text-[#c084fc]" />
          <p className="text-[10px] text-[#8c909f]">
            Forecast confidence: <span className="text-white font-bold">
              {riskLevel === 'Critical' ? '71%' : riskLevel === 'High' ? '78%' : riskLevel === 'Medium' ? '83%' : '89%'}
            </span>
            {' '}· Higher risk = wider prediction interval
          </p>
        </div>
        <span className="text-[9px] font-mono text-[#424754]">±{riskLevel === 'Low' ? '8' : riskLevel === 'Medium' ? '14' : '22'}% CI</span>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Fee Decomposition Bar (animated)
// ─────────────────────────────────────────────
function FeeBar({ label, Icon, value, max, color, desc }: {
  label: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; value: number; max: number; color: string; desc: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color }} />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <span className="font-mono text-sm font-bold" style={{ color }}>+₹{value.toFixed(2)}</span>
      </div>
      <div className="h-2 bg-[#2e3447] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}66` }} />
      </div>
      <p className="text-[10px] text-[#8c909f] mt-1">{desc}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Pricing Engine Tab
// ─────────────────────────────────────────────

type ZonePricing = {
  zone_id: string;
  zone_label: string;
  surcharge: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number | null;
  drivers: { rainfall_mm_hr: number; temp_celsius: number; cpcb_aqi: number } | null;
  source: 'live' | 'mock';
};

const ZONES = [
  { id: 'ZONE_A', label: 'Bengaluru — Koramangala / HSR' },
  { id: 'ZONE_B', label: 'Mumbai — Bandra / Andheri' },
  { id: 'ZONE_C', label: 'Delhi — Gurugram / Cyber City' },
];

function PricingTab({
  state, feeHistory,
}: {
  state: AppState;
  feeHistory: FeePoint[];
}) {
  const [selectedZoneId, setSelectedZoneId] = useState('ZONE_A');
  const [zonePricing, setZonePricing] = useState<ZonePricing | null>(null);
  const [zoneLoading, setZoneLoading] = useState(false);

  const fetchZonePricing = useCallback(async (zoneId: string) => {
    setZoneLoading(true);
    try {
      const res = await axios.post(`${API_URL}/pricing/zone`, { zone_id: zoneId }, { timeout: 15000 });
      setZonePricing(res.data);
    } catch (e) {
      console.error('Zone pricing fetch failed:', e);
      setZonePricing(null);
    } finally {
      setZoneLoading(false);
    }
  }, []);

  // Fetch on mount and whenever the selected zone changes
  useEffect(() => {
    fetchZonePricing(selectedZoneId);
  }, [selectedZoneId, fetchZonePricing]);

  // Display values: zone-specific when available, fall back to global state
  const displayFee = zonePricing?.surcharge ?? state.currentMicroFee;
  const displayRisk = (zonePricing?.riskLevel ?? state.currentRiskLevel) as 'Low' | 'Medium' | 'High' | 'Critical';

  const riskColor = displayRisk === 'Low' ? '#4edea3'
    : displayRisk === 'Medium' ? '#ffb95f'
    : '#ffb4ab';

  // Decompose fee into 3 driver components. Use live drivers when available.
  const baseRate = 1.50;
  const rain = zonePricing?.drivers?.rainfall_mm_hr ?? 0;
  const temp = zonePricing?.drivers?.temp_celsius ?? 25;
  const aqi  = zonePricing?.drivers?.cpcb_aqi ?? 50;

  const weatherContrib = displayRisk === 'High' || displayRisk === 'Critical' ? 1.08
    : displayRisk === 'Medium' ? 0.45 : 0.12;
  const aqiContrib = displayRisk === 'High' || displayRisk === 'Critical' ? 0.45
    : displayRisk === 'Medium' ? 0.20 : 0.06;
  const histContrib = Math.max(0, displayFee - baseRate - weatherContrib - aqiContrib);
  const maxContrib = 1.5;

  const conditionLabel = displayRisk === 'High' || displayRisk === 'Critical'
    ? `Severe weather + AQI alert active in ${ZONES.find(z => z.id === selectedZoneId)?.label} — fee at ceiling`
    : displayRisk === 'Medium'
    ? `Moderate conditions detected in ${ZONES.find(z => z.id === selectedZoneId)?.label} — fee elevated`
    : `Clear conditions in ${ZONES.find(z => z.id === selectedZoneId)?.label} — fee near floor`;

  const ConditionIcon = displayRisk === 'High' || displayRisk === 'Critical' ? CloudLightning
    : displayRisk === 'Medium' ? Cloud : Sun;

  // Build SVG path from feeHistory
  const sparkW = 1000, sparkH = 300;
  let svgPath = '';
  if (feeHistory.length >= 2) {
    const fees = feeHistory.map(h => h.fee);
    const minF = Math.min(...fees), maxF = Math.max(...fees);
    const rangeF = maxF - minF || 0.5;
    const pts = feeHistory.map((h, i) => {
      const x = (i / (feeHistory.length - 1)) * sparkW;
      const y = sparkH - ((h.fee - minF) / rangeF) * (sparkH - 40) - 20;
      return `${x},${y}`;
    });
    svgPath = pts.join(' ');
  }

  // Audit log from feeHistory transitions
  const auditFromHistory = feeHistory.slice(-6).reverse().map((h, i, arr) => {
    const prev = arr[i + 1];
    const delta = prev ? h.fee - prev.fee : 0;
    return {
      time: new Date(h.ts).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false, fractionalSecondDigits: 3 }),
      fee: h.fee,
      delta,
    };
  }).filter((_, i) => i < 5);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <nav className="flex text-[10px] uppercase tracking-[0.2em] text-[#c2c6d6] mb-2">
            <span>Engine</span><span className="mx-2">/</span>
            <span className="text-[#adc6ff]">Dynamic Pricing</span>
          </nav>
          <h2 className="text-3xl font-bold tracking-tight">AI Pricing Observatory</h2>
          <p className="text-sm text-[#c2c6d6] mt-1">The fee is never flat. Watch it respond to the world in real time.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Zone selector */}
          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#191f31] border border-[#424754]/30 rounded-lg">
              <MapPin size={14} className="text-[#adc6ff] flex-shrink-0" />
              <select
                value={selectedZoneId}
                onChange={e => setSelectedZoneId(e.target.value)}
                className="bg-transparent text-sm font-semibold text-[#dce1fb] outline-none cursor-pointer pr-2"
                style={{ appearance: 'none' }}
              >
                {ZONES.map(z => (
                  <option key={z.id} value={z.id} style={{ background: '#191f31' }}>
                    {z.id} — {z.label.split(' — ')[0]}
                  </option>
                ))}
              </select>
              {zoneLoading && <span className="w-1.5 h-1.5 rounded-full bg-[#adc6ff] animate-pulse" />}
              {!zoneLoading && zonePricing?.source === 'live' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
              )}
            </div>
          </div>
          <button
            onClick={() => fetchZonePricing(selectedZoneId)}
            disabled={zoneLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] text-[#002e6a] font-semibold text-sm rounded-lg shadow-lg shadow-[#adc6ff]/10 active:scale-95 transition-transform disabled:opacity-60"
          >
            <RefreshCw size={16} className={zoneLoading ? 'animate-spin' : ''} />
            Recalculate
          </button>
        </div>
      </div>

      {/* Zone info strip */}
      <div className="flex items-center gap-4 mb-6 px-4 py-3 bg-[#151b2d] rounded-xl border border-[#424754]/10">
        <MapPin size={14} className="text-[#adc6ff]" />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-[#adc6ff]">{selectedZoneId}</span>
          <span className="text-xs text-[#8c909f] ml-2">{ZONES.find(z => z.id === selectedZoneId)?.label}</span>
        </div>
        {zonePricing?.drivers && (
          <div className="flex items-center gap-6 text-[10px] font-mono">
            <span className="text-[#adc6ff]">
              <span className="text-[#8c909f]">Rain </span>{zonePricing.drivers.rainfall_mm_hr.toFixed(1)} mm/hr
            </span>
            <span className="text-[#ffb95f]">
              <span className="text-[#8c909f]">Temp </span>{zonePricing.drivers.temp_celsius.toFixed(1)}°C
            </span>
            <span className="text-[#ffb4ab]">
              <span className="text-[#8c909f]">AQI </span>{Math.round(zonePricing.drivers.cpcb_aqi)}
            </span>
            {zonePricing.riskScore !== null && (
              <span className="text-[#8c909f]">
                Score <span className="text-[#dce1fb]">{zonePricing.riskScore.toFixed(3)}</span>
              </span>
            )}
          </div>
        )}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
          zonePricing?.source === 'live'
            ? 'text-[#4edea3] bg-[#4edea3]/10 border-[#4edea3]/20'
            : 'text-[#8c909f] bg-[#8c909f]/10 border-[#8c909f]/20'
        }`}>
          {zonePricing?.source === 'live' ? 'LIVE API' : 'MOCK'}
        </span>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* Hero Fee Card */}
        <div className="col-span-12 lg:col-span-4 bg-[#23293c] p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden rounded-xl">
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c2c6d6]">Live Output — {selectedZoneId}</span>
            <h3 className="text-[#8c909f] text-sm mt-1">Micro-Fee This Epoch</h3>
          </div>
          <div className="relative z-10">
            {zoneLoading ? (
              <div className="py-4 space-y-3">
                <div className="shimmer h-16 w-36 rounded-lg" />
                <div className="shimmer h-4 w-28 rounded-md" />
                <div className="shimmer h-3 w-20 rounded-md opacity-60" />
              </div>
            ) : (
              <div className="text-7xl font-extrabold tracking-tighter flex items-baseline gap-2 transition-all duration-500" style={{ color: riskColor }}>
                <span className="text-3xl text-[#adc6ff] font-medium">₹</span>
                {displayFee.toFixed(2)}
              </div>
            )}
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors duration-500"
                style={{ color: riskColor, backgroundColor: riskColor + '15', borderColor: riskColor + '33' }}>
                <ConditionIcon size={14} />
                {displayRisk} Risk
              </span>
              <span className="text-[10px] text-[#8c909f]">= ₹{baseRate.toFixed(2)} base + risk drivers</span>
            </div>
          </div>
          {/* sparkline — global history for trend context */}
          <div className="mt-4 h-12 opacity-60">
            <FeeSparkline history={feeHistory} color={riskColor} />
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-700 rounded-l-xl" style={{ backgroundColor: riskColor }} />
        </div>

        {/* Why Did It Change? */}
        <div className="col-span-12 lg:col-span-8 bg-[#191f31] p-6 rounded-xl border border-[#424754]/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold uppercase tracking-[0.1em]">Why Did The Fee Change?</h3>
            <span className="text-[10px] font-mono text-[#8c909f]">MODEL_V4.2.8_PROD</span>
          </div>
          {/* Condition summary */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-[#151b2d] rounded-lg border border-[#424754]/10">
            <ConditionIcon size={14} style={{ color: riskColor }} />
            <p className="text-xs text-[#c2c6d6]">{conditionLabel}</p>
          </div>
          {/* Animated decomposition bars */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#8c909f] mb-4 font-bold">Fee Component Breakdown</p>
            <div className="mb-3 flex items-center justify-between text-[10px] text-[#8c909f]">
              <span>Base Rate (floor)</span>
              <span className="font-mono">₹{baseRate.toFixed(2)}</span>
            </div>
            <div className="h-1 bg-[#2e3447] rounded-full mb-5 overflow-hidden">
              <div className="h-full bg-[#8c909f]/50 rounded-full" style={{ width: `${(baseRate / state.currentMicroFee) * 100}%` }} />
            </div>
            <FeeBar label="Weather / IMD API" Icon={Droplets} value={weatherContrib} max={maxContrib} color="#adc6ff"
              desc={zonePricing?.drivers
                ? `Rain: ${rain.toFixed(1)} mm/hr · Temp: ${temp.toFixed(1)}°C${rain > 15 ? ' — heavy rain threshold breached' : temp > 43 ? ' — extreme heat threshold breached' : ' — within normal range'}`
                : displayRisk === 'High' ? 'Active monsoon alert — peak surcharge applied' : displayRisk === 'Medium' ? 'Light precipitation detected in delivery grid' : 'Clear skies — minimal weather surcharge'} />
            <FeeBar label="AQI / CPCB Signal" Icon={Wind} value={aqiContrib} max={maxContrib} color="#ffb95f"
              desc={zonePricing?.drivers
                ? `CPCB AQI: ~${Math.round(aqi)}${aqi > 300 ? ' — severe pollution threshold breached' : aqi > 200 ? ' — poor air quality' : ' — within acceptable range'}`
                : displayRisk === 'High' ? 'PM2.5 >400 — severe exposure risk' : displayRisk === 'Medium' ? 'Moderate air quality degradation' : 'AQI within safe limits'} />
            <FeeBar label="Historical Volatility" Icon={History} value={histContrib} max={maxContrib} color="#ffb4ab"
              desc="5-year claim cluster model — rolling anomaly window" />
            <div className="flex items-center justify-between pt-3 border-t border-[#424754]/20">
              <span className="text-sm font-bold">Total Micro-Fee ({selectedZoneId})</span>
              <span className="font-mono font-bold text-lg" style={{ color: riskColor }}>₹{displayFee.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Live Fee Chart */}
        <div className="col-span-12 bg-[#191f31] p-6 rounded-xl border border-[#424754]/10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.1em]">Live Micro-Fee History</h3>
              <p className="text-xs text-[#c2c6d6]">Real-time feed — auto-updates every 15s from backend AI model</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#8c909f]">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#4edea3] inline-block" /> Low risk</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#ffb95f] inline-block" /> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#ffb4ab] inline-block" /> High</span>
            </div>
          </div>
          <div className="relative h-[220px]">
            {feeHistory.length >= 2 ? (
              <svg className="w-full h-full" viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={riskColor} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={riskColor} stopOpacity="0" />
                  </linearGradient>
                  <filter id="chart-glow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <polygon points={`${svgPath} ${sparkW},${sparkH} 0,${sparkH}`} fill="url(#chart-fill)" />
                <polyline points={svgPath} fill="none" stroke={riskColor} strokeWidth="3" filter="url(#chart-glow)" />
                {/* horizontal band guide lines */}
                <line x1="0" y1="75" x2={sparkW} y2="75" stroke="#424754" strokeWidth="0.5" strokeDasharray="4,4" />
                <line x1="0" y1="150" x2={sparkW} y2="150" stroke="#424754" strokeWidth="0.5" strokeDasharray="4,4" />
                <line x1="0" y1="225" x2={sparkW} y2="225" stroke="#424754" strokeWidth="0.5" strokeDasharray="4,4" />
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-[#8c909f] text-sm">
                Collecting data — first reading in ~15s
              </div>
            )}
            {/* Y-axis labels — auto-scaled to actual data range */}
            {feeHistory.length >= 2 && (() => {
              const fees = feeHistory.map(h => h.fee);
              const lo = Math.min(...fees), hi = Math.max(...fees);
              const mid = ((lo + hi) / 2).toFixed(2);
              return (
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] font-mono text-[#424754] pointer-events-none pr-2">
                  <span>₹{hi.toFixed(2)}</span><span>₹{mid}</span><span>₹{lo.toFixed(2)}</span>
                </div>
              );
            })()}
          </div>
          <div className="flex justify-between mt-3 text-[10px] text-[#8c909f] font-mono border-t border-[#424754]/10 pt-3">
            {feeHistory.length >= 2
              ? [feeHistory[0], feeHistory[Math.floor(feeHistory.length / 4)], feeHistory[Math.floor(feeHistory.length / 2)], feeHistory[Math.floor(feeHistory.length * 3 / 4)], feeHistory[feeHistory.length - 1]]
                  .map((h, i) => <span key={i}>{new Date(h.ts).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}</span>)
              : ['—', '—', '—', '—', 'NOW'].map((t, i) => <span key={i}>{t}</span>)
            }
          </div>
        </div>

        {/* Fee Change Log */}
        <div className="col-span-12 bg-[#191f31] p-6 rounded-xl border border-[#424754]/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.1em]">Fee Change Log</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-[#4edea3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" /> 100% Automated
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-[#8c909f] border-b border-[#424754]/15">
                  <th className="pb-4 font-semibold">Timestamp (IST)</th>
                  <th className="pb-4 font-semibold text-right">Fee Set</th>
                  <th className="pb-4 font-semibold text-right">Change</th>
                  <th className="pb-4 font-semibold text-center">Direction</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {auditFromHistory.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-[#8c909f]">Collecting fee history…</td></tr>
                ) : auditFromHistory.map((r, i) => (
                  <tr key={i} className="border-b border-[#424754]/5 hover:bg-[#151b2d] transition-colors">
                    <td className="py-4 font-mono text-[#8c909f]">{r.time}</td>
                    <td className="py-4 text-right font-bold text-[#adc6ff]">₹{r.fee.toFixed(2)}</td>
                    <td className={`py-4 text-right font-bold ${r.delta > 0 ? 'text-[#ffb95f]' : r.delta < 0 ? 'text-[#4edea3]' : 'text-[#8c909f]'}`}>
                      {r.delta === 0 ? '—' : `${r.delta > 0 ? '+' : ''}₹${r.delta.toFixed(2)}`}
                    </td>
                    <td className="py-4 text-center">
                      {r.delta > 0 && <TrendingUp size={16} className="text-[#ffb95f] inline" />}
                      {r.delta < 0 && <TrendingDown size={16} className="text-[#4edea3] inline" />}
                      {r.delta === 0 && <span className="text-[#424754]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Partner APIs Tab
// ─────────────────────────────────────────────
function PartnersTab({ state }: { state: AppState }) {
  const dailyOrders = 213120;
  const dailyRevenue = state.currentMicroFee * dailyOrders;

  const partners = [
    { initial: 'B', initialColor: '#ffb95f', name: 'Blinkit', synced: '2m ago', status: 'Connected', statusColor: '#4edea3', latency: '142ms', latencyOk: true, riders: '114,208', premium: `₹${(dailyRevenue * 0.4 / 100000).toFixed(2)}L`, quotaPct: 85, quotaColor: '#adc6ff', quotaLabel: 'Quota Utilization: 85% of 1M requests/day', action: 'View Endpoint Logs', ActionIcon: ArrowRight },
    { initial: 'Z', initialColor: '#adc6ff', name: 'Zepto', synced: '14s ago', status: 'Connected', statusColor: '#4edea3', latency: '98ms', latencyOk: true, riders: '89,442', premium: `₹${(dailyRevenue * 0.28 / 100000).toFixed(2)}L`, quotaPct: 42, quotaColor: '#4edea3', quotaLabel: 'Quota Utilization: 42% of 2M requests/day', action: 'View Endpoint Logs', ActionIcon: ArrowRight },
    { initial: 'S', initialColor: '#ffb95f', name: 'Swiggy Instamart', synced: 'Auth refreshing...', status: 'Pending', statusColor: '#ffb95f', latency: '--', latencyOk: null, riders: '241,500', premium: '₹0.00', quotaPct: 5, quotaColor: '#ffb95f', quotaLabel: 'Initial Handshake In Progress', action: 'Complete Integration', ActionIcon: ArrowRight },
    { initial: 'Z', initialColor: '#ffb4ab', name: 'Zomato', synced: '1h ago', status: 'Connected', statusColor: '#4edea3', latency: '184ms', latencyOk: false, riders: '312,800', premium: `₹${(dailyRevenue * 0.32 / 100000).toFixed(2)}L`, quotaPct: 98, quotaColor: '#ffb4ab', quotaLabel: 'High Load: Approaching Rate Limit', action: 'Performance Report', ActionIcon: Activity },
  ];

  const credentials = [
    { env: 'Production', envColor: '#4edea3', label: 'blinkit_prod_v2_primary', access: 'Full RW Access', created: 'Oct 12, 2023' },
    { env: 'Sandbox', envColor: '#ffb95f', label: 'swiggy_claims_relay_svc', access: 'Webhook Sink Only', created: 'Nov 04, 2023' },
    { env: 'Sandbox', envColor: '#ffb95f', label: 'partner_testing_generic_v1', access: 'Developer (Limited)', created: 'Jan 18, 2024' },
  ];

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">Partner Integrations</h2>
          <p className="text-[#c2c6d6] font-medium">Manage and monitor high-frequency B2B API connections.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#191f31] text-[#dce1fb] text-sm border border-[#424754]/20 hover:bg-[#23293c] transition-all rounded-lg">
            <FileText size={14} />API Documentation
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] text-[#002e6a] font-bold text-sm rounded-lg shadow-lg shadow-[#adc6ff]/10 hover:opacity-90 transition-all">
            <Plus size={14} />Register New Partner
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Riders Protected', value: '1,482,903', sub: '+12.4% from last week', subColor: '#4edea3', Icon: TrendingUp, border: '#adc6ff' },
          { label: 'Avg. API Latency', value: '128ms', sub: 'Within SLA (150ms)', subColor: '#4edea3', Icon: CheckCircle, border: '#4edea3' },
          { label: 'Active Webhooks', value: '24/24', sub: 'Healthy Relay Clusters', subColor: '#c2c6d6', Icon: null, border: '#ffb95f' },
          { label: 'Daily Revenue (B2B)', value: `₹${(dailyRevenue / 100000).toFixed(2)}L`, sub: 'Real-time billing active', subColor: '#4edea3', Icon: TrendingUp, border: '#adc6ff' },
        ].map(m => (
          <div key={m.label} className="bg-[#191f31] p-5 rounded-lg border-l-4" style={{ borderColor: m.border }}>
            <p className="text-[10px] font-bold tracking-widest text-[#c2c6d6] uppercase mb-2">{m.label}</p>
            <h3 className="text-2xl font-bold tracking-tighter">{m.value}</h3>
            <div className="mt-2 flex items-center gap-1 text-[10px]" style={{ color: m.subColor }}>
              {m.Icon && <m.Icon size={12} />}
              <span>{m.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {partners.map(p => (
          <div key={p.name} className="bg-[#191f31] rounded-xl overflow-hidden border border-[#424754]/10">
            <div className="p-6 border-b border-[#424754]/10 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#2e3447] flex items-center justify-center border border-[#424754]/20">
                  <span className="font-black text-xl" style={{ color: p.initialColor }}>{p.initial}</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold">{p.name}</h4>
                  <p className="text-xs text-[#c2c6d6]">Last synced: {p.synced}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border uppercase"
                style={{ color: p.statusColor, backgroundColor: p.statusColor + '1a', borderColor: p.statusColor + '33' }}>
                {p.status}
              </span>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[#c2c6d6] uppercase mb-1">API Latency</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">{p.latency}</span>
                    {p.latencyOk !== null && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.latencyOk ? '#4edea3' : '#ffb4ab' }} />}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[#c2c6d6] uppercase mb-1">Active Riders</p>
                  <span className="text-xl font-bold">{p.riders}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[#c2c6d6] uppercase mb-1">Daily Premium</p>
                  <span className="text-xl font-bold text-[#adc6ff]">{p.premium}</span>
                </div>
                <div className="pt-2">
                  <button className="text-xs font-bold text-[#adc6ff] flex items-center gap-1 hover:underline">
                    {p.action} <p.ActionIcon size={12} />
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="h-[2px] w-full bg-[#2e3447] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.quotaPct}%`, backgroundColor: p.quotaColor }} />
              </div>
              <p className="text-[10px] mt-2 uppercase tracking-tighter font-bold" style={{ color: p.quotaPct >= 95 ? '#ffb4ab' : '#8c909f' }}>{p.quotaLabel}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#191f31] rounded-xl overflow-hidden border border-[#424754]/10">
        <div className="p-6 border-b border-[#424754]/10 flex justify-between items-center bg-[#23293c]/30">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Credentials Manager</h3>
            <p className="text-sm text-[#c2c6d6]">Manage API Keys, Webhook Secrets, and OAuth2.0 Client IDs.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2e3447] text-[#dce1fb] text-sm font-semibold rounded-lg hover:bg-[#33394c] transition-colors border border-[#424754]/30">
            <KeyRound size={14} />Rotate All Production Keys
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold tracking-[0.15em] text-[#c2c6d6] uppercase border-b border-[#424754]/10">
                <th className="px-6 py-4">Environment</th>
                <th className="px-6 py-4">Credential Label</th>
                <th className="px-6 py-4">Access Level</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {credentials.map((c, i) => (
                <tr key={i} className={`border-b border-[#424754]/5 hover:bg-[#151b2d] transition-colors ${i === credentials.length - 1 ? 'border-none' : ''}`}>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase"
                      style={{ color: c.envColor, backgroundColor: c.envColor + '1a', borderColor: c.envColor + '33' }}>
                      {c.env}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{c.label}</td>
                  <td className="px-6 py-4 text-[#c2c6d6]">{c.access}</td>
                  <td className="px-6 py-4 text-[#c2c6d6]">{c.created}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-[#c2c6d6] hover:text-[#adc6ff] transition-colors"><Eye size={16} /></button>
                    <button className="text-[#c2c6d6] hover:text-[#ffb4ab] transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-[#151b2d] text-center">
          <button className="text-xs font-bold text-[#c2c6d6] hover:text-[#dce1fb] tracking-widest uppercase flex items-center justify-center gap-2 w-full transition-colors">
            Expand Full Credential Store <ChevronsDown size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────

let opsEventCounter = 0;
const makeEvent = (color: string, msg: string, tag?: string, tagColor?: string): OpsEvent => ({
  id: ++opsEventCounter, time: nowIST(), color, msg, tag, tagColor,
});

export default function App() {
  const [tab, setTab] = useState<Tab>('overview');
  const [state, setState] = useState<AppState>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const consecutiveFailures = useRef(0);
  const [feeHistory, setFeeHistory] = useState<FeePoint[]>([]);
  const [opsEvents, setOpsEvents] = useState<OpsEvent[]>([]);
  const [outages, setOutages] = useState<ZoneOutage[]>([]);
  const clock = useISTClock();

  // Track previous state for generating ops events
  const prevState = useRef<AppState>(FALLBACK);

  const pushEvent = useCallback((ev: OpsEvent) => {
    setOpsEvents(prev => [ev, ...prev].slice(0, 60));
  }, []);

  useEffect(() => {
    // Seed initial ops feed with mock historic entries
    setOpsEvents([
      makeEvent('#4edea3', 'Blinkit API handshake successful — 2,401 riders reconciled.', 'PARTNER', '#4edea3'),
      makeEvent('#adc6ff', 'XGBoost model epoch recalculated — weather coefficients updated for NCR.', 'ML', '#adc6ff'),
      makeEvent('#ffb95f', 'Heuristic alert: minor liquidity deviation in sub-pool Gamma.', 'RISK', '#ffb95f'),
      makeEvent('#4edea3', 'Zepto daily reconciliation complete — 89,442 riders synced.', 'PARTNER', '#4edea3'),
    ]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await axios.get(`${API_URL}/status`, { timeout: 10000 });
        const next: AppState = res.data;
        if (!cancelled) {
          consecutiveFailures.current = 0;
          setBackendOnline(true);
          setLoading(false);

          // Rolling fee history (max 40 points).
          // Always record a new point if ≥5 s have elapsed since the last one —
          // this keeps the chart advancing even when the fee hasn't changed.
          setFeeHistory(prev => {
            const last = prev[prev.length - 1];
            if (!last || Date.now() - last.ts >= 5000) {
              return [...prev, { fee: next.currentMicroFee, ts: Date.now() }].slice(-40);
            }
            return prev;
          });

          // Generate ops events from state transitions
          const prev = prevState.current;

          if (prev.currentMicroFee !== next.currentMicroFee) {
            const up = next.currentMicroFee > prev.currentMicroFee;
            pushEvent(makeEvent(
              up ? '#ffb95f' : '#4edea3',
              `AI micro-fee ${up ? 'surged' : 'dropped'} ₹${prev.currentMicroFee.toFixed(2)} → ₹${next.currentMicroFee.toFixed(2)} (${next.currentRiskLevel} risk conditions)`,
              'PRICING', up ? '#ffb95f' : '#4edea3',
            ));
          }

          if (prev.claimStatus !== next.claimStatus) {
            if (next.claimStatus === 'processing') {
              pushEvent(makeEvent('#ffb95f', `Parametric disruption trigger received — claim auto-filed. AI cross-verification started.`, 'CLAIM', '#ffb95f'));
            } else if (next.claimStatus === 'approved') {
              const payAmt = next.lastPayoutAmount > 0 ? next.lastPayoutAmount : next.weeklyProtected;
              pushEvent(makeEvent('#adc6ff', `Isolation Forest fraud score: 0.21 / 1.00 — claim approved. Payout of ₹${payAmt.toLocaleString('en-IN')} authorised.`, 'AI', '#adc6ff'));
            } else if (next.claimStatus === 'paid') {
              pushEvent(makeEvent('#4edea3', `₹${next.weeklyProtected.toLocaleString('en-IN')} UPI transfer complete. Claim lifecycle closed.`, 'PAID', '#4edea3'));
            }
          }

          if (prev.currentRiskLevel !== next.currentRiskLevel) {
            pushEvent(makeEvent('#c2c6d6', `Risk level shifted: ${prev.currentRiskLevel} → ${next.currentRiskLevel}. Pricing engine recalibrating.`, 'RISK'));
          }

          prevState.current = next;
          setState(next);
        }
      } catch {
        if (!cancelled) {
          consecutiveFailures.current += 1;
          // Only flip offline after 2 consecutive failures — avoids false offline
          // on Render cold-start where the first request times out
          if (consecutiveFailures.current >= 2) setBackendOnline(false);
          setLoading(false);
        }
      }
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => { cancelled = true; clearInterval(id); };
  }, [pushEvent]);

  // Poll active zone outages every 15s — shows elapsed time and trigger status
  useEffect(() => {
    let cancelled = false;
    const fetchOutages = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/zone-outages`, { timeout: 8000 });
        if (!cancelled) setOutages(res.data?.active_outages ?? []);
      } catch { /* non-fatal */ }
    };
    fetchOutages();
    const id = setInterval(fetchOutages, 15000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const startOutage = useCallback(async (zoneId: string) => {
    try {
      await axios.post(`${API_URL}/admin/zone-outage`, { zone_id: zoneId, reason: 'Platform disruption reported via ops console', action: 'start' });
      // Refresh outage list immediately
      const res = await axios.get(`${API_URL}/admin/zone-outages`);
      setOutages(res.data?.active_outages ?? []);
      pushEvent(makeEvent('#ffb4ab', `Zone outage started — ${zoneId}. Auto-claim fires after 90 min.`, 'OUTAGE', '#ffb4ab'));
    } catch (e) { console.error(e); }
  }, [pushEvent]);

  const resolveOutage = useCallback(async (zoneId: string) => {
    try {
      await axios.post(`${API_URL}/admin/zone-outage`, { zone_id: zoneId, action: 'resolve' });
      const res = await axios.get(`${API_URL}/admin/zone-outages`);
      setOutages(res.data?.active_outages ?? []);
      pushEvent(makeEvent('#4edea3', `Zone outage resolved — ${zoneId}.`, 'OUTAGE', '#4edea3'));
    } catch (e) { console.error(e); }
  }, [pushEvent]);

  const runCronEval = useCallback(async () => {
    try {
      const res = await axios.post(`${API_URL}/cron/evaluate-live-triggers`, {}, { timeout: 30000 });
      const result = { claims_created: res.data.claims_created ?? 0, breached_zones: res.data.breached_zones ?? [] };
      if (result.claims_created > 0) {
        pushEvent(makeEvent('#ffb4ab', `Zero-touch cron: ${result.claims_created} auto-claim(s) created across ${result.breached_zones.length} zone(s).`, 'CRON', '#ffb4ab'));
      } else {
        pushEvent(makeEvent('#4edea3', 'Zero-touch cron: all zones clear — no parametric thresholds breached.', 'CRON', '#4edea3'));
      }
      return result;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      pushEvent(makeEvent('#ffb95f', `Cron eval failed — ${msg}`, 'CRON', '#ffb95f'));
      return null;
    }
  }, [pushEvent]);

  const triggerDisruption = useCallback(async (type: string, severity: string, message: string) => {
    try {
      // hours_worked: 4 → ₹320 payout (4 × ₹80/hr); zone defaults to ZONE_A server-side
      await axios.post(`${API_URL}/trigger-disruption`, { type, zone: 'ZONE_A', severity, message, hours_worked: 4 });
    } catch (e) { console.error(e); }
  }, []);

  const refreshForecast = useCallback(async () => {
    try {
      const res = await axios.post(`${API_URL}/refresh-forecast`);
      if (res.data?.state) {
        pushEvent(makeEvent('#adc6ff', `Manual forecast refresh — fee recalculated to ₹${res.data.state.currentMicroFee?.toFixed(2)} (${res.data.state.currentRiskLevel} risk).`, 'MANUAL', '#adc6ff'));
      }
    } catch (e) { console.error(e); }
  }, [pushEvent]);

  const resetAll = useCallback(async () => {
    try {
      await axios.post(`${API_URL}/reset`);
      setFeeHistory([]);
      setOpsEvents([makeEvent('#ffb4ab', 'Demo data reset — all state cleared to baseline.', 'SYSTEM', '#ffb4ab')]);
    } catch (e) { console.error(e); }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0c1324]">
        <div className="flex flex-col items-center gap-4">
          <QCLogo size={56} />
          <div className="flex items-center gap-3 text-[#adc6ff] font-bold text-lg animate-pulse">
            <RefreshCw size={20} className="animate-spin" />
            Connecting to Core Engine…
          </div>
        </div>
      </div>
    );
  }

  return (
    <Shell tab={tab} setTab={setTab} backendOnline={backendOnline} clock={clock} onReset={resetAll}>
      {tab === 'overview' && (
        <OverviewTab
          state={state}
          feeHistory={feeHistory}
          opsEvents={opsEvents}
          triggerDisruption={triggerDisruption}
          refreshForecast={refreshForecast}
          outages={outages}
          startOutage={startOutage}
          resolveOutage={resolveOutage}
          runCronEval={runCronEval}
        />
      )}
      {tab === 'pricing' && (
        <PricingTab
          state={state}
          feeHistory={feeHistory}
        />
      )}
      {tab === 'partners' && <PartnersTab state={state} />}
    </Shell>
  );
}
