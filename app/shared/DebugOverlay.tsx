"use client";

import { useState, useSyncExternalStore } from "react";
import {
  clearDebugLog,
  getDebugLogSnapshot,
  subscribeDebugLog,
} from "../lib/debug-log";
import { isNativePlatform } from "../lib/platform";

/**
 * Pano15 in-app debug overlay.
 *
 * iOS WKWebView console-pty buffering yuzunden gercek zamanli log
 * gozlemleyemedigimiz icin, sadece native (Capacitor) build'lerinde
 * ekrana log paneli rendlerleriz. Default olarak kapali; ihtiyac
 * olursa NEXT_PUBLIC_DEBUG_OVERLAY=1 env'ini set edip mobile:build
 * yaptiginizda ekranda gorunur. Web tarafinda DevTools varken bu
 * gerekli degil; tamamen gizli kalir.
 */
const DEBUG_OVERLAY_ENABLED = process.env.NEXT_PUBLIC_DEBUG_OVERLAY === "1";
function debugSubscribe(cb: () => void): () => void {
  return subscribeDebugLog(() => cb());
}
function debugSnapshot(): readonly string[] {
  return getDebugLogSnapshot();
}
function debugServerSnapshot(): readonly string[] {
  return [];
}

export default function DebugOverlay() {
  const debugLines = useSyncExternalStore(
    debugSubscribe,
    debugSnapshot,
    debugServerSnapshot
  );
  const [open, setOpen] = useState(true);

  if (!DEBUG_OVERLAY_ENABLED) return null;
  if (typeof window === "undefined") return null;
  if (!isNativePlatform()) return null;

  async function copyLog() {
    const text = debugLines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="pointer-events-auto mx-2 mb-2 rounded-xl bg-black/85 text-emerald-200 text-[10px] leading-tight font-mono shadow-2xl border border-emerald-700/50 backdrop-blur">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-emerald-700/40">
          <span className="font-semibold text-emerald-100">
            DEBUG ({debugLines.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyLog}
              className="px-2 py-0.5 rounded bg-emerald-700/40 text-emerald-100 text-[10px]"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => clearDebugLog()}
              className="px-2 py-0.5 rounded bg-emerald-700/40 text-emerald-100 text-[10px]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="px-2 py-0.5 rounded bg-emerald-700/40 text-emerald-100 text-[10px]"
            >
              {open ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {open && (
          <pre className="m-0 p-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-[10px] leading-snug">
            {debugLines.length === 0 ? "(boş)" : debugLines.join("\n")}
          </pre>
        )}
      </div>
    </div>
  );
}
