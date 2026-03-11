import { Slot } from 'expo-router';
import { MockDataProvider } from '../context/MockDataContext';

export default function RootLayout() {
  return (
    <MockDataProvider>
      <Slot />
    </MockDataProvider>
  );
}
