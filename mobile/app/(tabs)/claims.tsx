import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useMockData } from '../../context/MockDataContext';
import { ArrowLeft, CheckCircle2, Clock, Circle, Bell, Camera, Image as ImageIcon } from 'lucide-react-native';

export default function ClaimsScreen() {
  const { state } = useMockData();

  // If the claim is being processed, it shows verification
  // If approved, it is pending internal payout transfer
  // If paid, it's fully done (mock states mapping)
  const isEmptyState = !state?.claimStatus || state?.claimStatus === 'none';
  const isDisruptionDetected = state?.disruption !== null;
  const isClaimTriggered = state?.claimStatus !== 'none';
  const isVerifying = state?.claimStatus === 'processing' || state?.claimStatus === 'approved' || state?.claimStatus === 'paid';
  const isPayoutProcessing = state?.claimStatus === 'approved' || state?.claimStatus === 'paid';
  const isPayoutCompleted = state?.claimStatus === 'paid';

  return (
    <View className="flex-1 bg-white pt-14">
      {/* Header */}
      <View className="px-6 flex-row justify-between items-center pb-6">
        <View className="flex-row items-center">
          <ArrowLeft color="#1e293b" size={24} className="mr-4" />
          <Text className="text-xl font-bold text-slate-800">Claims & Payouts</Text>
        </View>
        <View className="relative">
          <View className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full z-10 border border-white" />
          <Bell color="#475569" size={24} />
        </View>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {isEmptyState ? (
          <>
            {/* Empty State: Need to Report CTA at Top */}
            <View className="bg-blue-600 rounded-3xl p-6 shadow-md shadow-blue-500/50 mb-6">
              <Text className="text-white font-bold text-lg mb-2">Need to Report?</Text>
              <Text className="text-blue-100 text-base leading-5 mb-5">
                If deliveries stopped due to a local issue, file a claim manually.
              </Text>
              <TouchableOpacity className="bg-white rounded-2xl py-3.5 items-center">
                <Text className="text-blue-600 font-bold text-[15px]">Report a Disruption</Text>
              </TouchableOpacity>
            </View>

            {/* Empty State: Upload Evidence */}
            <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <Text className="font-bold text-lg text-slate-800 mb-2">Upload Evidence</Text>
              <Text className="text-slate-500 text-sm leading-5 mb-6">
                Add photos of flooded streets, roadblocks, or police barricades
              </Text>
              
              <View className="flex-row justify-between">
                <TouchableOpacity className="flex-1 border border-dashed border-slate-300 rounded-2xl p-6 items-center justify-center mr-2 bg-slate-50">
                  <Camera color="#64748b" size={28} className="mb-3" />
                  <Text className="text-slate-600 font-medium text-xs">Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-1 border border-dashed border-slate-300 rounded-2xl p-6 items-center justify-center ml-2 bg-slate-50">
                  <ImageIcon color="#64748b" size={28} className="mb-3" />
                  <Text className="text-slate-600 font-medium text-xs">Upload Image</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Active State: Claim Status Card */}
            <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
              <Text className="font-bold text-lg text-slate-800 mb-6">Active Claim Status</Text>

              {/* Timeline Item 1: Disruption */}
              <View className="flex-row mb-6 relative">
                <View className="absolute left-[11px] top-6 bottom-[-30px] w-0.5 bg-green-200" />
                <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center mr-4 z-10 mt-1">
                  <CheckCircle2 color="#16a34a" size={16} />
                </View>
                <View>
                  <Text className="text-slate-800 font-medium">Weather disruption detected</Text>
                  <Text className="text-slate-500 text-sm mt-0.5">11:30 AM</Text>
                </View>
              </View>

              {/* Timeline Item 2: Claim Triggered */}
              <View className="flex-row mb-6 relative">
                <View className={`absolute left-[11px] top-6 bottom-[-30px] w-0.5 ${isVerifying ? 'bg-green-200' : 'bg-slate-200'}`} />
                <View className={`w-6 h-6 rounded-full ${isClaimTriggered ? 'bg-green-100' : 'bg-slate-100'} items-center justify-center mr-4 z-10 mt-1`}>
                  {isClaimTriggered ? <CheckCircle2 color="#16a34a" size={16} /> : <Circle color="#cbd5e1" size={16} />}
                </View>
                <View>
                  <Text className={`${isClaimTriggered ? 'text-slate-800' : 'text-slate-400'} font-medium`}>Claim auto-triggered</Text>
                  <Text className="text-slate-500 text-sm mt-0.5">11:35 AM</Text>
                </View>
              </View>

              {/* Timeline Item 3: Verification */}
              <View className="flex-row mb-6 relative">
                <View className={`absolute left-[11px] top-6 bottom-[-30px] w-0.5 ${isPayoutProcessing ? 'bg-green-200' : 'bg-slate-200'}`} />
                <View className={`w-6 h-6 rounded-full ${isVerifying && !isPayoutProcessing ? 'bg-blue-100' : (isVerifying ? 'bg-green-100' : 'bg-slate-100')} items-center justify-center mr-4 z-10 mt-1`}>
                  {isPayoutProcessing ? <CheckCircle2 color="#16a34a" size={16} /> : isVerifying ? <Clock color="#2563eb" size={16} /> : <Circle color="#cbd5e1" size={16} />}
                </View>
                <View>
                  <Text className={`${isVerifying && !isPayoutProcessing ? 'text-blue-600 font-medium' : (isVerifying ? 'text-slate-800 font-medium' : 'text-slate-400')}`}>Verification in progress</Text>
                  <Text className="text-slate-500 text-sm mt-0.5">12:00 PM</Text>
                </View>
              </View>

              {/* Timeline Item 4: Payout Processing */}
              <View className="flex-row mb-6 relative">
                <View className={`absolute left-[11px] top-6 bottom-[-30px] w-0.5 ${isPayoutCompleted ? 'bg-green-200' : 'bg-slate-200'}`} />
                <View className={`w-6 h-6 rounded-full ${isPayoutProcessing && !isPayoutCompleted ? 'bg-blue-100' : (isPayoutCompleted ? 'bg-green-100' : 'bg-slate-100')} items-center justify-center mr-4 z-10 mt-1`}>
                  {isPayoutCompleted ? <CheckCircle2 color="#16a34a" size={16} /> : isPayoutProcessing ? <Clock color="#2563eb" size={16} /> : <Circle color="#94a3b8" size={16} />}
                </View>
                <View>
                  <Text className={`${isPayoutProcessing && !isPayoutCompleted ? 'text-blue-600 font-medium' : (isPayoutCompleted ? 'text-slate-800 font-medium' : 'text-slate-400')}`}>Payout processing</Text>
                  <Text className="text-slate-500 text-sm mt-0.5">{isPayoutCompleted ? '1:00 PM' : 'Pending'}</Text>
                </View>
              </View>

              {/* Timeline Item 5: Payout Completed */}
              <View className="flex-row">
                <View className={`w-6 h-6 rounded-full ${isPayoutCompleted ? 'bg-green-100' : 'bg-slate-100'} items-center justify-center mr-4 z-10 mt-1`}>
                  {isPayoutCompleted ? <CheckCircle2 color="#16a34a" size={16} /> : <Circle color="#94a3b8" size={16} />}
                </View>
                <View>
                  <Text className={`${isPayoutCompleted ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>Payout completed</Text>
                  <Text className="text-slate-500 text-sm mt-0.5">{isPayoutCompleted ? '1:15 PM' : 'Pending'}</Text>
                </View>
              </View>
            </View>

            {/* Need to Report CTA */}
            <View className="bg-blue-600 rounded-3xl p-6 shadow-md shadow-blue-500/50">
              <Text className="text-white font-bold text-lg mb-2">Need to Report?</Text>
              <Text className="text-blue-100 text-base leading-5 mb-5">
                If deliveries stopped due to a local issue, file a claim manually.
              </Text>
              <TouchableOpacity className="bg-white rounded-2xl py-3.5 items-center">
                <Text className="text-blue-600 font-bold text-[15px]">Report a Disruption</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}
