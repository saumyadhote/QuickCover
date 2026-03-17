import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AppLogo } from './components/AppLogo';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#050714] relative">
      {/* Background ambient glows */}
      <View className="absolute top-[-120px] right-[-120px] w-[560px] h-[560px] bg-purple-600/18 rounded-full blur-[140px]" />
      <View className="absolute bottom-[-120px] left-[-120px] w-[560px] h-[560px] bg-slate-900/40 rounded-full blur-[140px]" />
      <View className="absolute top-[28%] left-[40%] w-72 h-72 bg-indigo-700/10 rounded-full blur-[100px]" />

      <View className="flex-1 px-8 justify-between pt-24 pb-12">

        {/* Top: Branding */}
        <View className="items-center">
          {/* Icon / logo */}
          <View className="w-24 h-24 rounded-3xl items-center justify-center mb-8 border border-purple-600/30 overflow-hidden shadow-2xl">
            <AppLogo size={88} />
          </View>

          {/* App name */}
          <Text className="text-5xl font-extrabold text-white tracking-tight text-center">
            Quick<Text className="text-purple-400">Cover</Text>
          </Text>

          {/* Tagline */}
          <Text className="text-purple-200 font-semibold text-lg mt-4 text-center leading-7">
            Every delivery.
          </Text>
          <Text className="text-white font-semibold text-lg text-center leading-7">
            We've got your back.
          </Text>

          {/* Sub-copy */}
          <Text className="text-slate-400 text-center mt-6 text-sm leading-6 px-4">
            When heavy rain, curfews, or sudden closures stop deliveries,
            QuickCover helps support you with simple disruption coverage.
          </Text>
        </View>

        {/* Bottom: CTAs */}
        <View>
          <TouchableOpacity
            onPress={() => router.push('/login-form')}
            className="w-full rounded-2xl py-4 items-center mb-4 overflow-hidden"
          >
            <LinearGradient
              colors={['#7c3aed', '#4f46e5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute inset-0"
            />
            <Text className="text-white font-bold text-lg tracking-wide z-10">Log In</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center">
            <Text className="text-slate-500 text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text className="text-purple-400 font-bold text-sm">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );
}
