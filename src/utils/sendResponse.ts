function storage() {
  if (typeof localStorage !== 'undefined') return localStorage;
  // ponytail: native fallback — in-memory store, replace with AsyncStorage if persistence needed on device
  return new Map<string, string>();
}

export class SendResponse {
  private static genSerial(result: 'SUCCESS' | 'ERROR'): string {
    const serial =
      `${result}-` +
      crypto.randomUUID().replace(/-/g, '').slice(0, 5).toUpperCase();
    return serial;
  }

  static send(result: 'SUCCESS' | 'ERROR', value: string): void {
    const store = storage();
    const key = this.genSerial(result);
    if (store instanceof Map) {
      store.set(key, value);
    } else {
      store.setItem(key, value);
    }
  }
}
