import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useMockData } from '../../context/MockDataContext';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle2, Clock, Circle, Camera, Image as ImageIcon,
  ChevronDown, X, Plus, Filter, ChevronRight,
} from 'lucide-react-native';

const DISRUPTION_TYPES = [
  { id: 'WEATHER', label: 'Heavy Rain', icon: '🌧️', maxPayout: '₹300' },
  { id: 'TRAFFIC', label: 'Road Block', icon: '🚧', maxPayout: '₹200' },
  { id: 'FLOOD', label: 'Flooding', icon: '🌊', maxPayout: '₹500' },
  { id: 'OUTAGE', label: 'Shop Closed', icon: '🏪', maxPayout: '₹150' },
  { id: 'HEAT', label: 'Extreme Heat', icon: '🌡️', maxPayout: '₹400' },
  { id: 'CURFEW', label: 'Curfew', icon: '🚔', maxPayout: '₹700' },
];

// ── Mock recent claims ───────────────────────────────────────────────────────
const RECENT_CLAIMS = [
  { id: 1, type: 'Heavy Rain', icon: '🌧️', status: 'Auto-approved', statusColor: '#16a34a', statusBg: '#dcfce7', amount: 240, route: 'Mumbai → Pune', date: '29 Mar 2026' },
  { id: 2, type: 'Road Closure', icon: '🚧', status: 'Auto-approved', statusColor: '#16a34a', statusBg: '#dcfce7', amount: 180, route: 'Bangalore → Mysore', date: '22 Mar 2026' },
  { id: 3, type: 'Flash Flood', icon: '🌊', status: 'Manual-approved', statusColor: '#7c3aed', statusBg: '#ede9fe', amount: 420, route: 'Chennai → Vellore', date: '14 Mar 2026' },
  { id: 4, type: 'Strike', icon: '✊', status: 'Rejected', statusColor: '#dc2626', statusBg: '#fee2e2', amount: 150, route: 'Delhi → Agra', date: '8 Mar 2026' },
  { id: 5, type: 'Train Delay', icon: '🚂', status: 'Auto-approved', statusColor: '#16a34a', statusBg: '#dcfce7', amount: 95, route: 'Hyderabad → Vijayawada', date: '1 Mar 2026' },
];

// ── Claim Form Sheet ─────────────────────────────────────────────────────────
function ClaimForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (type: string, desc: string, hours: number) => void }) {
  const [selectedType, setSelectedType] = useState(DISRUPTION_TYPES[0]);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [description, setDescription] = useState('');
  const [hoursWorked, setHoursWorked] = useState('2');
  const [photoAdded, setPhotoAdded] = useState(false);

  const parsedHours = Math.min(8, Math.max(1, parseFloat(hoursWorked) || 1));
  const canSubmit = description.trim().length > 10;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 20, maxHeight: 620 }}>
          <View style={{ alignItems: 'center', paddingTop: 12, marginBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0' }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
            <Text style={{ fontWeight: '800', fontSize: 18, color: '#0f172a' }}>Report a Disruption</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X color="#94a3b8" size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ paddingHorizontal: 20 }} contentContainerStyle={{ paddingTop: 20, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>Disruption Type</Text>
            <TouchableOpacity onPress={() => setShowTypePicker(!showTypePicker)} style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 14, color: '#0f172a', fontWeight: '600' }}>{selectedType.icon}  {selectedType.label}</Text>
              <ChevronDown color="#94a3b8" size={18} />
            </TouchableOpacity>

            {showTypePicker && (
              <View style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, marginBottom: 4, overflow: 'hidden' }}>
                {DISRUPTION_TYPES.map((t, i) => (
                  <TouchableOpacity key={t.id} onPress={() => { setSelectedType(t); setShowTypePicker(false); }} style={{ paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: i < DISRUPTION_TYPES.length - 1 ? 1 : 0, borderBottomColor: '#e2e8f0', backgroundColor: selectedType.id === t.id ? '#f5f3ff' : '#f8fafc' }}>
                    <Text style={{ fontSize: 14, color: selectedType.id === t.id ? '#7c3aed' : '#334155', fontWeight: selectedType.id === t.id ? '700' : '400' }}>{t.icon}  {t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ marginBottom: 16 }} />

            <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>What happened?</Text>
            <TextInput multiline numberOfLines={3} placeholder="Describe the disruption — e.g. 'Heavy flooding on MG Road, orders stopped for 2+ hours'" placeholderTextColor="#94a3b8" value={description} onChangeText={setDescription} style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, fontSize: 13, color: '#0f172a', minHeight: 80, textAlignVertical: 'top', marginBottom: 16 }} />

            <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>Hours lost (1–8)</Text>
            <TextInput keyboardType="numeric" placeholder="e.g. 2" placeholderTextColor="#94a3b8" value={hoursWorked} onChangeText={setHoursWorked} style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#0f172a', marginBottom: 16 }} />

            <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Evidence <Text style={{ color: '#94a3b8', fontWeight: '400', textTransform: 'none' }}>(optional)</Text>
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setPhotoAdded(true)} style={{ flex: 1, borderWidth: 1.5, borderStyle: 'dashed', borderColor: photoAdded ? '#7c3aed' : '#cbd5e1', borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: photoAdded ? '#f5f3ff' : '#f8fafc' }}>
                <Camera color={photoAdded ? '#7c3aed' : '#94a3b8'} size={20} />
                <Text style={{ fontSize: 11, color: photoAdded ? '#7c3aed' : '#64748b', marginTop: 4, fontWeight: '600' }}>{photoAdded ? 'Added ✓' : 'Take Photo'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPhotoAdded(true)} style={{ flex: 1, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#cbd5e1', borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <ImageIcon color="#94a3b8" size={20} />
                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: '600' }}>Upload Image</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#f5f3ff', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#ede9fe' }}>
              <Text style={{ fontSize: 11, color: '#5b21b6', lineHeight: 17 }}>
                <Text style={{ fontWeight: '700' }}>Zero-Touch: </Text>
                Most claims auto-approve within 3 minutes. No manual review needed.
              </Text>
            </View>

            <TouchableOpacity onPress={() => canSubmit && onSubmit(selectedType.id, description, parsedHours)} disabled={!canSubmit} style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 4 }}>
              <LinearGradient colors={canSubmit ? ['#7c3aed', '#6d28d9'] : ['#cbd5e1', '#cbd5e1']} style={{ paddingVertical: 15, alignItems: 'center' }}>
                <Text style={{ color: canSubmit ? '#ffffff' : '#94a3b8', fontWeight: '800', fontSize: 15 }}>Submit Claim</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Claim Status Timeline ────────────────────────────────────────────────────
