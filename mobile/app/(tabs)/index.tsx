import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell, ShieldCheck, ShieldX, ShieldAlert, MapPin, CheckCircle2,
  Clock, AlertTriangle, ChevronRight, Zap, LogOut, User, Smartphone, TrendingUp, X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ── Mock trip history (visual only) ─────────────────────────────────────────
const MOCK_TRIPS = [
  { id: '#1231', time: '09:15 AM', from: 'Dwarka', to: 'Saket', earnings: 85, status: 'Completed' },
  { id: '#1232', time: '10:40 AM', from: 'Saket', to: 'Lajpat Nagar', earnings: 110, status: 'Completed' },
  { id: '#1233', time: '11:55 AM', from: 'Lajpat Nagar', to: 'Greater Kailash', earnings: 50, status: 'Completed' },
];

// ── Active Trip Route Card ───────────────────────────────────────────────────
function ActiveTripCard({ claimStatus, weeklyProtected }: { claimStatus: string; weeklyProtected: number }) {
  const now = new Date();
  const tripEarnings = 185;
  const showPayout = claimStatus === 'paid' && weeklyProtected > 0;

  return (
    <View style={{ marginHorizontal: 16, marginTop: -24, backgroundColor: '#1e1b2e', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 }}>
      {/* Trip status row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80', marginRight: 6 }} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#4ade80', letterSpacing: 1, textTransform: 'uppercase' }}>Active Trip</Text>
        </View>
        <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '600' }}>#1234</Text>
      </View>

      {/* Route */}
      <View style={{ flexDirection: 'row', alignItems: 'stretch', marginBottom: 16 }}>
        <View style={{ width: 24, alignItems: 'center', marginRight: 10 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#a78bfa', marginTop: 3 }} />
          <View style={{ width: 2, flex: 1, backgroundColor: '#374151', marginVertical: 4 }} />
          <MapPin color="#f87171" size={14} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 12 }}>Sector 18, Noida</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>Connaught Place, Delhi</Text>
        </View>
      </View>

      {/* Earnings row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '500', marginBottom: 2 }}>Earnings</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#ffffff' }}>₹{tripEarnings}</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(74,222,128,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' }}>
          <Text style={{ color: '#4ade80', fontSize: 12, fontWeight: '700' }}>Active</Text>
        </View>
      </View>

      {/* Payout pill */}
      {showPayout && (
        <View style={{ marginTop: 12, backgroundColor: 'rgba(74,222,128,0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)' }}>
          <CheckCircle2 color="#4ade80" size={15} />
          <Text style={{ color: '#4ade80', fontSize: 13, fontWeight: '700', marginLeft: 8 }}>
            ₹{weeklyProtected} Auto-credited • Rain
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

      {isLocked ? (
        <View style={{ backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)' }}>
          <Text style={{ fontSize: 12, color: '#f87171', fontWeight: '600', textAlign: 'center' }}>
            Complete {eligibility.required - eligibility.tripCount} more trip{eligibility.required - eligibility.tripCount !== 1 ? 's' : ''} this week to unlock
          </Text>
        </View>
      ) : (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ backgroundColor: '#7c3aed', borderRadius: 12, paddingVertical: 11, alignItems: 'center' }}>
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>Start Protected Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Today's Trips List ───────────────────────────────────────────────────────
function TodaysTrips() {
  return (
    <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontWeight: '700', fontSize: 16, color: '#0f172a' }}>Today's Trips</Text>
        <Text style={{ fontSize: 13, color: '#7c3aed', fontWeight: '600' }}>{MOCK_TRIPS.length} trips</Text>
      </View>

      {MOCK_TRIPS.map((trip, i) => (
        <View key={trip.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#f1f5f9' }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MapPin color="#7c3aed" size={16} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>{trip.id}</Text>
            <Text style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
              {trip.from} → {trip.to}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ backgroundColor: '#dcfce7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a' }}>Completed</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#16a34a' }}>₹{trip.earnings}</Text>
          </View>
        </View>
      ))}
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

  const toggleTrip = async () => {
    if (!eligibility.eligible && !isTripActive) return;
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
          <ActiveTripCard claimStatus={claimStatus} weeklyProtected={weeklyProtected} />
        ) : (
          <StandbyBanner isLocked={isLocked} eligibility={eligibility} onPress={toggleTrip} />
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
            style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: '#1e1b2e', borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#374151' }}
          >
            <Text style={{ color: '#f87171', fontWeight: '700', fontSize: 14 }}>End Trip</Text>
          </TouchableOpacity>
        )}

        {/* ── Today's Trips ── */}
        <View style={{ marginTop: 20 }}>
          <TodaysTrips />
        </View>

        {/* ── Weekly Summary ── */}
        <View style={{ marginHorizontal: 16, marginTop: 14, backgroundColor: '#ffffff', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: '#0f172a', marginBottom: 14 }}>Weekly Summary</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: '#f5f3ff', borderRadius: 14, padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#7c3aed' }}>₹{weeklyEarnings.toLocaleString()}</Text>
              <Text style={{ fontSize: 11, color: '#7c3aed', marginTop: 3, fontWeight: '600' }}>Earned</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#f0fdf4', borderRadius: 14, padding: 14, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#16a34a' }}>₹{weeklyProtected.toLocaleString()}</Text>
              <Text style={{ fontSize: 11, color: '#16a34a', marginTop: 3, fontWeight: '600' }}>Protected</Text>
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
