import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMockData } from '../context/MockDataContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const router = useRouter();
  const { loading } = useMockData();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        router.replace('/login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <View className="flex-1 bg-[#020617] items-center justify-center relative overflow-hidden">
      {/* Background ambient glows */}
      <View className="absolute top-[-150px] left-[-100px] w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]" />
      <View className="absolute bottom-[-100px] right-[-100px] w-80 h-80 bg-cyan-600/20 rounded-full blur-[120px]" />

      <View className="items-center z-10">
        <View className="w-24 h-24 rounded-3xl items-center justify-center mb-6 border border-slate-700/50 shadow-2xl shadow-blue-900/50 overflow-hidden">
          <LinearGradient
            colors={['rgba(37, 99, 235, 0.4)', 'rgba(15, 23, 42, 0.8)']}
            className="flex-1 w-full h-full items-center justify-center"
          >
            <Text className="text-4xl font-black text-white">QC</Text>
          </LinearGradient>
        </View>
        <Text className="text-4xl font-extrabold text-white tracking-widest">QuickCover</Text>
        <Text className="text-blue-400 mt-2 font-medium text-lg tracking-wide uppercase text-xs">Parametric Income Protection</Text>
      </View>
      <ActivityIndicator size="large" color="#60a5fa" className="absolute bottom-16" />
    </View>
  );
}
