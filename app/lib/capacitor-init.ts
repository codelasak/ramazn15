"use client";

import { isNativePlatform } from "./platform";

/**
 * Pano15 Capacitor app-startup hooks.
 *
 * Sadece native (iOS/Android) build'de calisir. Web tarayicida hicbir sey yapmaz.
 *
 * Sorumluluklari:
 *  - SplashScreen'i (auto-hide olsa bile) explicit olarak kapatmak
 *  - StatusBar style + arkaplan renginin set edilmesi
 *  - Android donanimsal back tusu icin makul bir davranis (root sayfada cikis)
 */

let initialized = false;

export async function initCapacitor(): Promise<void> {
  if (initialized) return;
  if (!isNativePlatform()) return;
  initialized = true;

  // Splash'i kapat
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 200 });
  } catch (err) {
    console.warn("[capacitor-init] splash hide failed", err);
  }

  // Status bar
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: "#F5F9F5" });
  } catch (err) {
    console.warn("[capacitor-init] status bar setup failed", err);
  }

  // Android donanimsal back tusu: kok sayfada uygulamadan cikis,
  // diger sayfalarda tarayici geri davranisi.
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (err) {
    console.warn("[capacitor-init] back button listener failed", err);
  }
}