function ClaimTimeline({ claimStatus }: { claimStatus: string }) {
  const isClaimSubmitted = claimStatus !== 'none';
  const isVerifying = claimStatus === 'processing' || claimStatus === 'approved' || claimStatus === 'paid';
  const isPayoutProcessing = claimStatus === 'approved' || claimStatus === 'paid';
  const isPayoutCompleted = claimStatus === 'paid';

  return (
    <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
      <Text style={{ fontWeight: '800', fontSize: 17, color: '#0f172a', marginBottom: 20 }}>Claim Status</Text>
      {[
        { label: 'Disruption reported', sub: 'You submitted a disruption report', done: isClaimSubmitted, active: isClaimSubmitted && !isVerifying },
        { label: 'Claim submitted', sub: 'Your claim is in the review queue', done: isVerifying, active: isClaimSubmitted && !isVerifying },
        { label: 'AI verification', sub: 'Automated cross-check in progress', done: isPayoutProcessing, active: isVerifying && !isPayoutProcessing },
        { label: 'Payout processing', sub: 'Approved — payment being sent', done: isPayoutCompleted, active: isPayoutProcessing && !isPayoutCompleted },
        { label: 'Payout completed', sub: 'Funds credited to your wallet', done: isPayoutCompleted, active: false },
      ].map((step, i, arr) => (
        <View key={i} style={{ flexDirection: 'row', position: 'relative' }}>
          {i < arr.length - 1 && (
            <View style={{ position: 'absolute', left: 11, top: 26, bottom: -20, width: 2, backgroundColor: step.done ? '#a78bfa' : '#e2e8f0' }} />
          )}
          <View style={{ width: 24, height: 24, borderRadius: 12, marginRight: 14, marginTop: 2, zIndex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: step.done ? '#ede9fe' : step.active ? '#f5f3ff' : '#f1f5f9' }}>
            {step.done ? <CheckCircle2 color="#7c3aed" size={16} /> : step.active ? <Clock color="#7c3aed" size={15} /> : <Circle color="#cbd5e1" size={15} />}
          </View>
          <View style={{ flex: 1, paddingBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: step.done || step.active ? '#0f172a' : '#94a3b8' }}>{step.label}</Text>
            <Text style={{ fontSize: 12, color: step.active ? '#7c3aed' : '#94a3b8', marginTop: 2 }}>{step.sub}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function ClaimsScreen() {
  const { state, submitClaim, eligibility } = useMockData();
  const [formOpen, setFormOpen] = useState(false);
  const [ineligiblePopup, setIneligiblePopup] = useState(false);

  const isEmptyState = !state?.claimStatus || state?.claimStatus === 'none';
  const isPayoutCompleted = state?.claimStatus === 'paid';

  // This month mock total
  const thisMonthTotal = 935;
  const paidCount = 4;

  const handleSubmit = async (type: string, desc: string, hours: number) => {
    setFormOpen(false);
    await submitClaim(type, desc, hours);
  };

  const handleClaimPress = () => {
    if (!eligibility.eligible) {
      setIneligiblePopup(true);
    } else {
      setFormOpen(true);
    }
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
          style={{ paddingTop: 56, paddingBottom: 32, paddingHorizontal: 20 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 26, fontWeight: '800', color: '#ffffff', marginBottom: 4 }}>Zero-Touch Claims</Text>
              <Text style={{ fontSize: 13, color: '#a78bfa' }}>Most claims are auto-approved.</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.6 }}>This month</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#ffffff', marginTop: 2 }}>₹{thisMonthTotal.toLocaleString()}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80', marginRight: 5 }} />
                <Text style={{ fontSize: 11, color: '#4ade80', fontWeight: '600' }}>{paidCount} paid</Text>
              </View>
            </View>
          </View>

          {/* Quick claim chips */}
          {isEmptyState && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Quick Claim</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
                {DISRUPTION_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={handleClaimPress}
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center', minWidth: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
                  >
                    <Text style={{ fontSize: 22, marginBottom: 5 }}>{t.icon}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#e2e8f0', marginBottom: 2 }}>{t.label}</Text>
                    <Text style={{ fontSize: 10, color: '#94a3b8' }}>Up to {t.maxPayout}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Active claim timeline */}
          {!isEmptyState && <ClaimTimeline claimStatus={state?.claimStatus ?? 'none'} />}

          {/* File another after completion */}
          {isPayoutCompleted && (
            <TouchableOpacity onPress={handleClaimPress} style={{ backgroundColor: '#f5f3ff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#ede9fe', marginBottom: 16 }}>
              <View>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#7c3aed' }}>Report another disruption?</Text>
                <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>File a new claim for a separate event</Text>
              </View>
              <ChevronRight color="#7c3aed" size={18} />
            </TouchableOpacity>
          )}

          {/* Recent claims list */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            {/* List header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontWeight: '800', fontSize: 15, color: '#0f172a' }}>{RECENT_CLAIMS.length} Recent Claims</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, gap: 4 }}>
                  <Filter color="#64748b" size={13} />
                  <Text style={{ fontSize: 12, color: '#64748b', fontWeight: '600' }}>Filter</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClaimPress} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#7c3aed', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, gap: 4 }}>
                  <Plus color="#ffffff" size={13} />
                  <Text style={{ fontSize: 12, color: '#ffffff', fontWeight: '700' }}>Claim</Text>
                </TouchableOpacity>
              </View>
            </View>

            {RECENT_CLAIMS.map((claim, i) => (
              <View key={claim.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: i < RECENT_CLAIMS.length - 1 ? 1 : 0, borderBottomColor: '#f8fafc' }}>
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#f5f3ff', alignItems: 'center', justifyContent: 'center', marginRight: 13 }}>
                  <Text style={{ fontSize: 20 }}>{claim.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>{claim.type}</Text>
                    <View style={{ backgroundColor: claim.statusBg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: claim.statusColor }}>• {claim.status}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>{claim.route} · {claim.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: claim.status === 'Rejected' ? '#dc2626' : '#0f172a' }}>
                    {claim.status === 'Rejected' ? '' : '+'}₹{claim.amount}
                  </Text>
                  <ChevronRight color="#cbd5e1" size={16} style={{ marginTop: 2 }} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {formOpen && <ClaimForm onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />}

      {/* Ineligibility overlay — in-screen so it stays within the phone frame */}
      {ineligiblePopup && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIneligiblePopup(false)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
          />
          <View style={{ position: 'absolute', left: 24, right: 24, top: '30%', backgroundColor: '#ffffff', borderRadius: 24, padding: 28 }}>
            <Text style={{ fontSize: 24, marginBottom: 10, textAlign: 'center' }}>🚫</Text>
            <Text style={{ fontWeight: '800', fontSize: 18, color: '#0f172a', textAlign: 'center', marginBottom: 10 }}>Not Eligible Yet</Text>
            <Text style={{ fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 22, marginBottom: 10 }}>
              You need at least <Text style={{ fontWeight: '700', color: '#0f172a' }}>{eligibility.required} completed deliveries</Text> in the past 7 days.
            </Text>
            <Text style={{ fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
              Currently: <Text style={{ fontWeight: '700', color: '#dc2626' }}>{eligibility.tripCount}</Text> — keep going!
            </Text>
            <TouchableOpacity onPress={() => setIneligiblePopup(false)} style={{ borderRadius: 14, overflow: 'hidden' }}>
              <LinearGradient colors={['#7c3aed', '#6d28d9']} style={{ paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Got it</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
