import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMockData } from '../../context/MockDataContext';
import { ArrowLeft, Bell, ChevronRight, Check, ShieldCheck, Zap, Sparkles } from 'lucide-react-native';

export default function CoverageScreen() {
  const [step, setStep] = useState(1);
  const { state } = useMockData();

  return (
    <View className="flex-1 bg-white pt-14">
      {/* Header */}
      <View className="px-6 flex-row justify-between items-center pb-4">
        <View className="flex-row items-center">
          <View style={{ marginRight: 16 }}><ArrowLeft color="#1e293b" size={24} /></View>
          <Text className="text-xl font-bold text-slate-800">Get Protected</Text>
        </View>
        <View className="relative">
          <View className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full z-10 border border-white" />
          <Bell color="#475569" size={24} />
        </View>
      </View>

      {/* Progress Bar Container */}
      <View className="px-6 pb-6">
        <View className="flex-row justify-between mb-2">
          <View className={`h-1 flex-1 rounded-full mr-2 ${step >= 1 ? 'bg-green-600' : 'bg-slate-200'}`} />
          <View className={`h-1 flex-1 rounded-full mx-1 ${step >= 2 ? 'bg-green-600' : 'bg-slate-200'}`} />
          <View className={`h-1 flex-1 rounded-full ml-2 ${step >= 3 ? 'bg-green-600' : 'bg-slate-200'}`} />
        </View>
        <Text className="text-slate-500 text-xs">Step {step} of 3</Text>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100 }}>

        {step === 1 && (
          <View className="flex-1">
            <Text className="font-bold text-2xl text-slate-900 mb-2 mt-4">Connect Your Account</Text>
            <Text className="text-slate-500 mb-8 text-[15px] leading-6">
              We'll automatically import your worker details for faster setup.
            </Text>

            {/* SSO Button (Mocked) */}
            <TouchableOpacity className="border border-slate-200 rounded-2xl p-4 flex-row items-center justify-between mb-8 shadow-sm bg-white">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-xl bg-green-500 items-center justify-center mr-4">
                  <Text className="text-xl">🚀</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="font-bold text-slate-800 text-base mb-0.5">Sign in with Blinkit</Text>
                  <Text className="font-bold text-slate-800 text-base">Partner ID</Text>
                  <Text className="text-slate-500 text-xs mt-1">Auto-imports your worker details</Text>
                </View>
              </View>
              <ChevronRight color="#94a3b8" size={20} />
            </TouchableOpacity>

            {/* Import Details Block */}
            <View className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 mb-8">
               <Text className="text-blue-800 font-bold mb-4 text-sm">What we'll import:</Text>

               <View className="flex-row items-center mb-3">
                 <View style={{ marginRight: 12 }}><Check color="#3b82f6" size={16} /></View>
                 <Text className="text-blue-600">Worker ID & Name</Text>
               </View>

               <View className="flex-row items-center mb-3">
                 <View style={{ marginRight: 12 }}><Check color="#3b82f6" size={16} /></View>
                 <Text className="text-blue-600">Vehicle Type</Text>
               </View>

               <View className="flex-row items-center">
                 <View style={{ marginRight: 12 }}><Check color="#3b82f6" size={16} /></View>
                 <Text className="text-blue-600">Delivery Zone</Text>
               </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              className="bg-green-600 rounded-xl py-4 items-center"
              onPress={() => setStep(2)}>
              <Text className="text-white font-bold text-base">Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View className="flex-1">
            <Text className="font-bold text-2xl text-slate-900 mb-2 mt-2">How It Works</Text>
            <Text className="text-slate-500 mb-6 text-[15px]">
              Quick overview of your protection benefits.
            </Text>

            {/* Benefit 1 */}
            <View className="border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm bg-white">
              <View className="w-10 h-10 rounded-xl bg-green-500 items-center justify-center mb-4">
                 <ShieldCheck color="#ffffff" size={20} />
              </View>
              <Text className="font-bold text-slate-800 text-base mb-1.5">Income Protection</Text>
              <Text className="text-slate-500 text-sm leading-5">
                Get compensated if deliveries stop due to weather or curfew.
              </Text>
            </View>

            {/* Benefit 2 */}
            <View className="border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm bg-white">
              <View className="w-10 h-10 rounded-xl bg-blue-500 items-center justify-center mb-4">
                 <Zap color="#ffffff" size={20} />
              </View>
              <Text className="font-bold text-slate-800 text-base mb-1.5">Automatic Coverage</Text>
              <Text className="text-slate-500 text-sm leading-5">
                Coverage activates automatically during each delivery.
              </Text>
            </View>

            {/* Benefit 3 */}
            <View className="border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm bg-white">
              <View className="w-10 h-10 rounded-xl bg-purple-500 items-center justify-center mb-4">
                 <Sparkles color="#ffffff" size={20} />
              </View>
              <Text className="font-bold text-slate-800 text-base mb-1.5">Zero Out-of-Pocket</Text>
              <Text className="text-slate-500 text-sm leading-5">
                Premium funded by customer tips and micro-fees.
              </Text>
            </View>

            {/* Navigation Buttons */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-slate-100 rounded-xl py-4 flex-1 items-center mr-3"
                onPress={() => setStep(1)}>
                <Text className="text-slate-700 font-bold text-base">Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-green-600 rounded-xl py-4 flex-1 items-center ml-3"
                onPress={() => setStep(3)}>
                <Text className="text-white font-bold text-base">Next</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

        {step === 3 && (
          <View className="flex-1">
            <Text className="font-bold text-2xl text-slate-900 mb-2 mt-2">Data Permissions</Text>
            <Text className="text-slate-500 mb-6 text-[15px] leading-6">
              We need these permissions to verify claims and protect you better.
            </Text>

            {/* Permissions list */}
            <View className="border border-slate-200 rounded-2xl p-5 mb-5 bg-white shadow-sm">
              {/* Permission 1 */}
              <View className="mb-5">
                <Text className="font-bold text-slate-800 text-base mb-1">Trip Telemetry Access</Text>
                <Text className="text-slate-500 text-sm leading-5">
                  Allows us to verify active deliveries and auto-trigger claims.
                </Text>
              </View>
              {/* Divider */}
              <View className="h-px bg-slate-100 mb-5" />
              {/* Permission 2 */}
              <View className="mb-5">
                <Text className="font-bold text-slate-800 text-base mb-1">GPS Routing Data</Text>
                <Text className="text-slate-500 text-sm leading-5">
                  Helps detect disruptions like traffic or road closures in your area.
                </Text>
              </View>
              {/* Divider */}
              <View className="h-px bg-slate-100 mb-5" />
              {/* Permission 3 */}
              <View>
                <Text className="font-bold text-slate-800 text-base mb-1">Delivery Timestamps</Text>
                <Text className="text-slate-500 text-sm leading-5">
                  Used to calculate protected earnings and coverage periods.
                </Text>
              </View>
            </View>

            {/* Privacy note */}
            <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8">
              <Text className="text-green-800 text-sm leading-5">
                <Text className="font-bold">Privacy First: </Text>
                Your data is encrypted and only used for insurance verification. We never share it with third parties.
              </Text>
            </View>

            {/* Navigation Buttons */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-slate-100 rounded-xl py-4 flex-1 items-center mr-3"
                onPress={() => setStep(2)}>
                <Text className="text-slate-700 font-bold text-base">Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-slate-300 rounded-xl py-4 flex-1 items-center ml-3"
                onPress={() => {}}>
                <Text className="text-slate-500 font-bold text-base">Activate Protection</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
