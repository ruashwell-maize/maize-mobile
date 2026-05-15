import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = 'https://dmjioaumfbvhpzltlhyz.supabase.co';
const supabaseAnonKey = 'sb_publishable_6_qZLBP_5mfGZvKqHJJXvA_H_X5MePE';

// SecureStore has a ~2048-byte per-value limit on iOS Keychain and some
// Android Keystore backends. Supabase session JWTs frequently exceed this,
// so we transparently chunk large values across keys: `<key>.0`, `.1`, …
// with a `<key>.meta` storing the chunk count.
const CHUNK_SIZE = 1800;

async function clearChunks(key: string) {
  const meta = await SecureStore.getItemAsync(`${key}.meta`);
  if (!meta) return;
  const count = parseInt(meta, 10);
  await Promise.all(
    Array.from({ length: count }, (_, i) =>
      SecureStore.deleteItemAsync(`${key}.${i}`).catch(() => {}),
    ),
  );
  await SecureStore.deleteItemAsync(`${key}.meta`).catch(() => {});
}

const ExpoSecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const meta = await SecureStore.getItemAsync(`${key}.meta`);
    if (meta) {
      const count = parseInt(meta, 10);
      const parts: string[] = [];
      for (let i = 0; i < count; i++) {
        const part = await SecureStore.getItemAsync(`${key}.${i}`);
        if (part === null) return null;
        parts.push(part);
      }
      return parts.join('');
    }
    // Fallback to legacy single-value storage
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await clearChunks(key);
    await SecureStore.deleteItemAsync(key).catch(() => {});

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(`${key}.meta`, String(chunks.length));
    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}.${i}`, chunks[i]);
    }
  },
  async removeItem(key: string): Promise<void> {
    await clearChunks(key);
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage:          ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});
