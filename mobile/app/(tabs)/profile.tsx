import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, FileText, Download, Eye, ShieldCheck, Phone, Info, HelpCircle, Award } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-slate-50 pt-14">
      {/* Header */}
      <View className="px-6 flex-row items-center pb-6">
        <View style={{ marginRight: 16 }}><ArrowLeft color="#1e293b" size={24} /></View>
        <Text className="text-xl font-bold text-slate-800">Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>

        {/* User Info Header */}
        <View className="flex-row items-center mb-8 px-2">
          <View className="w-16 h-16 rounded-full bg-blue-500 items-center justify-center mr-4">
            <Text className="text-white font-bold text-2xl">A</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text className="text-xl font-bold text-slate-900 mb-1">Arjun Kumar</Text>
            <View className="bg-green-100 flex-row items-center self-start px-2 py-1 rounded-full">
              <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
              <Text className="text-green-700 text-xs font-bold">Blinkit Partner</Text>
            </View>
          </View>
        </View>

        {/* Digital Locker Card */}
        <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-slate-100">
          <Text className="font-bold text-lg text-slate-800 mb-4">Digital Locker</Text>

          {/* Policy Certificate Row */}
          <View className="flex-row items-center justify-between border border-slate-100 rounded-2xl p-4 mb-3">
            <View className="flex-row items-center flex-1 pr-3">
               <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                 <FileText color="#3b82f6" size={20} />
               </View>
               <View style={{ flex: 1 }}>
                 <Text className="text-slate-800 font-bold text-sm">Policy Certificate</Text>
                 <Text className="text-slate-500 text-xs mt-0.5">Valid until Dec 2026</Text>
               </View>
            </View>
            <View className="flex-row items-center gap-4">
               <Eye color="#64748b" size={20} />
               <Download color="#64748b" size={20} />
            </View>
          </View>

          {/* Coverage Terms Row */}
          <View className="flex-row items-center justify-between border border-slate-100 rounded-2xl p-4 mb-3">
            <View className="flex-row items-center flex-1 pr-3">
               <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                 <ShieldCheck color="#a855f7" size={20} />
               </View>
               <View style={{ flex: 1 }}>
                 <Text className="text-slate-800 font-bold text-sm">Coverage Terms</Text>
                 <Text className="text-slate-500 text-xs mt-0.5">Updated Mar 2026</Text>
               </View>
            </View>
            <View className="flex-row items-center gap-4">
               <Eye color="#64748b" size={20} />
               <Download color="#64748b" size={20} />
            </View>
          </View>

          {/* Weekly Summary Row */}
          <View className="flex-row items-center justify-between border border-slate-100 rounded-2xl p-4">
            <View className="flex-row items-center flex-1 pr-3">
               <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-3">
                 <FileText color="#10b981" size={20} />
               </View>
               <View style={{ flex: 1 }}>
                 <Text className="text-slate-800 font-bold text-sm">Weekly Coverage Summary</Text>
               </View>
            </View>
            <View className="flex-row items-center gap-4 pl-2">
               <Eye color="#64748b" size={20} />
               <Download color="#64748b" size={20} />
            </View>
          </View>
        </View>

        {/* Your Stats Card */}
        <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-slate-100">
          <Text className="font-bold text-lg text-slate-800 mb-4">Your Stats</Text>

          <View className="flex-row justify-between mb-5">
             <View className="bg-slate-50 items-center justify-center flex-1 rounded-2xl py-4 mr-2">
                <Text className="text-slate-900 font-bold text-xl mb-1">342</Text>
                <Text className="text-slate-500 text-[10px] uppercase tracking-wider text-center" numberOfLines={2}>Total Trips</Text>
             </View>

             <View className="bg-slate-50 items-center justify-center flex-1 rounded-2xl py-4 mx-1">
                <Text className="text-slate-900 font-bold text-xl mb-1">12</Text>
                <Text className="text-slate-500 text-[10px] uppercase tracking-wider text-center" numberOfLines={2}>High-Risk{'\n'}Zones</Text>
             </View>

             <View className="bg-slate-50 items-center justify-center flex-1 rounded-2xl py-4 ml-2">
                <Text className="text-green-600 font-bold text-xl mb-1">94%</Text>
                <Text className="text-slate-500 text-[10px] uppercase tracking-wider text-center" numberOfLines={2}>Safety Score</Text>
             </View>
          </View>

          <View className="bg-green-100 rounded-2xl p-4 flex-row items-center border border-green-200">
              <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-3">
                 <Award color="#ffffff" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                 <Text className="text-green-900 font-bold text-[15px] mb-0.5">Low-Risk Zone Operator</Text>
                 <Text className="text-green-700 text-xs">Safe delivery champion</Text>
              </View>
          </View>
        </View>

        {/* Help & Support Card */}
        <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm border border-slate-100">
          <Text className="font-bold text-lg text-slate-800 mb-4">Help & Support</Text>

          <TouchableOpacity className="flex-row items-center mb-5 mt-1">
             <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-4">
                <Phone color="#3b82f6" size={18} />
             </View>
             <View style={{ flex: 1 }}>
                 <Text className="text-slate-800 font-bold text-[15px]">24×7 Worker Helpline</Text>
                 <Text className="text-slate-500 text-xs mt-0.5">1800-XXX-XXXX</Text>
             </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center mb-5">
             <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-4">
                <Info color="#a855f7" size={18} />
             </View>
             <View style={{ flex: 1 }}>
                 <Text className="text-slate-800 font-bold text-[15px]">Government Welfare Programs</Text>
                 <Text className="text-slate-500 text-xs mt-0.5">Social security benefits</Text>
             </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center">
             <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mr-4">
                <HelpCircle color="#10b981" size={18} />
             </View>
             <View style={{ flex: 1 }}>
                 <Text className="text-slate-800 font-bold text-[15px]">Insurance FAQ</Text>
                 <Text className="text-slate-500 text-xs mt-0.5">Common questions</Text>
             </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Links */}
        <View className="px-2 mb-10">
          <TouchableOpacity className="mb-6">
            <Text className="text-slate-600 font-medium text-sm">Account Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mb-6">
            <Text className="text-slate-600 font-medium text-sm">Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-red-500 font-bold text-sm">Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
