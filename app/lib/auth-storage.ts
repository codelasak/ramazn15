/**
 * Pano15 client-side token storage.
 *
 * Native (Capacitor) tarafinda @capacitor/preferences ile guvenli depolama;
 * tarayicida localStorage fallback. Bu dosya hem web hem mobil ayni iskelet
 * uzerinden calismayi saglar.
 */

// Storage anahtarlari (degerleri degil): localStorage / Preferences icin kullanilir.
const STORAGE_KEYS = {
  access: "pano15.session.access",
  refresh: "pano15.session.refresh",
  user: "pano15.session.user",
} as const;

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  className: string | null;
  department: "teknoloji_fen" | "fen_sosyal" | "hazirlik" | null;
  isBoarder: boolean;
  profileImageUrl: string | null;
};

interface PreferencesPlugin {
  get(opts: { key: string }): Promise<{ value: string | null }>;
  set(opts: { key: string; value: string }): Promise<void>;
  remove(opts: { key: string }): Promise<void>;
}

let cachedPreferences: PreferencesPlugin | null | undefined;

async function getPreferences(): Promise<PreferencesPlugin | null> {
  if (cachedPreferences !== undefined) return cachedPreferences;

  try {
    // Capacitor sadece native build'de yuklendiginde calisir.
    // Browser'da bu import basarili olsa bile getPlatform() === 'web' olur.
    const cap = (await import("@capacitor/core")).Capacitor;
    if (typeof cap?.isNativePlatform === "function" && cap.isNativePlatform()) {
      const mod = await import("@capacitor/preferences");
      cachedPreferences = mod.Preferences as unknown as PreferencesPlugin;
      return cachedPreferences;
    }
  } catch {
    // Capacitor mevcut degil (web build).
  }
  cachedPreferences = null;
  return null;
}

async function readKey(key: string): Promise<string | null> {
  const prefs = await getPreferences();
  if (prefs) {
    const { value } = await prefs.get({ key });
    return value;
  }
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

async function writeKey(key: string, value: string): Promise<void> {
  const prefs = await getPreferences();
  if (prefs) {
    await prefs.set({ key, value });
    return;
  }
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

async function removeKey(key: string): Promise<void> {
  const prefs = await getPreferences();
  if (prefs) {
    await prefs.remove({ key });
    return;
  }
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export async function getAccessToken(): Promise<string | null> {
  return readKey(STORAGE_KEYS.access);
}

export async function getRefreshToken(): Promise<string | null> {
  return readKey(STORAGE_KEYS.refresh);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await readKey(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function persistSession(input: {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}): Promise<void> {
  await Promise.all([
    writeKey(STORAGE_KEYS.access, input.accessToken),
    writeKey(STORAGE_KEYS.refresh, input.refreshToken),
    writeKey(STORAGE_KEYS.user, JSON.stringify(input.user)),
  ]);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    removeKey(STORAGE_KEYS.access),
    removeKey(STORAGE_KEYS.refresh),
    removeKey(STORAGE_KEYS.user),
  ]);
}

export type { AuthUser };
