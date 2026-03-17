import { Platform } from 'react-native';

/**
 * Resolves the backend API URL for the current environment:
 *   - Android emulator  → 10.0.2.2:4000  (host machine alias)
 *   - iOS simulator     → localhost:4000
 *   - Physical device   → EXPO_PUBLIC_API_URL from mobile/.env
 *
 * To use on a physical device, set in mobile/.env:
 *   EXPO_PUBLIC_API_URL=http://<your-wifi-ip>:4000
 * This file is gitignored so it will never be overwritten by git.
 */
export function resolveApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000';
  return 'http://localhost:4000';
}

export const API_URL = resolveApiUrl();
