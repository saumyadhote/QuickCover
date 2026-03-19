import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMockData } from '../../context/MockDataContext';
import { useRouter } from 'expo-router';
import { Check, ShieldCheck, Zap, Sparkles, ChevronRight, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CoverageScreen() {
  const [step, setStep] = useState(1);
  const { state, acceptTrip } = useMockData();
  const router = useRouter();

  const microFee = state?.currentMicroFee?.toFixed(2) ?? '2.00';
  const riskLevel = state?.currentRiskLevel ?? 'Low';
  const riskColor = riskLevel === 'Low' ? '#16a34a' : riskLevel === 'Medium' ? '#d97706' : '#dc2626';
  const riskBg = riskLevel === 'Low' ? '#f0fdf4' : riskLevel === 'Medium' ? '#fffbeb' : '#fef2f2';

  const handleActivate = async () => {
    await acceptTrip();
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc', paddingTop: 56 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a' }}>Coverage</Text>
        <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>Your protection details</Text>
      </View>

      {/* Progress Bar */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
          {[1, 2, 3].map(s => (
            <View
              key={s}
              style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: step >= s ? '#16a34a' : '#e2e8f0' }}
            />
          ))}
        </View>
        <Text style={{ fontSize: 12, color: '#94a3b8' }}>Step {step} of 3</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* ── Step 1: Connect Account ── */}
        {step === 1 && (
          <View>
            <Text style={{ fontWeight: '700', fontSize: 22, color: '#0f172a', marginBottom: 6 }}>Connect Your Account</Text>
            <Text style={{ color: '#64748b', fontSize: 15, lineHeight: 22, marginBottom: 24 }}>
              Link your delivery platform to import your worker details automatically.
            </Text>

            {/* Live pricing pill */}
            <View style={{ backgroundColor: riskBg, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderWidth: 1, borderColor: riskLevel === 'Low' ? '#bbf7d0' : riskLevel === 'Medium' ? '#fde68a' : '#fecaca' }}>
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

            {/* Platform SSO button */}
            <TouchableOpacity
              style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#fbbf24', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#1e293b' }}>B</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 15 }}>Sign in with Blinkit</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Auto-imports your worker profile</Text>
                </View>
              </View>
              <ChevronRight color="#94a3b8" size={20} />
            </TouchableOpacity>

            {/* What we import */}
            <View style={{ backgroundColor: '#eff6ff', borderRadius: 16, padding: 18, marginBottom: 28, borderWidth: 1, borderColor: '#bfdbfe' }}>
              <Text style={{ color: '#1e40af', fontWeight: '700', fontSize: 13, marginBottom: 12 }}>What we'll import:</Text>
              {['Worker ID & Name', 'Vehicle Type', 'Delivery Zone'].map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i < 2 ? 10 : 0 }}>
                  <Check color="#3b82f6" size={16} />
                  <Text style={{ color: '#2563eb', fontSize: 14, marginLeft: 10 }}>{item}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setStep(2)}
              style={{ backgroundColor: '#16a34a', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16 }}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step 2: How It Works ── */}
        {step === 2 && (
          <View>
            <Text style={{ fontWeight: '700', fontSize: 22, color: '#0f172a', marginBottom: 6 }}>How It Works</Text>
            <Text style={{ color: '#64748b', fontSize: 15, marginBottom: 24 }}>
              Your protection benefits — funded entirely by consumers, at zero cost to you.
            </Text>

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
                body: 'Coverage activates the moment you accept a trip. No monthly subscription, no gaps — you\'re only covered when you\'re working.',
              },
              {
                icon: <Sparkles color="#ffffff" size={20} />,
                bg: '#7c3aed',
                title: 'Zero Cost to You — Ever',
                body: 'Your protection is 100% funded by a ₹2–5 surcharge on the consumer\'s order. The driver pays nothing. Not now, not ever.',
              },
            ].map((card, i) => (
              <View key={i} style={{ backgroundColor: '#ffffff', borderRadius: 18, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: card.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  {card.icon}
                </View>
                <Text style={{ fontWeight: '700', color: '#0f172a', fontSize: 15, marginBottom: 6 }}>{card.title}</Text>
                <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20 }}>{card.body}</Text>
              </View>
            ))}

            {/* Payout triggers quick ref */}
            <View style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 28, borderWidth: 1, borderColor: '#e2e8f0' }}>
              <Text style={{ fontWeight: '700', fontSize: 13, color: '#0f172a', marginBottom: 12 }}>Payout triggers</Text>
              {[
                { e: '🌧️', t: 'Heavy rain', v: 'IMD >15mm/hr', p: '₹300–500' },
                { e: '🌡️', t: 'Extreme heat', v: '>43°C for 2+ hrs', p: '₹250–400' },
                { e: '📵', t: 'Platform outage', v: 'Zone down >90 min', p: '₹200–350' },
                { e: '🚧', t: 'Curfew / lockdown', v: 'Govt. notification', p: '₹500–700' },
              ].map((row, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#f1f5f9' }}>
                  <Text style={{ fontSize: 16, marginRight: 10 }}>{row.e}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155' }}>{row.t}</Text>
                    <Text style={{ fontSize: 11, color: '#94a3b8' }}>{row.v}</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a' }}>{row.p}</Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setStep(1)} style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: '#334155', fontWeight: '700', fontSize: 15 }}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep(3)} style={{ flex: 1, backgroundColor: '#16a34a', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Step 3: Data Permissions + Activate ── */}
        {step === 3 && (
          <View>
            <Text style={{ fontWeight: '700', fontSize: 22, color: '#0f172a', marginBottom: 6 }}>Data Permissions</Text>
            <Text style={{ color: '#64748b', fontSize: 15, lineHeight: 22, marginBottom: 24 }}>
              We need these permissions to verify your disruption reports and process payouts accurately.
            </Text>

            <View style={{ backgroundColor: '#ffffff', borderRadius: 18, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
              {[
                {
                  title: 'Trip Telemetry Access',
                  body: 'Lets us confirm you had an active trip during the reported disruption window — required for payout eligibility.',
                },
                {
                  title: 'GPS Routing Data',
                  body: 'Cross-referenced against IMD zone data to confirm you were physically in the disrupted area.',
                },
                {
                  title: 'Device Sensor Data',
                  body: 'Accelerometer + gyroscope readings verify you were moving on-route — part of our anti-spoofing checks. You report; we verify objectively.',
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
                All data is encrypted end-to-end and used solely for claim verification. We never share it with third parties or your delivery platform.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setStep(2)} style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: '#334155', fontWeight: '700', fontSize: 15 }}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleActivate}
                style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}
              >
                <LinearGradient
                  colors={['#16a34a', '#15803d']}
                  style={{ paddingVertical: 16, alignItems: 'center' }}
                >
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
