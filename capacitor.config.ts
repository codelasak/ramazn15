import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fennaver.pano15',
  appName: 'Pano15',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    // CapacitorHttp: WebView fetch/XHR cagrilarini native HTTP'ye yonlendirir.
    // CORS preflight ve cross-origin sorunlarini bypass eder; mobil app'in
    // VPS API'sine direkt erisebilmesi icin gerekli.
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F5F9F5',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#F5F9F5',
    },
  },
};

export default config;
