/**
 * Pano15 client-side token storage.
 *
 * Native (Capacitor) tarafinda @capacitor/preferences ile guvenli depolama;
 * tarayicida localStorage fallback. Capacitor 8 + WKWebView birlesimi bazi
 * cihazlarda Preferences cagrilarini bridge'de takmaktadir; bu yuzden HER
 * Preferences cagrisini timeout + localStorage fallback ile sariyoruz.
 */
import { dbg } from "./debug-log";

const PREFS_TIMEOUT_MS = 2500;

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
  targetUniversity: string | null;
  targetNet: string | null;
};

interface PreferencesPlugin {
  get(opts: { key: string }): Promise<{ value: string | null }>;
  set(opts: { key: string; value: string }): Promise<void>;
  remove(opts: { key: string }): Promise<void>;
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  Plugins?: { Preferences?: PreferencesPlugin };
}

/**
 * Native build'de @capacitor/core & @capacitor/preferences zaten WebView
 * yuklenirken inject edilmis durumda; window.Capacitor.Plugins.Preferences
 * synchronous olarak hazirdir. Dynamic import (`await import(...)`) bazi
 * cihazlarda asla resolve etmediginden burada hic kullanmiyoruz.
 */
function getPreferencesSync(): PreferencesPlugin | null {
  if (typeof window === "undefined") return null;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  if (!cap?.isNativePlatform?.()) return null;
  return cap.Plugins?.Preferences ?? null;
}

function withTimeout<T>(label: string, p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => {
      dbg("[auth-storage]", label, "TIMEOUT", ms + "ms");
      reject(new Error(`Preferences ${label} timeout ${ms}ms`));
    }, ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

function lsGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function lsRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

async function readKey(key: string): Promise<string | null> {
  const prefs = getPreferencesSync();
  if (prefs) {
    try {
      dbg("[auth-storage]", "prefs.get", key);
      const { value } = await withTimeout(`get(${key})`, prefs.get({ key }), PREFS_TIMEOUT_MS);
      dbg("[auth-storage]", "prefs.get done", key, "value=" + (value ? "<set>" : "null"));
      if (value != null) lsSet(key, value);
      return value;
    } catch (err) {
      dbg("[auth-storage]", "prefs.get FAIL -> localStorage", key, err instanceof Error ? err.message : String(err));
    }
  }
  return lsGet(key);
}

async function writeKey(key: string, value: string): Promise<void> {
  // Always write to localStorage first (synchronous, never hangs).
  lsSet(key, value);
  const prefs = getPreferencesSync();
  if (!prefs) return;
  try {
    dbg("[auth-storage]", "prefs.set", key);
    await withTimeout(`set(${key})`, prefs.set({ key, value }), PREFS_TIMEOUT_MS);
    dbg("[auth-storage]", "prefs.set done", key);
  } catch (err) {
    dbg("[auth-storage]", "prefs.set FAIL (localStorage already updated)", key, err instanceof Error ? err.message : String(err));
  }
}

async function removeKey(key: string): Promise<void> {
  // Always remove from localStorage first.
  lsRemove(key);
  const prefs = getPreferencesSync();
  if (!prefs) return;
  try {
    dbg("[auth-storage]", "prefs.remove", key);
    await withTimeout(`remove(${key})`, prefs.remove({ key }), PREFS_TIMEOUT_MS);
    dbg("[auth-storage]", "prefs.remove done", key);
  } catch (err) {
    dbg("[auth-storage]", "prefs.remove FAIL (localStorage already cleared)", key, err instanceof Error ? err.message : String(err));
  }
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
