import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMockData } from '../context/MockDataContext';

// We import Tailwind styles via NativeWind seamlessly since it's configured.

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
    <View className="flex-1 bg-blue-600 items-center justify-center">
      <View className="items-center">
        <View className="w-24 h-24 bg-white rounded-2xl items-center justify-center mb-6 shadow-xl">
          {/* Logo Placeholder */}
          <Text className="text-4xl font-bold text-blue-600">QC</Text>
        </View>
        <Text className="text-4xl font-extrabold text-white tracking-widest">QuickCover</Text>
        <Text className="text-blue-200 mt-2 font-medium text-lg tracking-wide">Parametric Income Protection</Text>
      </View>
      <ActivityIndicator size="large" color="white" className="absolute bottom-12" />
    </View>
  );
}
