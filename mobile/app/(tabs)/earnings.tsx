import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useMockData } from '../../context/MockDataContext';
import { IndianRupee, ArrowRight, ShieldCheck, CalendarClock } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function EarningsScreen() {
  const { state } = useMockData();

  if (!state) return null;

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Background ambient glows */}
      <View className="absolute top-[10%] right-[-50px] w-80 h-80 bg-green-600/10 rounded-full blur-[100px]" />
      <View className="absolute bottom-[20%] left-[-50px] w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="pt-16 pb-6 px-6 relative z-10 w-full mb-4">
          <Text className="text-3xl font-black text-white mb-1">Weekly Payouts</Text>
          <Text className="text-slate-400 text-sm tracking-wide font-medium uppercase">Cycle: Mon 8th - Sun 14th</Text>
        </View>

        <View className="px-6 py-4 flex-1 z-10">
          {/* Main Payout Card (Glassmorphism) */}
          <BlurView intensity={20} tint="dark" className="rounded-3xl overflow-hidden border border-slate-700/50 mb-8 shadow-2xl shadow-green-900/20">
            <LinearGradient
               colors={['rgba(22, 163, 74, 0.15)', 'rgba(2, 6, 23, 0.6)']}
               className="p-6 relative"
            >
              {/* Background decoration */}
              <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full" />
              <View className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full" />
              
              <Text className="text-emerald-400 font-medium mb-2 text-sm uppercase tracking-widest">Protected Income Payout</Text>
              <View className="flex-row items-end mb-6">
                <Text className="text-5xl font-black text-white">₹{state.weeklyProtected.toLocaleString()}</Text>
                <Text className="text-emerald-500/80 font-semibold mb-2 ml-2 tracking-widest uppercase text-xs">pending</Text>
              </View>

              <View className="flex-row bg-black/30 border border-slate-800 p-4 rounded-2xl items-center">
                <View className="bg-slate-800 p-2 rounded-full mr-3 border border-slate-700">
                  <CalendarClock color="#94a3b8" size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-200 font-medium">To be credited to UPI</Text>
                  <Text className="text-slate-500 text-xs mt-0.5">Sunday, 11:59 PM</Text>
                </View>
              </View>
            </LinearGradient>
          </BlurView>

          <Text className="text-lg font-bold text-slate-300 mb-4 px-1">Payout History</Text>
          
          {state.weeklyProtected > 0 ? (
            <BlurView intensity={15} tint="dark" className="p-5 rounded-2xl border border-slate-800/60 flex-row items-center mb-4">
              <View className="w-12 h-12 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mr-4">
                <ShieldCheck color="#4ade80" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-0.5">Claim Auto-Payout</Text>
                <Text className="text-slate-400 text-sm">Severe Waterlogging</Text>
              </View>
              <Text className="text-emerald-400 font-bold text-lg tracking-wide">+₹{state.weeklyProtected}</Text>
            </BlurView>
          ) : (
            <BlurView intensity={10} tint="dark" className="p-8 rounded-2xl border flex flex-col items-center justify-center border-slate-800/60 border-dashed">
              <View className="w-12 h-12 rounded-full bg-slate-800/50 items-center justify-center mb-4">
                <ShieldCheck color="#475569" size={24} />
              </View>
              <Text className="text-slate-400 font-medium text-center">No parametric payouts this week.</Text>
              <Text className="text-slate-500 text-xs text-center mt-2 px-4 leading-5">Your income automatically remains protected during every active trip.</Text>
            </BlurView>
          )}

          <View className="mt-8">
            <LinearGradient colors={['rgba(56, 189, 248, 0.1)', 'transparent']} className="p-5 rounded-2xl border border-blue-900/30">
              <Text className="text-blue-300/80 text-center text-sm leading-5">
                <Text className="font-bold text-blue-400">Remember:</Text> Premiums are funded by user surcharges, meaning this income protection costs you absolutely nothing out of pocket.
              </Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
