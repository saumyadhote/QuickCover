import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell, ShieldCheck, ShieldX, ShieldAlert, MapPin, CheckCircle2,
  Clock, AlertTriangle, ChevronRight, LogOut, User, Smartphone, TrendingUp, X, Banknote,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ── Active Trip Route Card ───────────────────────────────────────────────────
function ActiveTripCard({ claimStatus, weeklyProtected, weeklyEarnings, lastPayoutAmount }: { claimStatus: string; weeklyProtected: number; weeklyEarnings: number; lastPayoutAmount: number }) {
  const showPayout = claimStatus === 'paid' && weeklyProtected > 0;

  return (
    <View style={{ marginHorizontal: 16, marginTop: -24, backgroundColor: '#1e1b2e', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 }}>
      {/* Trip status row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80', marginRight: 6 }} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#4ade80', letterSpacing: 1, textTransform: 'uppercase' }}>Active Trip</Text>
        </View>
        <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '600' }}>In progress</Text>
      </View>

      {/* Route — generic since we don't have live GPS */}
      <View style={{ flexDirection: 'row', alignItems: 'stretch', marginBottom: 16 }}>
        <View style={{ width: 24, alignItems: 'center', marginRight: 10 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#a78bfa', marginTop: 3 }} />
          <View style={{ width: 2, flex: 1, backgroundColor: '#374151', marginVertical: 4 }} />
          <MapPin color="#f87171" size={14} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#a78bfa', marginBottom: 10 }}>Pickup location</Text>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#f87171' }}>Delivery in progress…</Text>
        </View>
      </View>

      {/* Earnings row — use real weeklyEarnings from backend */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '500', marginBottom: 2 }}>This week's earnings</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#ffffff' }}>₹{weeklyEarnings.toLocaleString()}</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(74,222,128,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' }}>
          <Text style={{ color: '#4ade80', fontSize: 12, fontWeight: '700' }}>Active</Text>
        </View>
      </View>

      {/* Payout pill — show last actual payout amount */}
      {showPayout && (
        <View style={{ marginTop: 12, backgroundColor: 'rgba(74,222,128,0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)' }}>
          <CheckCircle2 color="#4ade80" size={15} />
          <Text style={{ color: '#4ade80', fontSize: 13, fontWeight: '700', marginLeft: 8 }}>
            ₹{lastPayoutAmount.toLocaleString()} Auto-credited
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Standby / Locked Trip Banner ─────────────────────────────────────────────
function StandbyBanner({
  isLocked, eligibility, onPress,
}: {
  isLocked: boolean;
  eligibility: { eligible: boolean; tripCount: number; required: number };
  onPress: () => void;
}) {
  return (
    <View style={{ marginHorizontal: 16, marginTop: -24, backgroundColor: '#1e1b2e', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isLocked ? 'rgba(248,113,113,0.15)' : 'rgba(148,163,184,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          {isLocked ? <ShieldX color="#f87171" size={18} /> : <ShieldAlert color="#94a3b8" size={18} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>
            {isLocked ? 'Coverage Locked' : 'Insurance Standby'}
          </Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
            {isLocked
              ? `${eligibility.tripCount}/${eligibility.required} trips — need ${eligibility.required - eligibility.tripCount} more`
              : 'Tap below to start a protected trip'}
          </Text>
        </View>
      </View>

      {isLocked && (
        <View style={{ backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)', marginBottom: 10 }}>
          <Text style={{ fontSize: 12, color: '#f87171', fontWeight: '600', textAlign: 'center' }}>
            Complete {eligibility.required - eligibility.tripCount} more trip{eligibility.required - eligibility.tripCount !== 1 ? 's' : ''} this week to unlock coverage
          </Text>
        </View>
      )}
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ backgroundColor: '#7c3aed', borderRadius: 12, paddingVertical: 11, alignItems: 'center' }}>
        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>Start Trip</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Today's Trips List ───────────────────────────────────────────────────────
function TodaysTrips({ tripCount, isTripActive }: { tripCount: number; isTripActive: boolean }) {
  // tripCount from eligibility = completed + disrupted in last 7 days (not just today),
  // so we show it as a "recent trips" indicator with the real count.
  const displayCount = isTripActive ? tripCount + 1 : tripCount;

  if (tripCount === 0 && !isTripActive) {
    return (
      <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: '#0f172a' }}>Recent Trips</Text>
          <Text style={{ fontSize: 13, color: '#94a3b8', fontWeight: '600' }}>0 trips</Text>
        </View>
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <MapPin color="#cbd5e1" size={28} />
          <Text style={{ fontSize: 14, color: '#94a3b8', fontWeight: '500', marginTop: 10 }}>No trips yet this week</Text>
          <Text style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>Complete trips to build your eligibility</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontWeight: '700', fontSize: 16, color: '#0f172a' }}>Recent Trips</Text>
        <Text style={{ fontSize: 13, color: '#7c3aed', fontWeight: '600' }}>{displayCount} trip{displayCount !== 1 ? 's' : ''} this week</Text>
      </View>

      {/* Active trip row (if trip in progress) */}
      {isTripActive && (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderTopWidth: 0 }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MapPin color="#16a34a" size={16} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>Current trip</Text>
            <Text style={{ fontSize: 11, color: '#16a34a', marginTop: 1 }}>In progress…</Text>
          </View>
          <View style={{ backgroundColor: '#dcfce7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a' }}>Active</Text>
          </View>
        </View>
      )}

      {/* Completed trips count row */}
      {tripCount > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderTopWidth: isTripActive ? 1 : 0, borderTopColor: '#f1f5f9' }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MapPin color="#7c3aed" size={16} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>{tripCount} completed trip{tripCount !== 1 ? 's' : ''}</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>In the last 7 days</Text>
          </View>
          <View style={{ backgroundColor: '#f5f3ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#7c3aed' }}>Verified</Text>
          </View>
        </View>
      )}

      {/* Eligibility progress bar */}
      <View style={{ marginTop: 8, backgroundColor: '#f8fafc', borderRadius: 10, padding: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600' }}>Eligibility progress</Text>
          <Text style={{ fontSize: 11, color: tripCount >= 25 ? '#16a34a' : '#7c3aed', fontWeight: '700' }}>
            {Math.min(tripCount, 25)}/25
          </Text>
        </View>
        <View style={{ height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          <View style={{ height: 6, width: `${Math.min(100, (tripCount / 25) * 100)}%`, backgroundColor: tripCount >= 25 ? '#16a34a' : '#7c3aed', borderRadius: 3 }} />
        </View>
      </View>
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { state, eligibility, acceptTrip, completeTrip } = useMockData();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [tripSeconds, setTripSeconds] = useState(0);
  const tripStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state?.isTripActive) {
      tripStartRef.current = null;
      setTripSeconds(0);
      return;
    }
    if (tripStartRef.current === null) tripStartRef.current = Date.now();
    const interval = setInterval(() => {
      setTripSeconds(Math.floor((Date.now() - tripStartRef.current!) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [state?.isTripActive]);

  if (!state) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0a1e', paddingTop: 64, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#1e1b2e', marginRight: 12 }} />
          <View>
            <View style={{ width: 96, height: 14, backgroundColor: '#1e1b2e', borderRadius: 4, marginBottom: 6 }} />
            <View style={{ width: 140, height: 20, backgroundColor: '#1e1b2e', borderRadius: 4 }} />
          </View>
        </View>
        <View style={{ width: '100%', height: 160, backgroundColor: '#1e1b2e', borderRadius: 20, marginBottom: 16 }} />
      </View>
    );
  }

  const { isTripActive, disruption, claimStatus, weeklyEarnings, weeklyProtected, lastPayoutAmount, currentMicroFee, currentRiskLevel } = state;
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const initial = user?.name?.[0]?.toUpperCase() ?? '?';
  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const isLocked = !eligibility.eligible && !isTripActive;

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const toggleTrip = async () => {
    try {
      if (isTripActive) await completeTrip();
      else await acceptTrip();
    } catch (err) {
      console.error('Failed to toggle trip', err);
    }
  };

  // Build a notification count
  const notifCount = [
    claimStatus === 'paid' && weeklyProtected > 0,
    claimStatus === 'approved',
    claimStatus === 'processing',
    disruption && claimStatus === 'none',
  ].filter(Boolean).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f3ff' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Gradient Header ── */}
        <LinearGradient
          colors={['#2d1b69', '#1e1050', '#0f0a1e']}
          style={{ paddingTop: 56, paddingBottom: 52, paddingHorizontal: 20 }}
        >
          {/* Top row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity activeOpacity={0.75} onPress={() => setProfileOpen(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LinearGradient
                colors={['#7c3aed', '#6d28d9']}
                style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 11 }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 16 }}>{initial}</Text>
              </LinearGradient>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffffff' }}>Hi {firstName}</Text>
                <Text style={{ fontSize: 12, color: '#a78bfa', marginTop: 1 }}>{greeting}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.75} onPress={() => setNotifOpen(true)}>
              <View style={{ position: 'relative' }}>
                {notifCount > 0 && (
                  <View style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, backgroundColor: '#ef4444', borderRadius: 5, zIndex: 10, borderWidth: 1.5, borderColor: '#1e1050' }} />
                )}
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell color="#e2e8f0" size={20} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Risk / surcharge pill */}
          {(() => {
            const riskColor = currentRiskLevel === 'Low' ? '#4ade80' : currentRiskLevel === 'High' ? '#f87171' : '#fbbf24';
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start' }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: riskColor, marginRight: 7 }} />
                <Text style={{ fontSize: 12, color: '#c4b5fd', fontWeight: '600' }}>
                  Consumer surcharge: <Text style={{ color: '#ffffff', fontWeight: '800' }}>₹{currentMicroFee.toFixed(2)}/order</Text>
                </Text>
                <View style={{ marginLeft: 8, backgroundColor: riskColor, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: '#0f0a1e', fontSize: 10, fontWeight: '800' }}>{currentRiskLevel.toUpperCase()}</Text>
                </View>
              </View>
            );
          })()}
        </LinearGradient>

        {/* ── Trip Card (overlaps gradient) ── */}
        {isTripActive ? (
          <ActiveTripCard claimStatus={claimStatus} weeklyProtected={weeklyProtected} weeklyEarnings={weeklyEarnings} lastPayoutAmount={lastPayoutAmount} />
        ) : (
          <StandbyBanner isLocked={isLocked} eligibility={eligibility} onPress={toggleTrip} />
        )}

        {/* ── Payout Credited Card ── */}
        {claimStatus === 'paid' && lastPayoutAmount > 0 && (
          <View style={{ marginHorizontal: 16, marginTop: 12 }}>
            <LinearGradient
              colors={['#052e16', '#14532d', '#15803d']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20, overflow: 'hidden' }}
            >
              {/* Top row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(74,222,128,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                    <Banknote color="#4ade80" size={19} />
                  </View>
                  <View>
                    <Text style={{ color: '#4ade80', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 }}>PAYOUT CREDITED</Text>
                    <Text style={{ color: 'rgba(134,239,172,0.7)', fontSize: 11, marginTop: 1 }}>Auto-settled via UPI</Text>
                  </View>
                </View>
                <View style={{ backgroundColor: 'rgba(74,222,128,0.2)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' }}>
                  <Text style={{ color: '#4ade80', fontSize: 10, fontWeight: '800' }}>PAID</Text>
                </View>
              </View>

              {/* Amount */}
              <View style={{ alignItems: 'center', marginBottom: 18 }}>
                <Text style={{ color: 'rgba(134,239,172,0.6)', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>Amount Received</Text>
                <Text style={{ color: '#ffffff', fontSize: 44, fontWeight: '900', letterSpacing: -1 }}>₹{lastPayoutAmount.toLocaleString()}</Text>
                <Text style={{ color: 'rgba(134,239,172,0.7)', fontSize: 12, marginTop: 4 }}>
                  Protected earnings this week: ₹{weeklyProtected.toLocaleString()}
                </Text>
              </View>

              {/* Details row */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(134,239,172,0.6)', fontSize: 10, fontWeight: '600', marginBottom: 3 }}>TRIGGER</Text>
                  <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
                    {disruption?.type === 'POLLUTION' ? 'Air Quality' : disruption?.type === 'OUTAGE' ? 'Platform Outage' : disruption?.type === 'CURFEW' ? 'Curfew' : 'Weather Disruption'}
                  </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(134,239,172,0.6)', fontSize: 10, fontWeight: '600', marginBottom: 3 }}>RATE</Text>
                  <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>₹80/hr</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(134,239,172,0.6)', fontSize: 10, fontWeight: '600', marginBottom: 3 }}>STATUS</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CheckCircle2 color="#4ade80" size={11} />
                    <Text style={{ color: '#4ade80', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>Done</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ── Disruption Alert ── */}
        {disruption && claimStatus === 'none' && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/claims')} style={{ marginHorizontal: 16, marginTop: 12 }}>
            <View style={{ backgroundColor: '#fef2f2', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <AlertTriangle color="#dc2626" size={17} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#7f1d1d', fontWeight: '700', fontSize: 13 }}>Disruption in your zone</Text>
                <Text style={{ color: '#b91c1c', fontSize: 12, marginTop: 1 }} numberOfLines={2}>{disruption.message}</Text>
              </View>
              <View style={{ backgroundColor: '#dc2626', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 12 }}>Claim →</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Claim in progress ── */}
        {claimStatus !== 'none' && claimStatus !== 'paid' && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/claims')} style={{ marginHorizontal: 16, marginTop: 12 }}>
            <View style={{ backgroundColor: '#eff6ff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#bfdbfe' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Clock color="#2563eb" size={17} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#1e40af', fontWeight: '700', fontSize: 13 }}>
                  {claimStatus === 'processing' ? 'AI reviewing your claim…' : 'Claim approved — payout processing'}
                </Text>
                <Text style={{ color: '#3b82f6', fontSize: 12, marginTop: 1 }}>Tap to track progress</Text>
              </View>
              <ChevronRight color="#3b82f6" size={18} />
            </View>
          </TouchableOpacity>
        )}

        {/* ── Active trip end button ── */}
        {isTripActive && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleTrip}
            style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: '#1e1b2e', borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#374151', flexDirection: 'row', justifyContent: 'center', gap: 10 }}
          >
            <Text style={{ color: '#f87171', fontWeight: '700', fontSize: 14 }}>End Trip</Text>
            <View style={{ backgroundColor: 'rgba(248,113,113,0.12)', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(248,113,113,0.25)' }}>
              <Text style={{ color: '#f87171', fontWeight: '700', fontSize: 13, fontVariant: ['tabular-nums'] }}>{fmt(tripSeconds)}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Today's Trips ── */}
        <View style={{ marginTop: 20 }}>
          <TodaysTrips tripCount={eligibility.tripCount} isTripActive={isTripActive} />
        </View>

        {/* ── Weekly Summary ── */}
        <View style={{ marginHorizontal: 16, marginTop: 14, backgroundColor: '#ffffff', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: '#0f172a', marginBottom: 14 }}>Weekly Summary</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: '#f5f3ff', borderRadius: 14, padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#7c3aed' }}>₹{weeklyEarnings.toLocaleString()}</Text>
              <Text style={{ fontSize: 11, color: '#7c3aed', marginTop: 3, fontWeight: '600' }}>Earned</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: weeklyProtected > 0 ? '#f0fdf4' : '#f8fafc', borderRadius: 14, padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: weeklyProtected > 0 ? '#16a34a' : '#94a3b8' }}>
                {weeklyProtected > 0 ? `₹${weeklyProtected.toLocaleString()}` : '—'}
              </Text>
              <Text style={{ fontSize: 11, color: weeklyProtected > 0 ? '#16a34a' : '#94a3b8', marginTop: 3, fontWeight: '600' }}>Protected</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>{eligibility.tripCount}</Text>
              <Text style={{ fontSize: 11, color: '#64748b', marginTop: 3, fontWeight: '600' }}>Trips</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Profile Popover ── */}
      {profileOpen && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
          <TouchableOpacity activeOpacity={1} onPress={() => setProfileOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />
          <View style={{ position: 'absolute', top: 108, left: 16, right: 80, backgroundColor: '#ffffff', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 12, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: '#0f172a' }}>My Account</Text>
              <TouchableOpacity onPress={() => setProfileOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X color="#94a3b8" size={18} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f8fafc' }}>
              <LinearGradient colors={['#7c3aed', '#6d28d9']} style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 17 }}>{initial}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: '#0f172a' }} numberOfLines={1}>{user?.name ?? '—'}</Text>
                <Text style={{ fontSize: 12, color: '#64748b', marginTop: 1 }} numberOfLines={1}>{user?.email ?? '—'}</Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
              {[
                { icon: <User color="#64748b" size={13} />, label: 'Driver ID', value: user?.driverId ?? '—' },
                { icon: <Smartphone color="#64748b" size={13} />, label: 'Platform', value: user?.platform ? user.platform.charAt(0).toUpperCase() + user.platform.slice(1) : '—' },
                { icon: <ShieldCheck color={eligibility.eligible ? '#16a34a' : '#dc2626'} size={13} />, label: 'Coverage', value: eligibility.eligible ? `Eligible · ${eligibility.tripCount} trips` : `${eligibility.tripCount}/${eligibility.required} trips`, valueBg: eligibility.eligible ? '#f0fdf4' : '#fef2f2', valueColor: eligibility.eligible ? '#16a34a' : '#dc2626' },
                { icon: <TrendingUp color="#16a34a" size={13} />, label: 'Weekly Earnings', value: `₹${state.weeklyEarnings.toLocaleString()}` },
              ].map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>{row.icon}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '500' }}>{row.label}</Text>
                    <Text style={{ fontSize: 13, color: (row as any).valueColor ?? '#0f172a', fontWeight: '600' }} numberOfLines={1}>{row.value}</Text>
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={async () => { setProfileOpen(false); await logout(); }} style={{ marginHorizontal: 16, marginBottom: 16, borderRadius: 12, backgroundColor: '#fef2f2', paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fecaca' }}>
              <LogOut color="#dc2626" size={16} />
              <Text style={{ color: '#dc2626', fontWeight: '700', fontSize: 14, marginLeft: 8 }}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Notification Overlay ── */}
      {notifOpen && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
          <TouchableOpacity activeOpacity={1} onPress={() => setNotifOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          <View style={{ position: 'absolute', top: 100, left: 16, right: 16, backgroundColor: '#ffffff', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 24, elevation: 12, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: '#0f172a' }}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X color="#94a3b8" size={18} />
              </TouchableOpacity>
            </View>
            {notifCount === 0 ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Bell color="#cbd5e1" size={28} />
                <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 10, fontWeight: '500' }}>No new notifications</Text>
              </View>
            ) : (
              <View style={{ paddingVertical: 8 }}>
                {claimStatus === 'paid' && weeklyProtected > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <CheckCircle2 color="#16a34a" size={17} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: '#0f172a' }}>Payout Credited</Text>
                      <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>₹{lastPayoutAmount.toLocaleString()} sent to your wallet</Text>
                      <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Today</Text>
                    </View>
                  </View>
                )}
                {(claimStatus === 'processing' || claimStatus === 'approved') && (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 12 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Clock color="#2563eb" size={17} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: '#0f172a' }}>
                        {claimStatus === 'processing' ? 'Claim Under Review' : 'Claim Approved'}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {claimStatus === 'processing' ? 'AI verification in progress' : 'Payment being sent now'}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Just now</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
