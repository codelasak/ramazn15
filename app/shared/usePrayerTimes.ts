"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadStoredLocation } from "./userPrefs";

export type PrayerTimes = {
  imsak?: string;
  gunes?: string;
  ogle?: string;
  ikindi?: string;
  aksam?: string;
  yatsi?: string;
  [key: string]: unknown;
};

type UsePrayerTimesResult = {
  districtId: number | null;
  times: PrayerTimes | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

function extractTodayTimes(payload: unknown): PrayerTimes | null {
  if (!payload) return null;
  if (Array.isArray(payload)) {
    const first = payload[0];
    if (first && typeof first === "object") return first as PrayerTimes;
    return null;
  }
  if (typeof payload === "object") return payload as PrayerTimes;
  return null;
}

export function usePrayerTimes(): UsePrayerTimesResult {
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readDistrictFromStorage = useCallback(() => {
    const loc = loadStoredLocation();
    setDistrictId(loc?.districtId ?? null);
  }, []);

  useEffect(() => {
    readDistrictFromStorage();

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes("ramazan15.location")) readDistrictFromStorage();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [readDistrictFromStorage]);

  const fetchTimes = useCallback(async () => {
    if (!districtId) {
      setTimes(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/imsakiyem/prayer-times?districtId=${districtId}&period=daily`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as unknown;
      const extracted = extractTodayTimes(json);
      setTimes(extracted);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bilinmeyen hata");
      setTimes(null);
    } finally {
      setLoading(false);
    }
  }, [districtId]);

  useEffect(() => {
    void fetchTimes();
  }, [fetchTimes]);

  const reload = useCallback(() => {
    void fetchTimes();
  }, [fetchTimes]);

  return useMemo(
    () => ({ districtId, times, loading, error, reload }),
    [districtId, times, loading, error, reload]
  );
}
