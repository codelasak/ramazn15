export type StoredLocation = {
  districtId: number;
  districtName?: string;
  stateId?: number;
  stateName?: string;
  source: "geo" | "manual";
  updatedAt: number;
};

const KEY = "ramazan15.location.v1";

export function loadStoredLocation(): StoredLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredLocation>;
    if (typeof parsed.districtId !== "number") return null;
    return {
      districtId: parsed.districtId,
      districtName: typeof parsed.districtName === "string" ? parsed.districtName : undefined,
      stateId: typeof parsed.stateId === "number" ? parsed.stateId : undefined,
      stateName: typeof parsed.stateName === "string" ? parsed.stateName : undefined,
      source: parsed.source === "manual" ? "manual" : "geo",
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveStoredLocation(location: StoredLocation): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(location));
}

export function clearStoredLocation(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
