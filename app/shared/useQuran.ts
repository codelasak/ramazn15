"use client";

import { useEffect, useMemo, useState } from "react";
import { apiJson } from "../lib/api-client";

export type SurahListItem = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

export type QuranAyah = {
  number: number;
  numberInSurah: number;
  text: string;
  audio?: string;
};

export type QuranEdition = {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
};

export type QuranSurahEditions = {
  surahNumber: number;
  surahName: string;
  arabic: { edition: QuranEdition; ayahs: QuranAyah[] };
  turkish: { edition: QuranEdition; ayahs: QuranAyah[] };
  audio: { edition: QuranEdition; ayahs: QuranAyah[] };
};

type UseSurahListResult = {
  surahs: SurahListItem[];
  loading: boolean;
  error: string | null;
};

type UseSurahResult = {
  data: QuranSurahEditions | null;
  loading: boolean;
  error: string | null;
};

export function useSurahList(): UseSurahListResult {
  const [surahs, setSurahs] = useState<SurahListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const json = await apiJson<{ surahs: SurahListItem[] }>(
          "/api/quran/surah-list",
          { method: "GET" },
          { auth: false }
        );
        if (!cancelled) setSurahs(Array.isArray(json.surahs) ? json.surahs : []);
      } catch (e) {
        if (!cancelled) {
          setSurahs([]);
          setError(e instanceof Error ? e.message : "Bilinmeyen hata");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => ({ surahs, loading, error }), [surahs, loading, error]);
}

export function useSurah(number: number | null): UseSurahResult {
  const [data, setData] = useState<QuranSurahEditions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!number) {
        setData(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const json = await apiJson<QuranSurahEditions>(
          `/api/quran/surah?number=${number}`,
          { method: "GET" },
          { auth: false }
        );
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(e instanceof Error ? e.message : "Bilinmeyen hata");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [number]);

  return useMemo(() => ({ data, loading, error }), [data, loading, error]);
}
