import { Platform } from 'react-native';

const KEY = 'OPENWEATHER_API_KEY';

// ponytail: expo-secure-store on native (Keychain/Keystore), localStorage on web.
// web localStorage is not encrypted — key stored in cleartext in browser storage.
// Acceptable: no universal encrypted storage API for all browsers.
// Upgrade: Web Crypto API + IndexedDB when credential storage standard matures.
let SecureStore: {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
} | null = null;

if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    SecureStore = require('expo-secure-store');
  } catch {}
}

export async function getKey(): Promise<string | null> {
  if (SecureStore) return SecureStore.getItemAsync(KEY);
  const v = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
  return v ?? null;
}

export async function setKey(key: string): Promise<void> {
  if (SecureStore) { await SecureStore.setItemAsync(KEY, key); return; }
  if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, key);
}

export async function removeKey(): Promise<void> {
  if (SecureStore) { await SecureStore.deleteItemAsync(KEY); return; }
  if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
}

export async function hasKey(): Promise<boolean> {
  return (await getKey()) !== null;
}
