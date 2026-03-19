import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useMockData } from '../context/MockDataContext';
import { Check, ShieldCheck, Zap, Sparkles, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const { state, acceptTrip } = useMockData();
  const router = useRouter();

  const microFee = state?.currentMicroFee?.toFixed(2) ?? '2.00';
  const riskLevel = state?.currentRiskLevel ?? 'Low';
  const riskColor = riskLevel === 'Low' ? '#16a34a' : riskLevel === 'Medium' ? '#d97706' : '#dc2626';
  const riskBg   = riskLevel === 'Low' ? '#f0fdf4' : riskLevel === 'Medium' ? '#fffbeb' : '#fef2f2';
  const riskBorder = riskLevel === 'Low' ? '#bbf7d0' : riskLevel === 'Medium' ? '#fde68a' : '#fecaca';

  const handleActivate = async () => {
    await acceptTrip();
    router.replace('/(tabs)' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Fixed header */}
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 2 }}>Setup — Step {step} of 3</Text>
        {/* Progress bar */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
          {[1, 2, 3].map(s => (
            <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: step >= s ? '#16a34a' : '#e2e8f0' }} />
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* ── Step 1: How it works ── */}
        {step === 1 && (
          <View>
            <Text style={{ fontWeight: '700', fontSize: 24, color: '#0f172a', marginBottom: 6, marginTop: 8 }}>Welcome to QuickCover</Text>
            <Text style={{ color: '#64748b', fontSize: 15, lineHeight: 22, marginBottom: 24 }}>
              You're protected the moment you accept a trip — funded entirely by consumers, at zero cost to you.
            </Text>

            {/* Live surcharge pill */}
            <View style={{ backgroundColor: riskBg, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderWidth: 1, borderColor: riskBorder }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TrendingUp color={riskColor} size={16} />
                <Text style={{ marginLeft: 8, fontSize: 13, color: riskColor, fontWeight: '600' }}>Today's consumer surcharge</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>₹{microFee}/order</Text>
                <View style={{ backgroundColor: riskColor, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 }}>
                  <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>{riskLevel.toUpperCase()}</Text>
                </View>
              </View>
            </View>

            {[
              {
                icon: <ShieldCheck color="#ffffff" size={20} />,
                bg: '#16a34a',
                title: 'Income Protection',
                body: 'Get compensated ₹300–700 per disrupted shift — heavy rain, extreme heat, platform outages, or curfews.',
              },
              {
                icon: <Zap color="#ffffff" size={20} />,
                bg: '#2563eb',
                title: 'Trip-Level Coverage',
                body: "Coverage activates the moment you accept a trip. You're only covered when you're working — no monthly fees, no gaps.",
              },
              {
                icon: <Sparkles color="#ffffff" size={20} />,
                bg: '#7c3aed',
                title: 'Zero Cost to You — Ever',
                body: 'Your protection is 100% funded by a ₹2–5 surcharge on the consumer\'s order. The driver pays nothing.',
              },
            ].map((card, i) => (
              <View key={i} style={{ backgroundColor: '#ffffff', borderRadius: 18, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: card.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  {card.icon}
                </View>
                <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 15, marginBottom: 6 }}>{card.title}</Text>
                <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20 }}>{card.body}</Text>
              </View>
            ))}

            {/* Payout triggers quick ref */}
            <View style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 28, borderWidth: 1, borderColor: '#e2e8f0' }}>
              <Text style={{ fontWeight: '700', fontSize: 13, color: '#0f172a', marginBottom: 12 }}>What triggers a payout</Text>
              {[
                { e: '🌧️', t: 'Heavy rain', v: 'IMD >15mm/hr in zone', p: '₹300–500' },
                { e: '🌡️', t: 'Extreme heat', v: '>43°C for 2+ hrs', p: '₹250–400' },
                { e: '📵', t: 'Platform outage', v: 'Zone down >90 min', p: '₹200–350' },
                { e: '🚧', t: 'Curfew / lockdown', v: 'Govt. notification', p: '₹500–700' },
              ].map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#f1f5f9' }}>
                  <Text style={{ fontSize: 16, marginRight: 10 }}>{row.e}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155' }}>{row.t}</Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8' }}>{row.v}</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>{row.p}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={() => setStep(2)} style={{ backgroundColor: '#16a34a', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16 }}>Got it — Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 2: Connect account ── */}
        {step === 2 && (
          <View>
            <Text style={{ fontWeight: '700', fontSize: 24, color: '#0f172a', marginBottom: 6, marginTop: 8 }}>Connect Your Account</Text>
            <Text style={{ color: '#64748b', fontSize: 15, lineHeight: 22, marginBottom: 24 }}>
              We've already imported your worker profile from signup. Confirm it's correct below.
            </Text>

            {/* "Connected" card — read-only confirmation */}
            <View style={{ backgroundColor: '#ffffff', borderRadius: 18, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#bbf7d0' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#fbbf24', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#1e293b' }}>B</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 15 }}>Blinkit Partner Account</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Profile imported from registration</Text>
                </View>
                <View style={{ backgroundColor: '#dcfce7', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ color: '#166534', fontSize: 12, fontWeight: '700' }}>✓ Linked</Text>
                </View>
              </View>
              {[
                { label: 'Worker ID & Name', status: '✓ Imported' },
                { label: 'Vehicle Type', status: '✓ Imported' },
                { label: 'Delivery Zone', status: '✓ Imported' },
              ].map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
                  <Check color="#16a34a" size={16} />
                  <Text style={{ color: '#334155', fontSize: 14, marginLeft: 10, flex: 1 }}>{item.label}</Text>
                  <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: '600' }}>{item.status}</Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setStep(1)} style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: '#334155', fontWeight: '700', fontSize: 15 }}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep(3)} style={{ flex: 1, backgroundColor: '#16a34a', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Step 3: Data permissions + Activate ── */}
        {step === 3 && (
          <View>
            <Text style={{ fontWeight: '700', fontSize: 24, color: '#0f172a', marginBottom: 6, marginTop: 8 }}>Data Permissions</Text>
            <Text style={{ color: '#64748b', fontSize: 15, lineHeight: 22, marginBottom: 24 }}>
              We need these to verify disruption reports and process your payouts. This is a one-time setup.
            </Text>

            <View style={{ backgroundColor: '#ffffff', borderRadius: 18, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
              {[
                {
                  title: 'Trip Telemetry Access',
                  body: 'Confirms you had an active trip during the reported disruption — required for payout eligibility.',
                },
                {
                  title: 'GPS Routing Data',
                  body: 'Cross-referenced with IMD zone data to confirm you were physically in the disrupted area when you filed the claim.',
                },
                {
                  title: 'Device Sensor Data',
                  body: 'Accelerometer + gyroscope verify you were on-route — part of our anti-spoofing checks. You report; we verify objectively.',
                },
                {
                  title: 'Delivery Timestamps',
                  body: 'Used to calculate your protected earnings window and confirm coverage was active at the time of disruption.',
                },
              ].map((item, i, arr) => (
                <View key={i} style={{ marginBottom: i < arr.length - 1 ? 16 : 0, paddingBottom: i < arr.length - 1 ? 16 : 0, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: '#f1f5f9' }}>
                  <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 14, marginBottom: 4 }}>{item.title}</Text>
                  <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 19 }}>{item.body}</Text>
                </View>
              ))}
            </View>

            {/* Privacy note */}
            <View style={{ backgroundColor: '#f0fdf4', borderRadius: 14, padding: 16, marginBottom: 28, borderWidth: 1, borderColor: '#bbf7d0' }}>
              <Text style={{ color: '#166534', fontSize: 13, lineHeight: 20 }}>
                <Text style={{ fontWeight: '700' }}>Privacy First: </Text>
                All data is encrypted end-to-end and used solely for claim verification. Never shared with third parties or your platform.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setStep(2)} style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: '#334155', fontWeight: '700', fontSize: 15 }}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleActivate} style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}>
                <LinearGradient colors={['#16a34a', '#15803d']} style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Activate Protection</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
