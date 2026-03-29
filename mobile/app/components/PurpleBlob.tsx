import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function PurpleBlob() {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 300,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <View
        style={{
          position: 'absolute',
          bottom: -60,
          left: '-25%',
          width: '150%',
          height: 360,
          borderTopLeftRadius: 200,
          borderTopRightRadius: 200,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={['rgba(109,40,217,0.0)', 'rgba(109,40,217,0.35)', 'rgba(88,28,220,0.6)']}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
