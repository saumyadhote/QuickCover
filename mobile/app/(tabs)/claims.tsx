import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { useMockData } from '../../context/MockDataContext';
import {
  CheckCircle2, Clock, Circle, Camera, Image as ImageIcon,
  ChevronDown, X, FileText
} from 'lucide-react-native';

const DISRUPTION_TYPES = [
  { id: 'WEATHER', label: 'Heavy Rain / Flooding', icon: '🌧️' },
  { id: 'HEAT', label: 'Extreme Heat', icon: '🌡️' },
  { id: 'OUTAGE', label: 'Platform Outage', icon: '📵' },
  { id: 'CURFEW', label: 'Curfew / Lockdown', icon: '🚧' },
  { id: 'OTHER', label: 'Other Disruption', icon: '⚠️' },
];

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
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' }}
      />
      {/* Sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
      >
        <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 20, maxHeight: 600 }}>
          {/* Handle */}
          <View style={{ alignItems: 'center', paddingTop: 12, marginBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0' }} />
          </View>

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
            <Text style={{ fontWeight: '700', fontSize: 18, color: '#0f172a' }}>Report a Disruption</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X color="#94a3b8" size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ paddingHorizontal: 20 }} contentContainerStyle={{ paddingTop: 20, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
            {/* Disruption type */}
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Disruption Type</Text>
            <TouchableOpacity
              onPress={() => setShowTypePicker(!showTypePicker)}
              style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}
            >
              <Text style={{ fontSize: 14, color: '#0f172a' }}>{selectedType.icon}  {selectedType.label}</Text>
              <ChevronDown color="#94a3b8" size={18} />
            </TouchableOpacity>

            {showTypePicker && (
              <View style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, marginBottom: 4, overflow: 'hidden' }}>
                {DISRUPTION_TYPES.map((t, i) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => { setSelectedType(t); setShowTypePicker(false); }}
                    style={{ paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: i < DISRUPTION_TYPES.length - 1 ? 1 : 0, borderBottomColor: '#e2e8f0', backgroundColor: selectedType.id === t.id ? '#eff6ff' : '#f8fafc' }}
                  >
                    <Text style={{ fontSize: 14, color: selectedType.id === t.id ? '#2563eb' : '#334155', fontWeight: selectedType.id === t.id ? '600' : '400' }}>{t.icon}  {t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ marginBottom: 16 }} />

            {/* Description */}
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>What happened?</Text>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="Describe the disruption — e.g. 'Heavy flooding on MG Road, orders stopped for 2+ hours'"
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, fontSize: 13, color: '#0f172a', minHeight: 80, textAlignVertical: 'top', marginBottom: 16 }}
            />

            {/* Hours worked */}
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hours lost (1–8)</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="e.g. 2"
              placeholderTextColor="#94a3b8"
              value={hoursWorked}
              onChangeText={setHoursWorked}
              style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#0f172a', marginBottom: 16 }}
            />

            {/* Photo evidence */}
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Evidence <Text style={{ color: '#94a3b8', fontWeight: '400', textTransform: 'none', fontSize: 11 }}>(optional)</Text>
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => setPhotoAdded(true)}
                style={{ flex: 1, borderWidth: 1.5, borderStyle: 'dashed', borderColor: photoAdded ? '#16a34a' : '#cbd5e1', borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: photoAdded ? '#f0fdf4' : '#f8fafc' }}
              >
                <Camera color={photoAdded ? '#16a34a' : '#94a3b8'} size={20} />
                <Text style={{ fontSize: 11, color: photoAdded ? '#16a34a' : '#64748b', marginTop: 4, fontWeight: '500' }}>{photoAdded ? 'Added ✓' : 'Take Photo'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPhotoAdded(true)}
                style={{ flex: 1, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#cbd5e1', borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#f8fafc' }}
              >
                <ImageIcon color="#94a3b8" size={20} />
                <Text style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: '500' }}>Upload Image</Text>
              </TouchableOpacity>
            </View>

            {/* Note */}
            <View style={{ backgroundColor: '#fffbeb', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#fde68a' }}>
              <Text style={{ fontSize: 11, color: '#92400e', lineHeight: 17 }}>
                <Text style={{ fontWeight: '700' }}>Note: </Text>
                Claims are AI-verified in seconds. You must have an active or recently ended trip to be eligible.
              </Text>
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={() => canSubmit && onSubmit(selectedType.id, description, parsedHours)}
              disabled={!canSubmit}
              style={{ backgroundColor: canSubmit ? '#2563eb' : '#cbd5e1', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 4 }}
            >
              <Text style={{ color: canSubmit ? '#ffffff' : '#94a3b8', fontWeight: '700', fontSize: 15 }}>Submit Claim</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default function ClaimsScreen() {
  const { state, submitClaim, eligibility } = useMockData();
  const [formOpen, setFormOpen] = useState(false);
  const [ineligiblePopup, setIneligiblePopup] = useState(false);

  const isEmptyState = !state?.claimStatus || state?.claimStatus === 'none';
  const isClaimSubmitted = state?.claimStatus !== 'none';
  const isVerifying = state?.claimStatus === 'processing' || state?.claimStatus === 'approved' || state?.claimStatus === 'paid';
  const isPayoutProcessing = state?.claimStatus === 'approved' || state?.claimStatus === 'paid';
  const isPayoutCompleted = state?.claimStatus === 'paid';

  const handleSubmit = async (type: string, desc: string, hours: number) => {
    setFormOpen(false);
    await submitClaim(type, desc, hours);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', paddingTop: 56 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a' }}>Claims & Payouts</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>

        {isEmptyState ? (
          <>
            {/* Primary CTA */}
            <View style={{ backgroundColor: '#1d4ed8', borderRadius: 20, padding: 22, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <FileText color="#ffffff" size={20} />
                </View>
                <View>
                  <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16 }}>Report a Disruption</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Get compensated for lost income</Text>
                </View>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
                If deliveries stopped due to heavy rain, extreme heat, a platform outage, or a curfew — report it here. Our AI verifies claims in seconds.
              </Text>
              <TouchableOpacity
                onPress={() => eligibility.eligible ? setFormOpen(true) : setIneligiblePopup(true)}
                style={{ backgroundColor: '#ffffff', borderRadius: 12, paddingVertical: 13, alignItems: 'center' }}
              >
                <Text style={{ color: '#1d4ed8', fontWeight: '700', fontSize: 15 }}>Start Claim →</Text>
              </TouchableOpacity>
            </View>

            {/* Eligibility info */}
            <View style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: '#0f172a', marginBottom: 14 }}>What you can claim for</Text>
              {[
                { icon: '🌧️', label: 'Heavy rain or flooding', sub: 'IMD >15mm/hr in your zone' },
                { icon: '🌡️', label: 'Extreme heat (>43°C)', sub: 'Sustained for 2+ hrs during your shift' },
                { icon: '📵', label: 'Platform outage', sub: 'Zone unavailable >90 minutes' },
                { icon: '🚧', label: 'Curfew or lockdown', sub: 'Government-declared restrictions' },
              ].map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: i < 3 ? 12 : 0 }}>
                  <Text style={{ fontSize: 18, marginRight: 12, marginTop: 1 }}>{item.icon}</Text>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155' }}>{item.label}</Text>
                    <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{item.sub}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Upload evidence separately */}
            <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#e2e8f0' }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: '#0f172a', marginBottom: 4 }}>Have evidence ready?</Text>
              <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
                Photos of flooded roads, closed stores, or police barricades significantly speed up claim approval.
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={{ flex: 1, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#cbd5e1', borderRadius: 12, paddingVertical: 18, alignItems: 'center', backgroundColor: '#f8fafc' }}>
                  <Camera color="#94a3b8" size={24} />
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontWeight: '500' }}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#cbd5e1', borderRadius: 12, paddingVertical: 18, alignItems: 'center', backgroundColor: '#f8fafc' }}>
                  <ImageIcon color="#94a3b8" size={24} />
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontWeight: '500' }}>Upload Image</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Active claim timeline */}
            <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
              <Text style={{ fontWeight: '700', fontSize: 17, color: '#0f172a', marginBottom: 20 }}>Claim Status</Text>

              {[
                { label: 'Disruption reported', sub: 'You submitted a disruption report', done: isClaimSubmitted, active: isClaimSubmitted && !isVerifying },
                { label: 'Claim submitted', sub: 'Your claim is in the review queue', done: isVerifying, active: isClaimSubmitted && !isVerifying },
                { label: 'AI verification', sub: 'Automated cross-check in progress (5–10s)', done: isPayoutProcessing, active: isVerifying && !isPayoutProcessing },
                { label: 'Payout processing', sub: 'Approved — payment being sent', done: isPayoutCompleted, active: isPayoutProcessing && !isPayoutCompleted },
                { label: 'Payout completed', sub: 'Funds credited to your wallet', done: isPayoutCompleted, active: false },
              ].map((step, i, arr) => (
                <View key={i} style={{ flexDirection: 'row', position: 'relative' }}>
                  {i < arr.length - 1 && (
                    <View style={{ position: 'absolute', left: 11, top: 26, bottom: -20, width: 2, backgroundColor: step.done ? '#86efac' : '#e2e8f0' }} />
                  )}
                  <View style={{ width: 24, height: 24, borderRadius: 12, marginRight: 14, marginTop: 2, zIndex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: step.done ? '#dcfce7' : step.active ? '#dbeafe' : '#f1f5f9' }}>
                    {step.done ? <CheckCircle2 color="#16a34a" size={16} /> : step.active ? <Clock color="#2563eb" size={15} /> : <Circle color="#cbd5e1" size={15} />}
                  </View>
                  <View style={{ flex: 1, paddingBottom: 24 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: step.done || step.active ? '#0f172a' : '#94a3b8' }}>{step.label}</Text>
                    <Text style={{ fontSize: 12, color: step.active ? '#2563eb' : '#94a3b8', marginTop: 2 }}>{step.sub}</Text>
                  </View>
                </View>
              ))}
            </View>

            {isPayoutCompleted && (
              <TouchableOpacity
                onPress={() => setFormOpen(true)}
                style={{ backgroundColor: '#f0f9ff', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#bae6fd' }}
              >
                <View>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: '#0369a1' }}>Report another disruption?</Text>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>File a new claim for a separate event</Text>
                </View>
                <Text style={{ fontSize: 20, color: '#0369a1' }}>→</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* Claim form — rendered inside the screen so it stays within the phone frame */}
      {formOpen && <ClaimForm onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />}

      {/* Ineligibility popup */}
      <Modal visible={ineligiblePopup} transparent animationType="fade" onRequestClose={() => setIneligiblePopup(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 28, width: '100%' }}>
            <Text style={{ fontSize: 22, marginBottom: 10, textAlign: 'center' }}>🚫</Text>
            <Text style={{ fontWeight: '700', fontSize: 17, color: '#0f172a', textAlign: 'center', marginBottom: 10 }}>
              Not Eligible Yet
            </Text>
            <Text style={{ fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
              You need at least <Text style={{ fontWeight: '700', color: '#0f172a' }}>{eligibility.required} completed deliveries</Text> in the past 7 days to file a claim.{'\n\n'}
              You currently have <Text style={{ fontWeight: '700', color: '#dc2626' }}>{eligibility.tripCount}</Text> — keep completing trips to unlock coverage!
            </Text>
            <TouchableOpacity
              onPress={() => setIneligiblePopup(false)}
              style={{ backgroundColor: '#1d4ed8', borderRadius: 12, paddingVertical: 13, alignItems: 'center' }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
