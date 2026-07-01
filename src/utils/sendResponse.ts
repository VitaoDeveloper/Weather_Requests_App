export interface StoredRecord {
  key: string;
  type: 'SUCCESS' | 'ERROR';
  timestamp: number;
  value: string;
}

function storage(): Storage | Map<string, string> {
  if (typeof localStorage !== 'undefined') return localStorage;
  // ponytail: native fallback — in-memory store, replace with AsyncStorage if persistence needed on device
  return new Map<string, string>();
}

export class SendResponse {
  static send(result: 'SUCCESS' | 'ERROR', value: string): void {
    const store = storage();
    const key = `${result}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    if (store instanceof Map) {
      store.set(key, value);
    } else {
      store.setItem(key, value);
    }
  }

  static getAll(): StoredRecord[] {
    const store = storage();
    const entries: StoredRecord[] = [];

    if (store instanceof Map) {
      store.forEach((value, key) => {
        const parsed = this.parseKey(key);
        if (parsed) entries.push({ key, ...parsed, value });
      });
    } else {
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (!key) continue;
        const parsed = this.parseKey(key);
        if (parsed) {
          const value = store.getItem(key) ?? '';
          entries.push({ key, ...parsed, value });
        }
      }
    }

    return entries.sort((a, b) => b.timestamp - a.timestamp);
  }

  private static parseKey(key: string): { type: 'SUCCESS' | 'ERROR'; timestamp: number } | null {
    const parts = key.split('-');
    if (parts.length < 2) return null;
    const type = parts[0];
    if (type !== 'SUCCESS' && type !== 'ERROR') return null;
    const ts = Number(parts[1]);
    return { type, timestamp: isNaN(ts) ? 0 : ts };
  }
}
