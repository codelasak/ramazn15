import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  persistSession,
  type AuthUser,
} from "./auth-storage";

/**
 * Pano15 fetch wrapper. Web build'de NEXT_PUBLIC_API_URL bos olabilir;
 * o zaman ayni origin'e relative request gider. Mobil build'de
 * NEXT_PUBLIC_API_URL VPS URL'sini gosterir (orn: https://15temmuz.fennaver.tech).
 *
 * Otomatik:
 *  - Authorization: Bearer <accessToken> header'i
 *  - 401 dondugunde refresh token ile bir kez retry
 */

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

async function attachAuth(headers: Headers): Promise<void> {
  const token = await getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(buildUrl("/api/v1/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      await clearSession();
      return false;
    }
    const data = (await res.json()) as { accessToken: string; refreshToken: string };
    // Refresh sonrasi user bilgisini de tazelemek icin /me cagiriyoruz.
    const meRes = await fetch(buildUrl("/api/v1/auth/me"), {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    if (!meRes.ok) {
      await clearSession();
      return false;
    }
    const me = (await meRes.json()) as { user: AuthUser };
    await persistSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: me.user,
    });
    return true;
  } catch {
    await clearSession();
    return false;
  }
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean; retry?: boolean } = {}
): Promise<Response> {
  const auth = options.auth ?? true;
  const retry = options.retry ?? true;

  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) await attachAuth(headers);

  const res = await fetch(buildUrl(path), { ...init, headers });

  if (res.status === 401 && retry && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const headers2 = new Headers(init.headers);
      if (init.body && !headers2.has("Content-Type") && !(init.body instanceof FormData)) {
        headers2.set("Content-Type", "application/json");
      }
      await attachAuth(headers2);
      return fetch(buildUrl(path), { ...init, headers: headers2 });
    }
  }

  return res;
}

export async function apiJson<T = unknown>(
  path: string,
  init: RequestInit = {},
  options?: { auth?: boolean; retry?: boolean }
): Promise<T> {
  const res = await apiFetch(path, init, options);
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String((data as { error: unknown }).error)
        : `HTTP ${res.status}`;
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}
