# CapApp-SPM

This package is used to host SPM dependencies for your Capacitor project

Do not modify the contents of it or there may be unintended consequences.

---

## Pano15 Mobile Notları (commit c412140)

### Capacitor + WKWebView'da yakalanan hatalar ve çözümleri

**1. Login hang bug (kritik)**

`@capacitor/preferences` modülünün `await import("@capacitor/preferences")`
çağrısı bazı iOS WKWebView konfigürasyonlarında **asla resolve etmiyor**.
Bu yüzden `persistSession` sonsuza kadar bekliyor, kullanıcı login sonrası
ana sayfaya geçemeden takılıyor.

**Çözüm:** Dynamic import yerine sync `window.Capacitor.Plugins.Preferences`
lookup. Native build'de plugin zaten `native-bridge.js` yüklenirken inject
ediliyor, async import'a gerek yok. Ek savunma katmanı olarak her prefs
çağrısına 2.5s `withTimeout` + localStorage fallback eklendi.

İlgili dosyalar:
- `app/lib/auth-storage.ts` — `getPreferencesSync()`, `withTimeout`,
  `lsGet/lsSet/lsRemove` fallback
- `app/lib/auth-context.tsx` — `login`/`register`/`logout`/`refreshUser`
  flow'lara debug log

**2. Public API'lerde CORS / origin sorunu**

İbadet (namaz vakitleri, Kuran) ve beslenme (mealdb) sayfaları plain
`fetch("/api/...")` çağırıyordu. Mobil build'de bu `capacitor://localhost`
veya `https://localhost` origin'ine gidip 404 oluyordu.

**Çözüm:** Tüm hooks'lar artık `apiJson` wrapper'ını kullanıyor; wrapper
mobil build'de `NEXT_PUBLIC_API_URL` prefix'i ekliyor ve CapacitorHttp
native bridge üzerinden gönderiyor (CORS-free). Server tarafında
`proxy.ts` matcher'ı tüm public yolları kapsayacak şekilde genişletildi.

İlgili dosyalar:
- `app/shared/usePrayerTimes.ts`
- `app/shared/useQuran.ts`
- `app/shared/useMealDb.ts`
- `proxy.ts` — matcher: `/api/v1/*`, `/api/diyanet/*`, `/api/quran/*`,
  `/api/mealdb/*`, `/api/osm/*`, `/api/contributors`, `/api/kayit`

**3. CapacitorHttp.enabled = true**

`capacitor.config.ts` içinde `CapacitorHttp: { enabled: true }` ayarı
etkin; bu sayede WebView içindeki `fetch()` çağrıları otomatik olarak
iOS NSURLSession / Android HttpUrlConnection üzerinden gidiyor, CORS
preflight hiç yapılmıyor.

### Build & Test

```bash
# Bütün mobile build (web export + cap sync iOS/Android)
npm run mobile:build

# Android
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk

# iOS
cd ios/App && xcodebuild -project App.xcodeproj -scheme App \
  -configuration Debug -sdk iphonesimulator \
  -derivedDataPath build/DD CODE_SIGNING_ALLOWED=NO
xcrun simctl install booted build/DD/Build/Products/Debug-iphonesimulator/App.app
xcrun simctl launch booted com.fennaver.pano15
```

### Debug Overlay

In-app debug paneli (`app/shared/DebugOverlay.tsx`) default kapalı.
Açmak için `.env.mobile.local`:

```
NEXT_PUBLIC_DEBUG_OVERLAY=1
```

Sonra `npm run mobile:build`. Native build'de ekranın altında siyah/yeşil
panel görünür; `dbg("[tag]", ...)` çağrıları orada birikir, Copy butonuyla
clipboard'a kopyalanır.

### Test edilen akışlar

- Login (manuel + dev hızlı giriş)
- Auto-login (cold start, stored user)
- refreshUser (`/api/v1/auth/me`)
- Dashboard (`/api/v1/dashboard`)
- Namaz vakitleri (`/api/diyanet/prayer-times`)
- Kuran sure listesi + sure içeriği (`/api/quran/*`)
- iftar/sahur tarifleri (`/api/mealdb/curated`)
