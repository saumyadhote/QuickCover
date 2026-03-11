import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    // Navigate to actual app dashboard
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-slate-50 relative">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-8 shadow-lg shadow-blue-500/50">
          <Text className="text-3xl font-bold text-white">QC</Text>
        </View>
        
        <Text className="text-3xl font-extrabold text-slate-900 text-center">
          Welcome to QuickCover
        </Text>
        <Text className="text-slate-500 text-center mt-3 text-base">
          Log in with your existing gig platform ID to instantly activate income protection.
        </Text>

        <View className="w-full mt-10 space-y-4 flex flex-col items-center">
          {/* Mock integration buttons */}
          <TouchableOpacity 
            onPress={handleLogin}
            className="w-full bg-[#fce000] py-4 rounded-xl flex-row justify-center items-center shadow-md mb-4"
          >
            <Text className="text-black font-semibold text-lg ml-2">Continue with Blinkit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleLogin}
            className="w-full bg-[#3e0b57] py-4 rounded-xl flex-row justify-center items-center shadow-md mb-4"
          >
            <Text className="text-white font-semibold text-lg ml-2">Continue with Zepto</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
