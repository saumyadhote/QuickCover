import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMockData } from '../context/MockDataContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AppLogo } from './components/AppLogo';

export default function LandingScreen() {
  const router = useRouter();
  const { loading } = useMockData();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        router.replace('/login');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <View className="flex-1 bg-[#020617] items-center justify-center relative overflow-hidden">
      {/* Background ambient glows */}
      <View className="absolute top-[-150px] left-[-100px] w-96 h-96 bg-purple-600/30 rounded-full blur-[120px]" />
      <View className="absolute bottom-[-120px] right-[-120px] w-96 h-96 bg-indigo-700/20 rounded-full blur-[120px]" />

      <View className="items-center z-10">
        <View className="w-28 h-28 rounded-3xl items-center justify-center mb-6 border border-purple-600/30 shadow-2xl shadow-purple-900/40 overflow-hidden">
          <AppLogo size={84} />
        </View>

        <Text className="text-5xl font-extrabold text-white tracking-tight">
          Quick
          <Text className="text-purple-400">Cover</Text>
        </Text>

        <Text className="text-purple-200 mt-4 font-bold text-xl tracking-wide">Every delivery.</Text>
        <Text className="text-white font-semibold text-xl">We've got your back.</Text>

        <Text className="text-slate-400 text-center mt-6 text-sm leading-6 px-10">
          When heavy rain, curfews, or sudden closures stop deliveries,
          QuickCover helps support you with simple disruption coverage.
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/login')}
          disabled={loading}
          className="mt-10 w-64 rounded-full py-4 items-center overflow-hidden"
        >
          <LinearGradient
            colors={['#7c3aed', '#4f46e5', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="absolute inset-0"
          />
          <Text className="text-white font-bold text-lg tracking-wide z-10">Log In</Text>
        </TouchableOpacity>

        <View className="flex-row items-center mt-6">
          <Text className="text-slate-400 text-sm">Don't have an account? </Text>
          <Text className="text-purple-400 font-bold text-sm">Sign Up</Text>
        </View>
      </View>
    </View>
  );
}
