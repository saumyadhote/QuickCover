import { Platform } from 'react-native';

const PRODUCTION_API = 'https://quickcover.onrender.com';

/**
 * Resolves the backend API URL for the current environment:
 *   - Production APK/IPA (__DEV__ = false) → https://quickcover.onrender.com
 *   - Web (browser)                        → https://quickcover.onrender.com
 *   - EXPO_PUBLIC_API_URL set              → that value (local dev override)
 *   - Android emulator (dev)               → 10.0.2.2:4000  (host machine alias)
 *   - iOS simulator (dev)                  → localhost:4000
 *
 * To point at a local backend during development, set in mobile/.env:
 *   EXPO_PUBLIC_API_URL=http://<your-wifi-ip>:4000
 */
export function resolveApiUrl(): string {
  // Production builds always hit the live backend — emulator aliases won't
  // exist on real devices and EXPO_PUBLIC_API_URL won't be set in EAS builds.
  if (!__DEV__) return PRODUCTION_API;

  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  if (Platform.OS === 'web') return PRODUCTION_API;
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
  return 'http://localhost:4000';
}

export const API_URL = resolveApiUrl();
