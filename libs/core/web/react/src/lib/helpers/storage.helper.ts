/**
 * Storage Helper to interact with local storage
 */
export class StorageHelper {
  static set(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  static get<T>(key: string) {
    const value = localStorage.getItem(key);
    return value as T | null;
  }

  static remove(key: string) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }
}
