import { View, Text, ScrollView } from 'react-native';
import { useMockData } from '../../context/MockDataContext';
import { ShieldCheck, ShieldAlert, CloudRain, AlertTriangle, Wind, Info } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
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

  const { isTripActive, disruption, claimStatus, weeklyEarnings, weeklyProtected } = state;

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Background ambient glows */}
      <View className="absolute top-[-100px] left-[-50px] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
      <View className="absolute bottom-[-50px] right-[-50px] w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40, paddingTop: 60 }}>
        {/* Header */}
        <View className="px-6 mb-8 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-400 font-medium text-sm tracking-wider uppercase">Welcome back</Text>
            <Text className="text-3xl font-bold text-white mt-1">Rahul Kumar</Text>
          </View>
          <View className="w-12 h-12 rounded-full overflow-hidden border border-slate-700">
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              className="flex-1 items-center justify-center"
            >
              <Text className="text-blue-400 font-bold text-lg">RK</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Coverage Status Card (Glassmorphism) */}
        <View className="px-6 mb-6">
          <BlurView intensity={20} tint="dark" className="rounded-3xl overflow-hidden border border-slate-800/60">
            <LinearGradient
              colors={isTripActive ? ['rgba(37, 99, 235, 0.15)', 'rgba(15, 23, 42, 0.4)'] : ['rgba(30, 41, 59, 0.3)', 'rgba(2, 6, 23, 0.5)']}
              className="p-6 flex-row gap-5 items-center"
            >
              <View className={`w-14 h-14 rounded-2xl items-center justify-center border ${isTripActive ? 'bg-blue-500/20 border-blue-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                {isTripActive ? (
                  <ShieldCheck color="#60a5fa" size={28} />
                ) : (
                  <ShieldAlert color="#64748b" size={28} />
                )}
              </View>
              <View className="flex-1">
                <Text className={`font-bold text-xl mb-1 ${isTripActive ? 'text-blue-400' : 'text-slate-300'}`}>
                  {isTripActive ? 'Coverage Active' : 'Standby Mode'}
                </Text>
                <Text className={`text-xs leading-5 ${isTripActive ? 'text-blue-200/70' : 'text-slate-500'}`}>
                  {isTripActive ? 'Your current trip is automatically protected. ₹2 premium routed.' : 'Waiting for you to accept your next trip on your delivery app.'}
                </Text>
              </View>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Earnings & Protection Row */}
        <View className="px-6 mb-8 flex-row justify-between">
          <BlurView intensity={15} tint="dark" className="flex-1 mr-2 rounded-3xl overflow-hidden border border-slate-800/60 p-5">
            <Text className="text-slate-500 text-xs tracking-wider uppercase mb-1">Weekly Earnings</Text>
            <Text className="text-white font-bold text-2xl">₹{weeklyEarnings.toLocaleString()}</Text>
          </BlurView>
          <BlurView intensity={15} tint="dark" className="flex-1 ml-2 rounded-3xl overflow-hidden border border-slate-800/60 p-5">
            <Text className="text-slate-500 text-xs tracking-wider uppercase mb-1">Protected Claim</Text>
            <Text className="text-green-400 font-bold text-2xl">₹{weeklyProtected.toLocaleString()}</Text>
          </BlurView>
        </View>

        {/* Disruption Alert Area */}
        <View className="px-6">
          {disruption && (
            <BlurView intensity={30} tint="dark" className="rounded-3xl overflow-hidden mb-8 border border-red-500/30">
              <LinearGradient colors={['rgba(220, 38, 38, 0.1)', 'rgba(0,0,0,0)']} className="p-6">
                <View className="flex-row mb-4">
                  <View className="w-12 h-12 rounded-full bg-red-500/20 items-center justify-center mr-4">
                    <AlertTriangle color="#ef4444" size={24} />
                  </View>
                  <View className="flex-1 mt-1">
                    <Text className="text-red-400 font-bold text-lg mb-1">{disruption.message}</Text>
                    <Text className="text-red-300/60 text-sm">Zone: {disruption.zone}</Text>
                  </View>
                </View>
                
                <View className="bg-black/40 p-4 rounded-2xl border border-slate-800/80">
                  <Text className="text-slate-400 font-medium mb-3 text-xs uppercase tracking-wider">Automated Claim Status</Text>
                  
                  {claimStatus === 'processing' && (
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-amber-500 mr-3 animate-pulse" />
                      <Text className="text-amber-400 font-semibold text-sm">Processing AI Verification...</Text>
                    </View>
                  )}
                  {claimStatus === 'approved' && (
                    <View className="flex-row items-center">
                      <ShieldCheck color="#22c55e" size={20} className="mr-3" />
                      <Text className="text-green-400 font-bold text-sm">Approved - Pending Payout</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </BlurView>
          )}

          <Text className="text-slate-300 font-semibold text-lg mb-4 px-1">Live Zone Indicators</Text>
          
          {/* Risk Indicators Grid */}
          <View className="flex-row flex-wrap justify-between">
            <BlurView intensity={10} tint="dark" className="w-[48%] rounded-3xl overflow-hidden border border-slate-800/60 mb-4 p-5 items-center justify-center">
              <CloudRain color="#38bdf8" size={28} className="mb-3 opacity-80" />
              <Text className="text-slate-500 text-xs uppercase tracking-wider">Rainfall</Text>
              <Text className="text-slate-200 font-semibold mt-1">Normal</Text>
            </BlurView>
            
            <BlurView intensity={10} tint="dark" className="w-[48%] rounded-3xl overflow-hidden border border-amber-900/30 bg-amber-950/20 mb-4 p-5 items-center justify-center">
              <Wind color="#f59e0b" size={28} className="mb-3 opacity-80" />
              <Text className="text-amber-500/70 text-xs uppercase tracking-wider">AQI Level</Text>
              <Text className="text-amber-400 font-semibold mt-1">210 (Poor)</Text>
            </BlurView>

            <BlurView intensity={10} tint="dark" className="w-[48%] rounded-3xl overflow-hidden border border-slate-800/60 mb-4 p-5 items-center justify-center">
              <AlertTriangle color="#eab308" size={28} className="mb-3 opacity-80" />
              <Text className="text-slate-500 text-xs uppercase tracking-wider">Traffic</Text>
              <Text className="text-slate-300 font-semibold mt-1">Moderate</Text>
            </BlurView>
            
            <BlurView intensity={10} tint="dark" className="w-[48%] rounded-3xl overflow-hidden border border-slate-800/60 mb-4 p-5 items-center justify-center">
              <Info color="#94a3b8" size={28} className="mb-3 opacity-80" />
              <Text className="text-slate-500 text-xs uppercase tracking-wider">Civic Rules</Text>
              <Text className="text-slate-300 font-semibold mt-1">All Clear</Text>
            </BlurView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
