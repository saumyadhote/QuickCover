import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, FileText, Download, Eye, ShieldCheck, Phone, Info, HelpCircle, Award } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const initial = user?.name?.[0]?.toUpperCase() ?? '?';
  const platformLabel = user?.platform
    ? user.platform.charAt(0).toUpperCase() + user.platform.slice(1) + ' Partner'
    : 'Partner';

  const handleSignOut = async () => {
    await logout();
    router.replace('/login-form');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: 56 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', paddingBottom: 24 }}>
        <View style={{ marginRight: 16 }}><ArrowLeft color="#1e293b" size={24} /></View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b' }}>Profile</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* User Info Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32, paddingHorizontal: 8 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 24 }}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>{user?.name ?? '—'}</Text>
            <View style={{ backgroundColor: '#dcfce7', flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, marginBottom: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e', marginRight: 6 }} />
              <Text style={{ color: '#15803d', fontSize: 12, fontWeight: '700' }}>{platformLabel}</Text>
            </View>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>{user?.email}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>{user?.phone ?? 'No phone'} · ID: {user?.driverId}</Text>
          </View>
        </View>

        {/* Digital Locker Card */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9' }}>
          <Text style={{ fontWeight: '700', fontSize: 18, color: '#1e293b', marginBottom: 16 }}>Digital Locker</Text>

          {/* Policy Certificate Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <FileText color="#3b82f6" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#1e293b', fontWeight: '700', fontSize: 14 }}>Policy Certificate</Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Valid until Dec 2026</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Eye color="#64748b" size={20} />
              <Download color="#64748b" size={20} />
            </View>
          </View>

          {/* Coverage Terms Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#faf5ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <ShieldCheck color="#a855f7" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#1e293b', fontWeight: '700', fontSize: 14 }}>Coverage Terms</Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Updated Mar 2026</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Eye color="#64748b" size={20} />
              <Download color="#64748b" size={20} />
            </View>
          </View>

          {/* Weekly Summary Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 16, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <FileText color="#10b981" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#1e293b', fontWeight: '700', fontSize: 14 }}>Weekly Coverage Summary</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Eye color="#64748b" size={20} />
              <Download color="#64748b" size={20} />
            </View>
          </View>
        </View>

        {/* Your Stats Card */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9' }}>
          <Text style={{ fontWeight: '700', fontSize: 18, color: '#1e293b', marginBottom: 16 }}>Your Stats</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={{ backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', flex: 1, borderRadius: 16, paddingVertical: 16, marginRight: 8 }}>
              <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 20, marginBottom: 4 }}>342</Text>
              <Text style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Total Trips</Text>
            </View>
            <View style={{ backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', flex: 1, borderRadius: 16, paddingVertical: 16, marginHorizontal: 4 }}>
              <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 20, marginBottom: 4 }}>12</Text>
              <Text style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>High-Risk{'\n'}Zones</Text>
            </View>
            <View style={{ backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', flex: 1, borderRadius: 16, paddingVertical: 16, marginLeft: 8 }}>
              <Text style={{ color: '#16a34a', fontWeight: '700', fontSize: 20, marginBottom: 4 }}>94%</Text>
              <Text style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Safety Score</Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#dcfce7', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#bbf7d0' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Award color="#ffffff" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#14532d', fontWeight: '700', fontSize: 15, marginBottom: 2 }}>Low-Risk Zone Operator</Text>
              <Text style={{ color: '#15803d', fontSize: 12 }}>Safe delivery champion</Text>
            </View>
          </View>
        </View>

        {/* Help & Support Card */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: '#f1f5f9' }}>
          <Text style={{ fontWeight: '700', fontSize: 18, color: '#1e293b', marginBottom: 16 }}>Help & Support</Text>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 4 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Phone color="#3b82f6" size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#1e293b', fontWeight: '700', fontSize: 15 }}>24×7 Worker Helpline</Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>1800-XXX-XXXX</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#faf5ff', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Info color="#a855f7" size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#1e293b', fontWeight: '700', fontSize: 15 }}>Government Welfare Programs</Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Social security benefits</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <HelpCircle color="#10b981" size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#1e293b', fontWeight: '700', fontSize: 15 }}>Insurance FAQ</Text>
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>Common questions</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Links */}
        <View style={{ paddingHorizontal: 8, marginBottom: 40 }}>
          <TouchableOpacity style={{ marginBottom: 24 }}>
            <Text style={{ color: '#475569', fontWeight: '500', fontSize: 14 }}>Account Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginBottom: 24 }}>
            <Text style={{ color: '#475569', fontWeight: '500', fontSize: 14 }}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 14 }}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
