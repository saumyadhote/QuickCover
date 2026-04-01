import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { useMockData } from '../../context/MockDataContext';
import {
  Pencil, Shield, Wallet, CreditCard, Building2, Plus,
  Bell, Lock, HelpCircle, MessageCircle, FileText, LogOut, ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const RECENT_PAYOUTS = [
  { icon: '🌧️', label: 'Heavy Rain', trip: '#8842', date: '29 Mar', amount: 240, method: 'Wallet' },
  { icon: '🚧', label: 'Road Closure', trip: '#8801', date: '22 Mar', amount: 180, method: 'Bank' },
  { icon: '🌊', label: 'Flash Flood', trip: '#8773', date: '14 Mar', amount: 420, method: 'Bank' },
  { icon: '🚂', label: 'Train Delay', trip: '#8740', date: '1 Mar', amount: 65, method: 'Wallet' },
];

const PAYOUT_METHODS = [
  { icon: <Wallet color="#7c3aed" size={20} />, bg: '#f5f3ff', label: 'In-app Wallet', sub: 'Balance: ₹435', isPrimary: true },
  { icon: <CreditCard color="#0ea5e9" size={20} />, bg: '#f0f9ff', label: 'UPI', sub: 'arjun@okaxis', isPrimary: false },
  { icon: <Building2 color="#64748b" size={20} />, bg: '#f8fafc', label: 'Bank Transfer', sub: 'HDFC — 4321', isPrimary: false },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { state, eligibility } = useMockData();
  const router = useRouter();
  const [claimNotifications, setClaimNotifications] = useState(true);

  const initial = user?.name?.[0]?.toUpperCase() ?? '?';
  const platformLabel = user?.platform
    ? user.platform.charAt(0).toUpperCase() + user.platform.slice(1) + ' Partner'
    : 'Partner';

  const totalEarned = (state?.weeklyEarnings ?? 0) + (state?.weeklyProtected ?? 0);
  const claimsFiled = 12;
  const approved = 11;
  const successRate = Math.round((approved / claimsFiled) * 100);
  const avgPayout = '<3m';

  const handleSignOut = async () => {
    await logout();
    router.replace('/login-form');
  };

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
          style={{ paddingTop: 56, paddingBottom: 36, paddingHorizontal: 20 }}
        >
          {/* Avatar + edit */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ position: 'relative', marginRight: 14 }}>
                <LinearGradient colors={['#7c3aed', '#6d28d9']} style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' }}>
                  <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 24 }}>{initial}</Text>
                </LinearGradient>
                {/* KYC badge */}
                <View style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: '#4ade80', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1.5, borderColor: '#0f0a1e' }}>
                  <Text style={{ fontSize: 8, fontWeight: '800', color: '#14532d' }}>KYC ✓</Text>
                </View>
              </View>
              <View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#ffffff', marginBottom: 3 }}>{user?.name ?? '—'}</Text>
                <Text style={{ fontSize: 12, color: '#94a3b8', marginBottom: 5 }}>{user?.email ?? '—'} · +91 {user?.phone ?? '—'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ backgroundColor: 'rgba(74,222,128,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#4ade80' }}>{platformLabel}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#64748b' }}>Member since Jan 2025</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
              <Pencil color="#e2e8f0" size={16} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {/* ── Stats ── */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <Text style={{ fontWeight: '800', fontSize: 15, color: '#0f172a', marginBottom: 14 }}>Your Stats</Text>

            {/* Total earned */}
            <View style={{ backgroundColor: '#f5f3ff', borderRadius: 14, padding: 14, marginBottom: 12 }}>
              <Text style={{ fontSize: 11, color: '#7c3aed', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Total Earned</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#0f172a' }}>₹{totalEarned.toLocaleString()}</Text>
                <View style={{ backgroundColor: '#dcfce7', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a' }}>+₹420 this month</Text>
                </View>
              </View>
              {/* Mini bar chart placeholder */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 12, height: 28 }}>
                {[0.4, 0.6, 0.5, 0.8, 0.7, 1.0, 0.9].map((h, i) => (
                  <View key={i} style={{ flex: 1, height: 28 * h, backgroundColor: i === 6 ? '#7c3aed' : '#ede9fe', borderRadius: 4 }} />
                ))}
              </View>
              <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 6 }}>Last 8 weeks · Oct → Nov</Text>
            </View>

            {/* 4-stat grid */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              {[
                { value: String(claimsFiled), label: 'Claims filed', color: '#0f172a' },
                { value: String(approved), label: 'Approved', color: '#0f172a' },
                { value: `${successRate}%`, label: 'Success rate', color: '#16a34a' },
                { value: avgPayout, label: 'Avg payout', color: '#0f172a' },
              ].map((stat, i) => (
                <View key={i} style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: stat.color, marginBottom: 3 }}>{stat.value}</Text>
                  <Text style={{ fontSize: 9, color: '#64748b', fontWeight: '600', textAlign: 'center' }}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Trust score */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1, backgroundColor: '#fff7ed', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#fed7aa' }}>
                <Text style={{ fontSize: 10, color: '#ea580c', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Trust Score</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a' }}>94</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#ea580c', marginTop: 2 }}>Excellent</Text>
                <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Based on claim history</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#f0fdf4', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#bbf7d0' }}>
                <Text style={{ fontSize: 10, color: '#16a34a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Avg Decision</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a' }}>2:41</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a', marginTop: 2 }}>minutes · auto-approval</Text>
                <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Faster than 78% of users</Text>
              </View>
            </View>
          </View>

          {/* ── Payout Settings ── */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <View style={{ paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontWeight: '800', fontSize: 15, color: '#0f172a' }}>Payout Settings</Text>
            </View>
            {PAYOUT_METHODS.map((method, i) => (
              <TouchableOpacity key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: i < PAYOUT_METHODS.length - 1 ? 1 : 0, borderBottomColor: '#f8fafc' }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: method.bg, alignItems: 'center', justifyContent: 'center', marginRight: 13 }}>
                  {method.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>{method.label}</Text>
                    {method.isPrimary && (
                      <View style={{ backgroundColor: '#7c3aed', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: '#ffffff' }}>PRIMARY</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{method.sub}</Text>
                </View>
                <ChevronRight color="#cbd5e1" size={18} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginRight: 13, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#cbd5e1' }}>
                <Plus color="#94a3b8" size={18} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b' }}>Add payout method</Text>
            </TouchableOpacity>
          </View>

          {/* ── Recent Payouts ── */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontWeight: '800', fontSize: 15, color: '#0f172a' }}>Recent Payouts</Text>
              <TouchableOpacity>
                <Text style={{ fontSize: 13, color: '#7c3aed', fontWeight: '700' }}>View all</Text>
              </TouchableOpacity>
            </View>
            {RECENT_PAYOUTS.map((payout, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: i < RECENT_PAYOUTS.length - 1 ? 1 : 0, borderBottomColor: '#f8fafc' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 18 }}>{payout.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>{payout.label} · Trip {payout.trip}</Text>
                  <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    {payout.date} · via {payout.method === 'Wallet' ? '💜' : '🏦'} {payout.method}
                  </Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#16a34a' }}>+₹{payout.amount}</Text>
              </View>
            ))}
          </View>

          {/* ── Notifications & Privacy ── */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            {/* Claim notifications toggle */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f8fafc' }}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center', marginRight: 13 }}>
                <Bell color="#7c3aed" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>Claim notifications</Text>
                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Instant push when a payout lands</Text>
              </View>
              <Switch
                value={claimNotifications}
                onValueChange={setClaimNotifications}
                trackColor={{ false: '#e2e8f0', true: '#7c3aed' }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Privacy note */}
            <View style={{ paddingHorizontal: 18, paddingVertical: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center', marginRight: 13 }}>
                  <Lock color="#7c3aed" size={20} />
                </View>
                <View style={{ flex: 1, paddingTop: 2 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>Your data is safe with us</Text>
                  <Text style={{ fontSize: 12, color: '#64748b', lineHeight: 17 }}>
                    All payouts are processed through RBI-compliant channels. We never store card details.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Support ── */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <View style={{ paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontWeight: '800', fontSize: 15, color: '#0f172a' }}>Support</Text>
            </View>
            {[
              { icon: <HelpCircle color="#7c3aed" size={20} />, bg: '#f5f3ff', label: 'Help center', sub: 'FAQs, guides & claim tips' },
              { icon: <MessageCircle color="#0ea5e9" size={20} />, bg: '#f0f9ff', label: 'Contact support', sub: 'Usually responds in <5 min' },
              { icon: <FileText color="#64748b" size={20} />, bg: '#f8fafc', label: 'Terms & privacy', sub: 'How we use your data' },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: '#f8fafc' }}>
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', marginRight: 13 }}>
                  {item.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>{item.label}</Text>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.sub}</Text>
                </View>
                <ChevronRight color="#cbd5e1" size={18} />
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Sign Out ── */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={{ backgroundColor: '#ffffff', borderRadius: 16, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#fecaca', marginBottom: 8 }}
          >
            <LogOut color="#dc2626" size={18} />
            <Text style={{ color: '#dc2626', fontWeight: '700', fontSize: 15 }}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
