"use client";

import { useEffect, useMemo, useState } from "react";

export type Meal = {
  idMeal: string;
  strMeal: string;
  strCategory?: string;
  strArea?: string;
  strMealThumb?: string;
  strSource?: string;
  strYoutube?: string;
};

type CuratedList = "iftar" | "sahur";

type UseMealsResult = {
  meals: Meal[];
  loading: boolean;
  error: string | null;
};

export function useCuratedMeals(list: CuratedList): UseMealsResult {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/mealdb/curated?list=${list}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { meals: Meal[] };
        if (!cancelled) setMeals(Array.isArray(json.meals) ? json.meals : []);
      } catch (e) {
        if (!cancelled) {
          setMeals([]);
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
  }, [list]);

  return useMemo(() => ({ meals, loading, error }), [meals, loading, error]);
}
