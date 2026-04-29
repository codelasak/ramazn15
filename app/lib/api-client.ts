import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  persistSession,
  type AuthUser,
} from "./auth-storage";
import { isNativePlatform } from "./platform";
import { dbg } from "./debug-log";

/**
 * Pano15 fetch wrapper. Web build'de NEXT_PUBLIC_API_URL bos olabilir;
 * o zaman ayni origin'e relative request gider. Mobil build'de
 * NEXT_PUBLIC_API_URL VPS URL'sini gosterir (orn: https://15temmuz.fennaver.tech).
 *
 * Native (Capacitor) platformda CapacitorHttp plugin'ini direkt kullanir;
 * boylece WebView CORS sorunlari ve iOS App Transport Security
 * kisitlamalari atlanir. Web tarafinda klasik fetch kullanilir.
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

export function friendlyErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "E-posta veya şifre hatalı.";
    if (err.status === 409) return err.message || "Bu e-posta zaten kayıtlı.";
    if (err.status === 0) {
      return "İnternet bağlantınızı kontrol edip tekrar deneyin.";
    }
    if (err.status >= 500 && err.status < 600) {
      return "Sunucuya geçici olarak ulaşılamıyor. Birkaç saniye sonra tekrar deneyin.";
    }
    if (err.status >= 400 && err.status < 500) {
      return err.message || "Geçersiz istek. Lütfen bilgilerinizi kontrol edin.";
    }
    return "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
  }
  if (err instanceof Error) {
    return "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
  }
  return "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
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
    const refreshRes = await (isNativePlatform()
      ? nativeRequest(
          buildUrl("/api/v1/auth/refresh"),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          },
          15000
        )
      : webRequest(
          buildUrl("/api/v1/auth/refresh"),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          },
          15000
        ));
    if (!refreshRes.ok) {
      await clearSession();
      return false;
    }
    const refreshData = refreshRes.data as { accessToken: string; refreshToken: string };
    const meRes = await (isNativePlatform()
      ? nativeRequest(
          buildUrl("/api/v1/auth/me"),
          { headers: { Authorization: `Bearer ${refreshData.accessToken}` } },
          15000
        )
      : webRequest(
          buildUrl("/api/v1/auth/me"),
          { headers: { Authorization: `Bearer ${refreshData.accessToken}` } },
          15000
        ));
    if (!meRes.ok) {
      await clearSession();
      return false;
    }
    const me = meRes.data as { user: AuthUser };
    await persistSession({
      accessToken: refreshData.accessToken,
      refreshToken: refreshData.refreshToken,
      user: me.user,
    });
    return true;
  } catch {
    await clearSession();
    return false;
  }
}

interface NormalizedResponse {
  status: number;
  ok: boolean;
  data: unknown;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        `Istek zaman asimina ugradi (${timeoutMs}ms). Internet baglantisini kontrol edin.`,
        0
      );
    }
    if (err instanceof Error) {
      throw new ApiError(`Ag hatasi: ${err.message}`, 0);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Native (Capacitor) tarafinda CapacitorHttp.enabled=true ile fetch otomatik
// patchlenir; native-bridge.js her fetch cagrisini iOS NSURLSession / Android
// HttpUrlConnection uzerinden gercek bir Response objesine sarip donderir.
// Burada AbortSignal eklemiyoruz cunku patched fetch onu desteklemiyor;
// bunun yerine Promise.race ile timeout uyguluyoruz.
async function nativeRequest(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<NormalizedResponse> {
  dbg("[native]", "start", init.method ?? "GET", url, "timeout=" + timeoutMs);
  const cap = (window as unknown as {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      Plugins?: { CapacitorHttp?: unknown };
    };
  }).Capacitor;
  dbg(
    "[native]",
    "Capacitor=" + (cap ? "yes" : "no"),
    "isNative=" + (cap?.isNativePlatform?.() ?? "n/a"),
    "CapacitorHttp=" + (cap?.Plugins?.CapacitorHttp ? "yes" : "no")
  );
  const fetchPromise = fetch(url, {
    method: init.method,
    headers: init.headers,
    body: init.body,
  })
    .then((r) => {
      dbg("[native]", "fetch resolved", "status=" + r.status, "ok=" + r.ok);
      return r;
    })
    .catch((e) => {
      dbg("[native]", "fetch threw", e instanceof Error ? `${e.name}: ${e.message}` : String(e));
      throw e;
    });
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      dbg("[native]", "INNER timeout fired", timeoutMs + "ms");
      reject(new ApiError(`Native fetch ${timeoutMs}ms icinde yanit vermedi`, 0));
    }, timeoutMs);
  });
  let res: Response;
  try {
    res = await Promise.race([fetchPromise, timeoutPromise]);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error) {
      throw new ApiError(`Ag hatasi: ${err.message}`, 0);
    }
    throw new ApiError("Bilinmeyen ag hatasi", 0);
  } finally {
    if (timer) clearTimeout(timer);
  }
  let data: unknown = null;
  try {
    const contentType = res.headers.get("content-type") || "";
    dbg("[native]", "parsing body, content-type=" + contentType);
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
    }
  } catch (err) {
    dbg("[native]", "body parse error", err instanceof Error ? err.message : String(err));
    data = null;
  }
  dbg("[native]", "done", "status=" + res.status);
  return { status: res.status, ok: res.ok, data };
}

async function webRequest(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<NormalizedResponse> {
  const res = await fetchWithTimeout(url, init, timeoutMs);
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { status: res.status, ok: res.ok, data };
}

// 5xx retries are skipped for endpoints where retry could create duplicate
// state (registration) or where the user already gets fast feedback (login —
// fast 401 beats hanging 8s on a flapping origin).
const NO_RETRY_PATHS = ["/api/v1/auth/register", "/api/v1/auth/login"];

function shouldRetryServerError(path: string, method: string): boolean {
  if (NO_RETRY_PATHS.some((p) => path.startsWith(p))) return false;
  return method === "GET" || method === "PATCH" || method === "DELETE" || method === "PUT";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiRequest(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean; retry?: boolean; timeoutMs?: number } = {}
): Promise<NormalizedResponse> {
  const auth = options.auth ?? true;
  const retry = options.retry ?? true;
  const timeoutMs = options.timeoutMs ?? 15000;
  const method = (init.method ?? "GET").toUpperCase();

  dbg("[apiRequest]", "begin", method, path, "auth=" + auth);

  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    dbg("[apiRequest]", "attaching auth token...");
    await attachAuth(headers);
    dbg("[apiRequest]", "auth attached");
  }

  const url = buildUrl(path);
  dbg("[apiRequest]", "resolved url=" + url, "native=" + isNativePlatform());
  const initWithHeaders = { ...init, headers };

  const doRequest = (): Promise<NormalizedResponse> =>
    isNativePlatform()
      ? nativeRequest(url, initWithHeaders, timeoutMs)
      : webRequest(url, initWithHeaders, timeoutMs);

  let res = await doRequest();
  dbg("[apiRequest]", "response", "status=" + res.status, "ok=" + res.ok);

  // 5xx retry: cloudflared tunnel can flap; one or two retries with backoff
  // is cheap insurance. Cap at 2 retries (1.5s + 4s = 5.5s extra worst case).
  if (
    retry &&
    res.status >= 500 &&
    res.status < 600 &&
    shouldRetryServerError(path, method)
  ) {
    const backoffs = [1500, 4000];
    for (const backoff of backoffs) {
      dbg("[apiRequest]", `5xx retry after ${backoff}ms (status=${res.status})`);
      await delay(backoff);
      res = await doRequest();
      dbg("[apiRequest]", "retry response", "status=" + res.status, "ok=" + res.ok);
      if (res.status < 500) break;
    }
  }

  if (res.status === 401 && retry && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const headers2 = new Headers(init.headers);
      if (init.body && !headers2.has("Content-Type") && !(init.body instanceof FormData)) {
        headers2.set("Content-Type", "application/json");
      }
      await attachAuth(headers2);
      const init2 = { ...init, headers: headers2 };
      res = isNativePlatform()
        ? await nativeRequest(url, init2, timeoutMs)
        : await webRequest(url, init2, timeoutMs);
    }
  }

  return res;
}

// Geriye doonuk uyumluluk: eski apiFetch imzasi
export async function apiFetch(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean; retry?: boolean; timeoutMs?: number } = {}
): Promise<Response> {
  const result = await apiRequest(path, init, options);
  const body = result.data == null ? null : (typeof result.data === "string" ? result.data : JSON.stringify(result.data));
  return new Response(body, {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function apiJson<T = unknown>(
  path: string,
  init: RequestInit = {},
  options?: { auth?: boolean; retry?: boolean; timeoutMs?: number }
): Promise<T> {
  const res = await apiRequest(path, init, options);
  if (!res.ok) {
    const message =
      typeof res.data === "object" && res.data && "error" in res.data
        ? String((res.data as { error: unknown }).error)
        : `HTTP ${res.status}`;
    throw new ApiError(message, res.status, res.data);
  }
  return res.data as T;
}
