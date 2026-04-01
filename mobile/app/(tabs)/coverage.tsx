import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMockData } from '../../context/MockDataContext';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, Zap, ShieldCheck, Clock, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COVERED_EVENTS = [
  { icon: '🌧️', label: 'Rain / Flood', sub: 'Heavy rain or flooding in your zone', maxPayout: '₹300', isZeroTouch: true },
  { icon: '🚧', label: 'Road Block / Traffic Jam', sub: 'Blocked roads adding 15+ min to trip', maxPayout: '₹200', isZeroTouch: true },
  { icon: '🏪', label: 'Zone Outage / Market Closed', sub: 'Pickup location unexpectedly shut', maxPayout: '₹150', isZeroTouch: false },
  { icon: '🌡️', label: 'Extreme Heat', sub: 'Temperature >43°C for 2+ hours', maxPayout: '₹400', isZeroTouch: true },
  { icon: '🚔', label: 'Public Strike / Bandh', sub: 'City-wide strike blocking operations', maxPayout: '₹250', isZeroTouch: false },
  { icon: '📵', label: 'Platform Outage', sub: 'App down >90 minutes in your zone', maxPayout: '₹350', isZeroTouch: true },
];

const HOW_CLAIMS_WORK = [
  { step: '01', icon: <Zap color="#7c3aed" size={18} />, title: 'Auto-detected in real time', body: 'We use weather, traffic, and market APIs to detect disruptions the moment they happen and file a claim on your behalf.' },
  { step: '02', icon: <ShieldCheck color="#7c3aed" size={18} />, title: 'One photo if we miss it', body: 'If a qualifying event isn\'t auto-detected, snap one photo as proof. No forms, no phone calls.' },
  { step: '03', icon: <Star color="#7c3aed" size={18} />, title: 'AI decides in under 3 min', body: 'Our AI reviews your submission and approves instantly — no manual reviewers, no wait queues.' },
];

export default function CoverageScreen() {
  const { state } = useMockData();
  const router = useRouter();
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const activeCovers = 3;
  const totalPaid = 5000;
  const remaining = 3165;

  const visibleEvents = showAll ? COVERED_EVENTS : COVERED_EVENTS.slice(0, 3);

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
          style={{ paddingTop: 56, paddingBottom: 32, paddingHorizontal: 20 }}
        >
          {/* Active coverage badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ade80', marginRight: 7 }} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#4ade80', letterSpacing: 1, textTransform: 'uppercase' }}>Active Coverage</Text>
          </View>

          <Text style={{ fontSize: 30, fontWeight: '800', color: '#ffffff', marginBottom: 6 }}>Your Coverage</Text>
          <Text style={{ fontSize: 14, color: '#a78bfa', marginBottom: 24, lineHeight: 20 }}>
            You're automatically covered for disruptions that affect your deliveries.
          </Text>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#ffffff' }}>{activeCovers}</Text>
              <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, fontWeight: '600', textAlign: 'center' }}>Active covers</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#ffffff' }}>₹{(totalPaid / 1000).toFixed(0)}K</Text>
              <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, fontWeight: '600', textAlign: 'center' }}>Total paid</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#4ade80' }}>₹{remaining.toLocaleString()}</Text>
              <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, fontWeight: '600', textAlign: 'center' }}>Remaining</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* ── Covered Events ── */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontWeight: '800', fontSize: 15, color: '#0f172a' }}>Covered Events</Text>
              <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                <Text style={{ fontSize: 13, color: '#7c3aed', fontWeight: '700' }}>{showAll ? 'Show less' : 'Tap to expand +'}</Text>
              </TouchableOpacity>
            </View>

            {visibleEvents.map((event, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setExpandedEvent(expandedEvent === i ? null : i)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: i < visibleEvents.length - 1 ? 1 : 0, borderBottomColor: '#f8fafc' }}
              >
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center', marginRight: 13 }}>
                  <Text style={{ fontSize: 20 }}>{event.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>{event.label}</Text>
                    {event.isZeroTouch && (
                      <View style={{ backgroundColor: '#ede9fe', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: '#7c3aed', letterSpacing: 0.5 }}>ZERO-TOUCH</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 12, color: '#64748b' }} numberOfLines={expandedEvent === i ? undefined : 1}>{event.sub}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 3 }}>{event.maxPayout}</Text>
                  <ChevronDown color="#94a3b8" size={14} style={{ transform: [{ rotate: expandedEvent === i ? '180deg' : '0deg' }] }} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── How Claims Work ── */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <Text style={{ fontWeight: '800', fontSize: 15, color: '#0f172a', marginBottom: 16 }}>How claims work</Text>
            {HOW_CLAIMS_WORK.map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: i < HOW_CLAIMS_WORK.length - 1 ? 18 : 0 }}>
                {/* Step connector */}
                <View style={{ alignItems: 'center', marginRight: 14 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#ede9fe' }}>
                    {item.icon}
                  </View>
                  {i < HOW_CLAIMS_WORK.length - 1 && (
                    <View style={{ width: 2, height: 18, backgroundColor: '#ede9fe', marginTop: 4 }} />
                  )}
                </View>
                <View style={{ flex: 1, paddingTop: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>{item.title}</Text>
                  <Text style={{ fontSize: 12, color: '#64748b', lineHeight: 18 }}>{item.body}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── CTA Card ── */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, borderWidth: 2, borderColor: '#ede9fe' }}>
            <Text style={{ fontWeight: '800', fontSize: 15, color: '#0f172a', marginBottom: 4 }}>Need to act?</Text>
            <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Start a claim or review your history</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/claims')}
              style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}
            >
              <LinearGradient colors={['#7c3aed', '#6d28d9']} style={{ paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 15 }}>+ Start a claim</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/claims')}
              style={{ backgroundColor: '#f5f3ff', borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#ede9fe' }}
            >
              <Clock color="#7c3aed" size={16} />
              <Text style={{ color: '#7c3aed', fontWeight: '700', fontSize: 14 }}>View claim history</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
