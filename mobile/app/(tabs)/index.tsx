import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, CheckCircle, Bell, X, CloudRain, Clock, Zap, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ── Build notification list from live state ──────────────────────────────────
type Notification = {
  id: string;
  icon: 'shield' | 'rain' | 'payout' | 'clock' | 'alert';
  title: string;
  body: string;
  time: string;
  color: string;
};

function buildNotifications(state: {
  isTripActive: boolean;
  disruption: { type: string; zone: string; severity: string; message: string; timestamp: string } | null;
  claimStatus: string;
  weeklyProtected: number;
  lastPayoutAmount: number;
}): Notification[] {
  const notes: Notification[] = [];

  if (state.claimStatus === 'paid' && state.weeklyProtected > 0) {
    notes.push({
      id: 'payout',
      icon: 'payout',
      title: 'Payout Credited',
      body: `₹${state.lastPayoutAmount.toLocaleString()} has been sent to your wallet via Razorpay.`,
      time: 'Today',
      color: '#16a34a',
    });
  }

  if (state.claimStatus === 'approved') {
    notes.push({
      id: 'approved',
      icon: 'shield',
      title: 'Claim Approved',
      body: 'Your disruption claim has been verified and approved.',
      time: 'Just now',
      color: '#7c3aed',
    });
  }

  if (state.claimStatus === 'processing') {
    notes.push({
      id: 'processing',
      icon: 'clock',
      title: 'Claim Under Review',
      body: 'Your report has been received. AI verification is running — typically completes in seconds.',
      time: 'Just now',
      color: '#d97706',
    });
  }

  if (state.disruption && state.claimStatus === 'none') {
    notes.push({
      id: 'disruption',
      icon: 'rain',
      title: `Disruption detected — file a claim`,
      body: `${state.disruption.message}. Go to Claims to report and get compensated.`,
      time: new Date(state.disruption.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      color: '#dc2626',
    });
  }

  if (state.isTripActive) {
    notes.push({
      id: 'trip',
      icon: 'shield',
      title: 'Trip Active — Coverage On',
      body: 'If deliveries stop due to a disruption, go to Claims to report it.',
      time: 'Active now',
      color: '#2563eb',
    });
  }

  return notes;
}

function NotifIcon({ type, color }: { type: Notification['icon']; color: string }) {
  const size = 18;
  if (type === 'rain') return <CloudRain color={color} size={size} />;
  if (type === 'payout') return <CheckCircle color={color} size={size} />;
  if (type === 'clock') return <Clock color={color} size={size} />;
  if (type === 'alert') return <AlertTriangle color={color} size={size} />;
  return <ShieldCheck color={color} size={size} />;
}

// ── Today's Journey Timeline ──────────────────────────────────────────────────
function TodaysJourney({ isTripActive }: { isTripActive: boolean }) {
  const now = new Date();
  const shiftTime = new Date(now.getTime() - 45 * 60 * 1000);
  const shiftTimeStr = shiftTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const steps = [
    {
      label: 'Shift Started',
      sub: shiftTimeStr,
      subColor: '#7c3aed',
      state: 'done', // done | active | pending
    },
    {
      label: 'On Delivery',
      sub: isTripActive ? 'Active' : 'Awaiting next trip',
      subColor: isTripActive ? '#7c3aed' : '#94a3b8',
      state: isTripActive ? 'active' : 'pending',
    },
    {
      label: 'Shift End',
      sub: 'Pending',
      subColor: '#f59e0b',
      state: 'pending',
    },
  ];

  return (
    <View style={{
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    }}>
      {/* Card header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontWeight: '700', fontSize: 17, color: '#0f172a' }}>Today's Journey</Text>
        <View style={{ backgroundColor: isTripActive ? '#dcfce7' : '#fef9c3', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
          <Text style={{ color: isTripActive ? '#166534' : '#92400e', fontWeight: '700', fontSize: 12 }}>
            {isTripActive ? 'In Progress' : 'Ready'}
          </Text>
        </View>
      </View>

      {/* Timeline */}
      {steps.map((step, idx) => (
        <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Left column: icon + connector */}
          <View style={{ width: 36, alignItems: 'center' }}>
            {step.state === 'done' ? (
              <LinearGradient
                colors={['#7c3aed', '#6d28d9']}
                style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
              >
                <ShieldCheck color="#ffffff" size={18} />
              </LinearGradient>
            ) : step.state === 'active' ? (
              <LinearGradient
                colors={['#7c3aed', '#6d28d9']}
                style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
              >
                <Zap color="#ffffff" size={18} />
              </LinearGradient>
            ) : (
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#e2e8f0' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#cbd5e1' }} />
              </View>
            )}
            {/* Connector line */}
            {idx < steps.length - 1 && (
              <View style={{ width: 2, height: 24, backgroundColor: idx === 0 ? '#7c3aed' : '#e2e8f0', marginVertical: 2 }} />
            )}
          </View>

          {/* Right column: text */}
          <View style={{ flex: 1, paddingLeft: 12, paddingBottom: idx < steps.length - 1 ? 0 : 0, minHeight: idx < steps.length - 1 ? 62 : 36 }}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: step.state === 'pending' ? '#94a3b8' : '#0f172a' }}>
              {step.label}
            </Text>
            <Text style={{ fontSize: 12, color: step.subColor, marginTop: 2 }}>{step.sub}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { state, eligibility, acceptTrip, completeTrip } = useMockData();
  const { user } = useAuth();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);

  if (!state) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff', paddingTop: 64, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#e2e8f0', marginRight: 12 }} />
          <View>
            <View style={{ width: 96, height: 14, backgroundColor: '#e2e8f0', borderRadius: 4, marginBottom: 6 }} />
            <View style={{ width: 140, height: 20, backgroundColor: '#e2e8f0', borderRadius: 4 }} />
          </View>
        </View>
        <View style={{ width: '100%', height: 56, backgroundColor: '#f1f5f9', borderRadius: 16, marginBottom: 16 }} />
        <View style={{ width: '100%', height: 200, backgroundColor: '#f1f5f9', borderRadius: 20, marginBottom: 16 }} />
      </View>
    );
  }

  const { isTripActive, disruption, claimStatus, weeklyEarnings, weeklyProtected, lastPayoutAmount, currentMicroFee, currentRiskLevel } = state;
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const initial = user?.name?.[0]?.toUpperCase() ?? '?';
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const destinationLabel = user?.platform
    ? `${user.platform.charAt(0).toUpperCase() + user.platform.slice(1)} Wallet`
    : 'HDFC Bank ••••4521';

  const notifications = buildNotifications({ isTripActive, disruption, claimStatus, weeklyProtected, lastPayoutAmount });
  const hasNotifs = notifications.length > 0;

  const toggleTrip = async () => {
    if (!eligibility.eligible && !isTripActive) return; // blocked — not enough recent trips
    try {
      if (isTripActive) await completeTrip();
      else await acceptTrip();
    } catch (err) {
      console.error('Failed to toggle trip', err);
    }
  };

  // Determine hour for greeting
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/(tabs)/profile')}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <LinearGradient
              colors={['#14b8a6', '#0d9488']}
              style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 18 }}>{initial}</Text>
            </LinearGradient>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>Hi {firstName} </Text>
                <Text style={{ fontSize: 18 }}>👋</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#94a3b8' }}>{greeting}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.75} onPress={() => setNotifOpen(true)}>
            <View style={{ position: 'relative' }}>
              {hasNotifs && (
                <View style={{
                  position: 'absolute', top: -2, right: -2, width: 10, height: 10,
                  backgroundColor: '#ef4444', borderRadius: 5, zIndex: 10,
                  borderWidth: 1.5, borderColor: '#ffffff',
                }} />
              )}
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
                <Bell color="#334155" size={20} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 14 }}>
          {/* ── Insurance Status Banner ── */}
          {(() => {
            const isLocked = !eligibility.eligible && !isTripActive;
            const bgColor = isTripActive ? '#16a34a' : isLocked ? '#991b1b' : '#64748b';
            const dotColor = isTripActive ? '#bbf7d0' : isLocked ? '#fca5a5' : '#94a3b8';
            const title = isTripActive ? 'Insurance Active' : isLocked ? 'Not Eligible' : 'Insurance Standby';
            const subtitle = isTripActive
              ? 'Trip Protected'
              : isLocked
              ? `${eligibility.tripCount}/${eligibility.required} trips this week — need ${eligibility.required - eligibility.tripCount} more`
              : 'Tap to start a protected trip';
            return (
              <TouchableOpacity activeOpacity={isLocked ? 1 : 0.85} onPress={toggleTrip}>
                <View style={{
                  backgroundColor: bgColor,
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      {isTripActive
                        ? <ShieldCheck color="#ffffff" size={20} />
                        : isLocked
                        ? <ShieldX color="#ffffff" size={20} />
                        : <ShieldAlert color="#ffffff" size={20} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>{title}</Text>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }} numberOfLines={2}>{subtitle}</Text>
                    </View>
                  </View>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dotColor, marginLeft: 8 }} />
                </View>
                {isLocked && (
                  <View style={{ marginTop: 6, backgroundColor: '#fee2e2', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 }}>
                    <Text style={{ fontSize: 11, color: '#b91c1c', fontWeight: '600', textAlign: 'center' }}>
                      Complete {eligibility.required - eligibility.tripCount} more trip{eligibility.required - eligibility.tripCount !== 1 ? 's' : ''} this week to unlock insurance coverage.
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })()}

          {/* ── Live Consumer Surcharge Pill ── */}
          {(() => {
            const riskColor = currentRiskLevel === 'Low' ? '#16a34a' : currentRiskLevel === 'High' ? '#dc2626' : '#d97706';
            const riskBg    = currentRiskLevel === 'Low' ? '#f0fdf4' : currentRiskLevel === 'High' ? '#fef2f2' : '#fffbeb';
            const riskBorder= currentRiskLevel === 'Low' ? '#bbf7d0' : currentRiskLevel === 'High' ? '#fecaca' : '#fde68a';
            return (
              <View style={{ backgroundColor: riskBg, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: riskBorder }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TrendingUp color={riskColor} size={15} />
                  <Text style={{ marginLeft: 7, fontSize: 13, color: riskColor, fontWeight: '600' }}>Consumer surcharge today</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a' }}>₹{currentMicroFee.toFixed(2)}/order</Text>
                  <View style={{ backgroundColor: riskColor, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 }}>
                    <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>{currentRiskLevel.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            );
          })()}

          {/* ── Disruption Alert → File a Claim CTA ── */}
          {disruption && claimStatus === 'none' && (
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/claims')}>
              <View style={{ backgroundColor: '#fef2f2', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#fecaca' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                    <AlertTriangle color="#dc2626" size={17} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#7f1d1d', fontWeight: '700', fontSize: 13 }}>Disruption in your zone</Text>
                    <Text style={{ color: '#b91c1c', fontSize: 12, marginTop: 1 }}>{disruption.message}</Text>
                  </View>
                </View>
                <View style={{ backgroundColor: '#dc2626', borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>File a Claim →</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* ── Claim in progress indicator ── */}
          {claimStatus !== 'none' && claimStatus !== 'paid' && (
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/claims')}>
              <View style={{ backgroundColor: '#eff6ff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#bfdbfe' }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Clock color="#2563eb" size={17} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#1e40af', fontWeight: '700', fontSize: 13 }}>
                    {claimStatus === 'processing' ? 'AI reviewing your claim…' : 'Claim approved — payout processing'}
                  </Text>
                  <Text style={{ color: '#3b82f6', fontSize: 12, marginTop: 1 }}>Tap to track progress</Text>
                </View>
                <Text style={{ fontSize: 16, color: '#3b82f6' }}>→</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* ── Today's Journey ── */}
          <TodaysJourney isTripActive={isTripActive} />

          {/* ── Last Payout Card ── */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontWeight: '700', fontSize: 17, color: '#0f172a' }}>Last Payout</Text>
              {claimStatus === 'paid' && weeklyProtected > 0 ? (
                <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ color: '#166534', fontWeight: '700', fontSize: 12 }}>Completed</Text>
                </View>
              ) : (
                <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ color: '#64748b', fontWeight: '600', fontSize: 12 }}>No claim yet</Text>
                </View>
              )}
            </View>

            {claimStatus === 'paid' && weeklyProtected > 0 ? (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                  <Text style={{ color: '#64748b', fontSize: 14 }}>Amount</Text>
                  <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 22 }}>₹{lastPayoutAmount.toLocaleString()}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                  <Text style={{ color: '#64748b', fontSize: 14 }}>Trigger</Text>
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>Heavy Rain / Disruption</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                  <Text style={{ color: '#64748b', fontSize: 14 }}>Destination</Text>
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>{destinationLabel}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, marginBottom: 12 }}>
                  <Text style={{ color: '#64748b', fontSize: 14 }}>Date</Text>
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>{dateStr}</Text>
                </View>
                <View style={{ backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#bbf7d0' }}>
                  <CheckCircle color="#16a34a" size={20} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={{ color: '#14532d', fontWeight: '700', fontSize: 13 }}>Payment Successful</Text>
                    <Text style={{ color: '#166534', fontSize: 12, marginTop: 2 }}>Processed via Razorpay</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Payout schedule from the financial model */}
                <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 14 }}>
                  Payouts are triggered automatically when disruption thresholds are met:
                </Text>
                {[
                  { icon: '🌧️', trigger: 'Heavy rain (IMD >15mm/hr)', amount: '₹300–500/shift' },
                  { icon: '🌡️', trigger: 'Extreme heat (>43°C, 2+ hrs)', amount: '₹250–400/shift' },
                  { icon: '📵', trigger: 'Platform outage (>90 min)', amount: '₹200–350' },
                  { icon: '🚧', trigger: 'Curfew / lockdown', amount: '₹500–700/day' },
                ].map((row, i, arr) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: '#f1f5f9' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 16, marginRight: 10 }}>{row.icon}</Text>
                      <Text style={{ color: '#334155', fontSize: 13, flex: 1 }}>{row.trigger}</Text>
                    </View>
                    <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 13 }}>{row.amount}</Text>
                  </View>
                ))}
                <View style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginTop: 14, flexDirection: 'row', alignItems: 'center' }}>
                  <ShieldCheck color="#64748b" size={15} />
                  <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>File a claim on the Claims tab after a disruption</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── Notification Overlay (inside screen so it stays in phone frame) ── */}
      {notifOpen && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
          <TouchableOpacity activeOpacity={1} onPress={() => setNotifOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
          <View style={{ position: 'absolute', top: 100, right: 16, left: 16, backgroundColor: '#ffffff', borderRadius: 18, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: '#0f172a' }}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifOpen(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X color="#94a3b8" size={18} />
              </TouchableOpacity>
            </View>

            {!hasNotifs ? (
              <View style={{ paddingVertical: 36, alignItems: 'center' }}>
                <Bell color="#cbd5e1" size={32} />
                <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 12, fontWeight: '500' }}>No notifications</Text>
                <Text style={{ color: '#cbd5e1', fontSize: 12, marginTop: 4 }}>You're all caught up.</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                {notifications.map((n, idx) => (
                  <View key={n.id} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: idx < notifications.length - 1 ? 1 : 0, borderBottomColor: '#f8fafc' }}>
                    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: `${n.color}18`, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 1 }}>
                      <NotifIcon type={n.icon} color={n.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <Text style={{ fontWeight: '700', fontSize: 13, color: '#0f172a', flex: 1, marginRight: 8 }}>{n.title}</Text>
                        <Text style={{ fontSize: 11, color: '#94a3b8' }}>{n.time}</Text>
                      </View>
                      <Text style={{ fontSize: 12, color: '#64748b', lineHeight: 17 }}>{n.body}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
