import { View, Text, ScrollView, Animated } from 'react-native';
import { useMockData } from '../../context/MockDataContext';
import { ShieldCheck, ShieldAlert, CloudRain, AlertTriangle, Wind, Info } from 'lucide-react-native';

export default function DashboardScreen() {
  const { state } = useMockData();

  if (!state) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text>Loading Dashboard...</Text>
      </View>
    );
  }

  const { isTripActive, disruption, claimStatus } = state;

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View className="bg-white pt-16 pb-6 px-6 rounded-b-3xl shadow-sm border-b border-slate-100">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-slate-500 font-medium">Welcome back,</Text>
            <Text className="text-2xl font-bold text-slate-800">Rahul Kumar</Text>
          </View>
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
            <Text className="text-blue-700 font-bold text-lg">RK</Text>
          </View>
        </View>

        {/* Coverage Status Card */}
        <View className={`p-6 rounded-3xl items-center shadow-lg flex-row gap-4 ${isTripActive ? 'bg-blue-600 shadow-blue-500/30' : 'bg-white shadow-slate-200/50 border border-slate-200'}`}>
          <View className={`w-14 h-14 rounded-full items-center justify-center ${isTripActive ? 'bg-blue-500' : 'bg-slate-100'}`}>
            {isTripActive ? (
              <ShieldCheck color="#ffffff" size={32} />
            ) : (
              <ShieldAlert color="#94a3b8" size={32} />
            )}
          </View>
          <View className="flex-1">
            <Text className={`font-bold text-xl ${isTripActive ? 'text-white' : 'text-slate-800'}`}>
              {isTripActive ? 'Coverage Active' : 'Standby Mode'}
            </Text>
            <Text className={`text-sm mt-1 leading-5 ${isTripActive ? 'text-blue-100' : 'text-slate-500'}`}>
              {isTripActive ? 'Your current trip is automatically protected. ₹2 premium routed.' : 'Waiting for you to accept your next trip on your delivery app.'}
            </Text>
          </View>
        </View>
      </View>

      {/* Disruption Alert Area */}
      <View className="px-6 mt-6">
        {disruption && (
          <View className="bg-red-50 border border-red-200 rounded-3xl p-5 mb-6 shadow-sm shadow-red-100 flex-row">
            <View className="mr-4 mt-1">
              <AlertTriangle color="#dc2626" size={28} />
            </View>
            <View className="flex-1">
              <Text className="text-red-700 font-bold text-lg">{disruption.message}</Text>
              <Text className="text-red-600 mt-1">Zone: {disruption.zone}</Text>
              
              <View className="mt-4 bg-white p-4 rounded-xl shadow-sm">
                <Text className="text-slate-700 font-semibold mb-2 text-sm">Automated Claim Status:</Text>
                
                {claimStatus === 'processing' && (
                  <View className="flex-row items-center">
                    <Text className="text-amber-500 font-bold text-base">Processing AI Verification...</Text>
                  </View>
                )}
                {claimStatus === 'approved' && (
                  <View className="flex-row items-center">
                    <ShieldCheck color="#16a34a" size={20} />
                    <Text className="text-green-600 font-bold ml-2 text-base">Approved - Pending Payout</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <Text className="text-slate-800 font-bold text-xl mb-4">Live Zone Indicators</Text>
        
        {/* Risk Indicators Grid */}
        <View className="flex-row flex-wrap justify-between">
          <View className="bg-white w-[48%] p-5 rounded-2xl mb-4 shadow-sm shadow-slate-200/50 border border-slate-100 items-center justify-center">
            <CloudRain color="#0284c7" size={32} className="mb-3" />
            <Text className="text-slate-500 text-sm">Rainfall</Text>
            <Text className="text-slate-800 font-bold text-lg mt-1">Normal</Text>
          </View>
          
          <View className="bg-amber-50 w-[48%] p-5 rounded-2xl mb-4 shadow-sm shadow-amber-100/50 border border-amber-200 items-center justify-center">
            <Wind color="#d97706" size={32} className="mb-3" />
            <Text className="text-amber-600 font-medium text-sm">AQI Level</Text>
            <Text className="text-amber-700 font-bold text-lg mt-1">210 (Poor)</Text>
          </View>

          <View className="bg-white w-[48%] p-5 rounded-2xl mb-4 shadow-sm shadow-slate-200/50 border border-slate-100 items-center justify-center">
            <AlertTriangle color="#ebb305" size={32} className="mb-3" />
            <Text className="text-slate-500 text-sm">Traffic</Text>
            <Text className="text-slate-800 font-bold text-lg mt-1">Moderate</Text>
          </View>
          
          <View className="bg-white w-[48%] p-5 rounded-2xl mb-4 shadow-sm shadow-slate-200/50 border border-slate-100 items-center justify-center">
            <Info color="#475569" size={32} className="mb-3" />
            <Text className="text-slate-500 text-sm">Civic Rules</Text>
            <Text className="text-slate-800 font-bold text-lg mt-1">All Clear</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
