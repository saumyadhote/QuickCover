import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    // Navigate to actual app dashboard
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-[#020617] relative">
      {/* Background ambient glows */}
      <View className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      <View className="absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-purple-600/20 rounded-full blur-[120px]" />

      <View className="flex-1 px-6 justify-center z-10">
        
        <View className="items-center mb-12">
          <View className="w-20 h-20 rounded-3xl items-center justify-center mb-6 border border-slate-700/50 shadow-2xl shadow-blue-900/50 overflow-hidden">
            <LinearGradient
              colors={['rgba(37, 99, 235, 0.4)', 'rgba(15, 23, 42, 0.8)']}
              className="flex-1 w-full h-full items-center justify-center"
            >
              <Text className="text-3xl font-black text-white">QC</Text>
            </LinearGradient>
          </View>
          
          <Text className="text-3xl font-extrabold text-white text-center tracking-wide">
            Welcome to QuickCover
          </Text>
          <Text className="text-slate-400 text-center mt-3 text-base px-4">
            Log in with your existing gig platform ID to instantly activate income protection.
          </Text>
        </View>

        <BlurView intensity={20} tint="dark" className="w-full rounded-3xl overflow-hidden border border-slate-800/60 p-6">
          <LinearGradient colors={['rgba(30, 41, 59, 0.3)', 'rgba(2, 6, 23, 0.5)']} className="absolute inset-0" />
          
          <Text className="text-slate-400 font-medium mb-6 text-sm uppercase tracking-wider text-center">Select Partner Network</Text>
          
          <TouchableOpacity 
            onPress={handleLogin}
            className="w-full bg-[#fce000]/10 border border-[#fce000]/30 py-4 rounded-2xl flex-row justify-center items-center shadow-lg"
          >
            <Text className="text-[#fce000] font-bold text-lg tracking-wide">Continue with Blinkit</Text>
          </TouchableOpacity>
        </BlurView>
        
      </View>
    </View>
  );
}
