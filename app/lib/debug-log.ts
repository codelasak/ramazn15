/**
 * Pano15 in-app debug log buffer.
 *
 * iOS WKWebView console-pty buffering yuzunden gercek zamanli log
 * gozlemleyemedigimiz icin, log satirlarini bellek icinde tutup ekrana
 * (LoginScreen'in alt overlay'inde) gostermek icin kullanilir.
 */

type Listener = (lines: string[]) => void;

const MAX_LINES = 200;
const buffer: string[] = [];
const listeners = new Set<Listener>();
// useSyncExternalStore icin stabil snapshot referansi: ayni veri ise ayni
// array referansi dondurmek zorunlu, aksi halde infinite re-render olur.
let snapshotCache: string[] = [];

function emit() {
  snapshotCache = buffer.slice();
  for (const l of listeners) {
    try {
      l(snapshotCache);
    } catch {
      // ignore listener errors
    }
  }
}

export function dbg(tag: string, ...args: unknown[]): void {
  const ts = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
  const parts = args.map((a) => {
    if (a instanceof Error) return `${a.name}: ${a.message}`;
    if (typeof a === "string") return a;
    try {
      return JSON.stringify(a);
    } catch {
      return String(a);
    }
  });
  const line = `[${ts}] ${tag} ${parts.join(" ")}`.trim();
  buffer.push(line);
  if (buffer.length > MAX_LINES) buffer.splice(0, buffer.length - MAX_LINES);
  // Kept for parity; no-op if console-pty is buffered.
  try {
    console.log(line);
  } catch {
    // ignore
  }
  emit();
}

export function subscribeDebugLog(fn: Listener): () => void {
  listeners.add(fn);
  // Initial snapshot
  fn(snapshotCache);
  return () => {
    listeners.delete(fn);
  };
}

export function clearDebugLog(): void {
  buffer.length = 0;
  snapshotCache = [];
  emit();
}

export function getDebugLogSnapshot(): readonly string[] {
  return snapshotCache;
}
