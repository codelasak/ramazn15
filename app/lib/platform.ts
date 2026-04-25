/**
 * Pano15 platform detection helpers.
 *
 * Capacitor native (iOS/Android) ile tarayici (web) arasinda runtime'da
 * davranis ayrismasi gerektiginde kullanilir.
 */

export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  // Capacitor native build'de window.Capacitor.isNativePlatform() true doner.
  // Web build'de Capacitor objesi var olsa da false dondurur.
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export function isWebPlatform(): boolean {
  return !isNativePlatform();
}
