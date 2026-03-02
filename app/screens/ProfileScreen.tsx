"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clearStoredLocation,
  loadStoredLocation,
  saveStoredLocation,
  type StoredLocation,
} from "../shared/userPrefs";
import { normalizeTr, safeNumber } from "../shared/utils";

type ImsakiyemState = { Id: number; Name: string };
type ImsakiyemDistrict = { Id: number; Name: string };

type ReverseResult = {
  address?: {
    state?: string;
    province?: string;
    city?: string;
    town?: string;
    county?: string;
    city_district?: string;
    suburb?: string;
  };
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export default function ProfileScreen() {
  const [stored, setStored] = useState<StoredLocation | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [states, setStates] = useState<ImsakiyemState[]>([]);
  const [stateId, setStateId] = useState<number | null>(null);
  const [districts, setDistricts] = useState<ImsakiyemDistrict[]>([]);
  const [districtId, setDistrictId] = useState<number | null>(null);

  useEffect(() => {
    setStored(loadStoredLocation());
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const data = await fetchJson<{ states: ImsakiyemState[] }>("/api/imsakiyem/states");
        if (!cancelled) setStates(Array.isArray(data.states) ? data.states : []);
      } catch {
        if (!cancelled) setStates([]);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!stateId) {
        setDistricts([]);
        return;
      }
      try {
        const data = await fetchJson<{ districts: ImsakiyemDistrict[] }>(
          `/api/imsakiyem/districts?stateId=${stateId}`
        );
        if (!cancelled) setDistricts(Array.isArray(data.districts) ? data.districts : []);
      } catch {
        if (!cancelled) setDistricts([]);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [stateId]);

  const selectedStateName = useMemo(() => {
    const s = states.find((x) => x.Id === stateId);
    return s?.Name ?? null;
  }, [states, stateId]);

  const selectedDistrictName = useMemo(() => {
    const d = districts.find((x) => x.Id === districtId);
    return d?.Name ?? null;
  }, [districts, districtId]);

  async function detectFromGeolocation() {
    setBusy(true);
    setStatus(null);
    try {
      const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(err),
          { enableHighAccuracy: false, timeout: 12000 }
        );
      });

      const reverse = await fetchJson<ReverseResult>(
        `/api/osm/reverse?lat=${coords.latitude}&lon=${coords.longitude}`
      );

      const osmState =
        reverse.address?.state ?? reverse.address?.province ?? reverse.address?.city ?? "";
      const osmDistrict =
        reverse.address?.county ??
        reverse.address?.city_district ??
        reverse.address?.town ??
        reverse.address?.suburb ??
        "";

      if (!osmState || !osmDistrict) {
        throw new Error("OSM konumu il/ilçe olarak çözümlenemedi");
      }

      const stateSearch = await fetchJson<{ states: ImsakiyemState[] }>(
        `/api/imsakiyem/states?query=${encodeURIComponent(osmState)}`
      );

      const nState = normalizeTr(osmState);
      const state = (stateSearch.states ?? []).find((s) => normalizeTr(s.Name) === nState);
      const pickedState = state ?? stateSearch.states?.[0];
      if (!pickedState) throw new Error("İl bulunamadı");

      /* District search — upstream doesn't handle Turkish chars well, so
         fetch full list for the state and match client-side */
      const districtList = await fetchJson<{ districts: ImsakiyemDistrict[] }>(
        `/api/imsakiyem/districts?stateId=${pickedState.Id}`
      );

      const nDistrict = normalizeTr(osmDistrict);
      const district = (districtList.districts ?? []).find(
        (d) => normalizeTr(d.Name) === nDistrict
      );
      /* If exact match fails, try substring / includes match */
      const fuzzyDistrict = district ?? (districtList.districts ?? []).find(
        (d) => normalizeTr(d.Name).includes(nDistrict) || nDistrict.includes(normalizeTr(d.Name))
      );
      const pickedDistrict = fuzzyDistrict ?? districtList.districts?.[0];
      if (!pickedDistrict) throw new Error("İlçe bulunamadı");

      const newLoc: StoredLocation = {
        districtId: pickedDistrict.Id,
        districtName: pickedDistrict.Name,
        stateId: pickedState.Id,
        stateName: pickedState.Name,
        source: "geo",
        updatedAt: Date.now(),
      };

      saveStoredLocation(newLoc);
      setStored(newLoc);
      setStateId(pickedState.Id);
      setDistrictId(pickedDistrict.Id);
      setStatus(`Konum ayarlandı: ${pickedDistrict.Name} / ${pickedState.Name}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Konum alınamadı");
    } finally {
      setBusy(false);
    }
  }

  function saveManual() {
    if (!stateId || !districtId) {
      setStatus("İl ve ilçe seç");
      return;
    }

    const loc: StoredLocation = {
      districtId,
      districtName: selectedDistrictName ?? undefined,
      stateId,
      stateName: selectedStateName ?? undefined,
      source: "manual",
      updatedAt: Date.now(),
    };

    saveStoredLocation(loc);
    setStored(loc);
    setStatus("Konum kaydedildi");
  }

  function clear() {
    clearStoredLocation();
    setStored(null);
    setStateId(null);
    setDistrictId(null);
    setStatus("Konum temizlendi");
  }

  return (
    <div className="relative min-h-dvh">
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white text-xl font-bold shadow-md">
            <span className="material-icons-round text-2xl">person</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil & Ayarlar</h1>
            <p className="text-sm text-gray-500">Konum ve tercihlerinizi yönetin</p>
          </div>
        </div>
      </header>

      <div className="px-6 space-y-6 pb-8">
        {/* Current location card */}
        <section className="bg-white rounded-2xl p-5 card-shadow border border-mint-soft">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
            <span className="material-icons-round text-primary text-xl">location_on</span>
            Mevcut Konum
          </h2>
          {stored ? (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">İlçe</span>
                <span className="font-semibold text-gray-800">{stored.districtName ?? stored.districtId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">İl</span>
                <span className="font-semibold text-gray-800">{stored.stateName ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className={`w-2 h-2 rounded-full ${stored.source === "geo" ? "bg-primary" : "bg-amber-400"}`} />
                <span className="text-xs text-gray-400">
                  {stored.source === "geo" ? "Otomatik konum" : "Manuel seçim"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 mb-4">
              <span className="material-icons-round text-primary-light/50 text-4xl mb-2 block">location_off</span>
              <p className="text-gray-400 text-sm">Konum seçilmedi</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={detectFromGeolocation}
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              <span className="material-icons-round text-lg">my_location</span>
              {busy ? "Bulunuyor…" : "Otomatik Bul"}
            </button>
            <button
              type="button"
              onClick={clear}
              className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 px-4 rounded-xl text-sm font-medium transition-colors"
            >
              <span className="material-icons-round text-lg">delete_outline</span>
            </button>
          </div>

          {status && (
            <p className="mt-3 text-xs text-primary-dark bg-mint-soft/50 px-3 py-2 rounded-lg">{status}</p>
          )}
        </section>

        {/* Manual selection */}
        <section className="bg-white rounded-2xl p-5 card-shadow border border-mint-soft">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-4">
            <span className="material-icons-round text-primary text-xl">edit_location</span>
            Manuel Seçim
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5" htmlFor="state">
                İl
              </label>
              <select
                id="state"
                value={stateId ?? ""}
                onChange={(e) => {
                  const id = safeNumber(e.target.value);
                  setStateId(id);
                  setDistrictId(null);
                }}
                className="w-full rounded-xl border border-mint-soft bg-mint-soft/20 px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
              >
                <option value="">İl seçin…</option>
                {states.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5" htmlFor="district">
                İlçe
              </label>
              <select
                id="district"
                value={districtId ?? ""}
                onChange={(e) => setDistrictId(safeNumber(e.target.value))}
                className="w-full rounded-xl border border-mint-soft bg-mint-soft/20 px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 disabled:opacity-50"
                disabled={!stateId}
              >
                <option value="">İlçe seçin…</option>
                {districts.map((d) => (
                  <option key={d.Id} value={d.Id}>
                    {d.Name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={saveManual}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-primary/20"
            >
              <span className="material-icons-round text-lg">save</span>
              Kaydet
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
