import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useMockData } from '../../context/MockDataContext';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const { state } = useMockData();

  if (!state) {
    return (
      <View className="flex-1 bg-[#020617] pt-16 px-6">
        {/* Skeleton Header */}
        <View className="flex-row justify-between items-center mb-8 mt-4">
          <View>
            <View className="w-24 h-4 bg-slate-800/50 rounded animate-pulse mb-2" />
            <View className="w-40 h-8 bg-slate-800/60 rounded animate-pulse" />
          </View>
          <View className="w-12 h-12 bg-slate-800/60 rounded-full animate-pulse" />
        </View>

        {/* Skeleton Main Card */}
        <View className="w-full h-32 bg-slate-800/40 rounded-3xl animate-pulse mb-6 border border-slate-800/60" />

        {/* Skeleton Earnings Row */}
        <View className="flex-row justify-between mb-8">
          <View className="flex-1 mr-2 h-24 bg-slate-800/40 rounded-3xl animate-pulse border border-slate-800/60" />
          <View className="flex-1 ml-2 h-24 bg-slate-800/40 rounded-3xl animate-pulse border border-slate-800/60" />
        </View>

        {/* Skeleton Grid */}
        <View className="w-32 h-6 bg-slate-800/40 rounded animate-pulse mb-4" />
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%] h-28 bg-slate-800/40 rounded-3xl animate-pulse mb-4" />
          <View className="w-[48%] h-28 bg-slate-800/40 rounded-3xl animate-pulse mb-4" />
        </View>
      </View>
    );
  }

  const { acceptTrip, completeTrip } = useMockData();
  const { isTripActive, disruption, claimStatus, weeklyEarnings, weeklyProtected } = state;

  const toggleTrip = async () => {
    try {
      if (isTripActive) {
        await completeTrip();
      } else {
        await acceptTrip();
      }
    } catch (err) {
      console.error('Failed to toggle trip', err);
    }
  };

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Background ambient glows */}
      <View className="absolute top-[-100px] left-[-50px] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
      <View className="absolute bottom-[-50px] right-[-50px] w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />

      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Section */}
        <View className="px-6 pt-16 pb-4 flex-row justify-between items-center bg-white">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <LinearGradient
                colors={['#0ea5e9', '#3b82f6']}
                className="flex-1 items-center justify-center"
              >
                <Text className="text-white font-bold text-lg">A</Text>
              </LinearGradient>
            </View>
            <View>
              <View className="flex-row items-center">
                <Text className="text-xl font-bold text-slate-900 mr-1">Hi Arjun</Text>
                <Text className="text-xl">👋</Text>
              </View>
              <Text className="text-slate-500 text-sm">Good afternoon</Text>
            </View>
          </View>
          <View className="relative">
            <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full z-10 border-2 border-white" />
            <Text className="text-2xl">🔔</Text>
          </View>
        </View>

        {/* Coverage Status Card */}
        <View className="px-4 mb-4">
          <TouchableOpacity activeOpacity={0.8} onPress={toggleTrip} className="w-full">
            <LinearGradient
              colors={isTripActive ? ['#10b981', '#059669'] : ['#64748b', '#475569']}
              className="rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                  {isTripActive ? <ShieldCheck color="#ffffff" size={24} /> : <ShieldAlert color="#ffffff" size={24} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="text-white font-bold text-base mb-0.5">{isTripActive ? 'Insurance Active' : 'Insurance Standby'}</Text>
                  <Text className="text-white/80 text-sm">{isTripActive ? 'Trip Protected. Tap to end.' : 'Tap to start a protected trip.'}</Text>
                </View>
              </View>
              <View className={`w-3 h-3 rounded-full ${isTripActive ? 'bg-white' : 'bg-slate-300'}`} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Dynamic Disruption Alert */}
        {disruption && (
          <View className="px-4 mb-4">
            <View className="bg-red-50 rounded-2xl p-4 flex-row items-center border border-red-200">
              <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
                 <AlertTriangle color="#dc2626" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                 <Text className="text-red-900 font-bold text-sm mb-0.5">Disruption Detected in Zone</Text>
                 <Text className="text-red-700 text-xs">{disruption.message}</Text>
              </View>
            </View>
          </View>
        )}

        {/* This Week Card */}
        <View className="px-4 mb-4">
          <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <Text className="font-bold text-xl text-slate-800 mb-6">This Week</Text>

            {/* Protected Earnings Row */}
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center mr-4">
                <Text className="text-green-600 text-xl font-bold">↗</Text>
              </View>
              <View>
                <Text className="text-slate-500 text-sm mb-1">Protected Earnings</Text>
                <Text className="text-slate-900 font-bold text-2xl">₹{weeklyEarnings.toLocaleString()}</Text>
              </View>
            </View>

            {/* Weekly Coverage Boundary Row */}
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4">
                <ShieldCheck color="#3b82f6" size={24} />
              </View>
              <View>
                <Text className="text-slate-500 text-sm mb-1">Max Weekly Coverage</Text>
                <Text className="text-slate-900 font-bold text-2xl">₹5,000</Text>
              </View>
            </View>

            {/* Platform Covered Assurance Row */}
            <View className="bg-slate-50 rounded-2xl p-4 flex-row items-center">
              <View style={{ marginRight: 8 }}>
                <ShieldCheck color="#64748b" size={16} />
              </View>
              <Text className="text-slate-500 text-sm" style={{ flex: 1 }}>Covered by platform</Text>
              <Text className="text-slate-900 font-bold text-sm" style={{ flexShrink: 0 }}>₹0 Out-of-pocket</Text>
            </View>
          </View>
        </View>

        {/* Recent Payout Area */}
        {claimStatus === 'paid' && weeklyProtected > 0 && (
          <View className="px-4">
            <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="font-bold text-xl text-slate-800">Recent Payout</Text>
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 font-bold text-xs">Completed</Text>
                </View>
              </View>

              <View className="flex-row justify-between items-baseline mb-4">
                <Text className="text-slate-500 text-sm">Amount</Text>
                <Text className="text-slate-900 font-bold text-2xl">₹ {weeklyProtected.toLocaleString()}</Text>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-slate-500 text-sm">Destination</Text>
                <Text className="text-slate-800 font-semibold text-sm">Blinkit Partner API</Text>
              </View>

              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-slate-500 text-sm">Date</Text>
                <Text className="text-slate-800 font-semibold text-sm">Today</Text>
              </View>

              <View className="bg-green-50 rounded-2xl p-4 flex-row items-center border border-green-100">
                <View className="w-8 h-8 rounded-full bg-green-200 items-center justify-center mr-3">
                  <ShieldCheck color="#166534" size={16} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="text-green-900 font-bold text-sm">Payment Successful</Text>
                  <Text className="text-green-700 text-xs mt-0.5">Synced to Next Weekly Settlement</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
