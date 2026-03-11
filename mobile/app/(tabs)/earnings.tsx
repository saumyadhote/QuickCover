import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useMockData } from '../../context/MockDataContext';
import { IndianRupee, ArrowRight, ShieldCheck, CalendarClock } from 'lucide-react-native';

export default function EarningsScreen() {
  const { state } = useMockData();

  if (!state) return null;

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="pt-16 pb-6 px-6 bg-white border-b border-slate-100 rounded-b-3xl">
        <Text className="text-3xl font-bold text-slate-800 mb-2">Weekly Payouts</Text>
        <Text className="text-slate-500 text-base">Cycle: Mon 8th - Sun 14th</Text>
      </View>

      <View className="px-6 py-8">
        {/* Main Payout Card */}
        <View className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-800/20 mb-8 relative overflow-hidden">
          {/* Background decoration */}
          <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full" />
          <View className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full" />
          
          <Text className="text-slate-400 font-medium mb-2">Protected Income Payout</Text>
          <View className="flex-row items-end mb-6">
            <Text className="text-4xl font-black text-white">₹{state.weeklyProtected}</Text>
            <Text className="text-slate-400 font-medium mb-1 ml-2">pending</Text>
          </View>

          <View className="flex-row bg-white/10 p-4 rounded-2xl items-center">
            <View className="bg-white/20 p-2 rounded-full mr-3">
              <CalendarClock color="#e2e8f0" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-medium">To be credited to UPI</Text>
              <Text className="text-slate-400 text-sm">Sunday, 11:59 PM</Text>
            </View>
          </View>
        </View>

        <Text className="text-xl font-bold text-slate-800 mb-4">Payout History</Text>
        
        {state.weeklyProtected > 0 ? (
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-row items-center mb-4">
            <View className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <ShieldCheck color="#16a34a" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-lg">Claim Auto-Payout</Text>
              <Text className="text-slate-500">Severe Waterlogging</Text>
            </View>
            <Text className="text-green-600 font-bold text-lg">+₹{state.weeklyProtected}</Text>
          </View>
        ) : (
          <View className="bg-white p-6 rounded-2xl border border-slate-200 items-center justify-center opacity-70 border-dashed">
            <Text className="text-slate-500 font-medium text-center">No parametric payouts this week.</Text>
            <Text className="text-slate-400 text-sm text-center mt-1">Your income is protected on every active trip.</Text>
          </View>
        )}

        <View className="bg-blue-50 mt-8 p-5 rounded-2xl items-center">
          <Text className="text-blue-800 text-center font-medium">
            Remember: Premiums are funded by user surcharges, so this protection costs you nothing!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
