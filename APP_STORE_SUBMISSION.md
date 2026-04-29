# Pano15 App Store Submission Log

**Tarih**: 2026-04-26
**Submitted version**: 1.0 (6)
**App ID**: 6763809634
**Bundle ID**: `com.fennaver.pano15`
**Submission status**: ✅ Submitted to App Review (waiting, ETA 24–48h)

---

## 1. Başlangıç durumu (audit bulguları)

App Store Reviewer perspektifinden incelenip tespit edilen blocker'lar:

| Pri | Bulgu | Apple Guideline |
|---|---|---|
| P0 | In-app account deletion yoktu | 5.1.1(v) |
| P0 | Demo hesap admin role + production data | 5.1.1 / Reviewer UX |
| P1 | Program tab'ı "Yakında Geliyor" placeholder | 4.2 Minimum Functionality |
| P1 | Subtitle 41 karakter (limit 30) | App Store Connect schema |
| P1 | App-target `PrivacyInfo.xcprivacy` yoktu | May 1 2024 mandate |
| P1 | Privacy + Destek URL'leri henüz canlı değildi | Required URLs |
| P2 | Info.plist landscape declared, UI portrait-only | UX consistency |
| P2 | `armv7` device capability declared (modern iOS arm64) | Plist hygiene |
| P2 | iPad screenshot zorunluluğu (1,2 device family) | Submission requirement |

---

## 2. Yapılan değişiklikler

### 2.1 Account deletion (Apple 5.1.1(v))

**Backend** — `app/api/v1/auth/me/route.ts`:
- `DELETE` handler eklendi
- Önce `announcements`, `mealMenus`, `classSchedules`, `exams`, `events` tablolarındaki `createdBy` referanslarını NULL yapar (FK blocker önler)
- Sonra `users` satırını siler
- `mock_exam_results.userId` zaten `ON DELETE CASCADE` ile bağlı, otomatik silinir

**Auth context** — `app/lib/auth-context.tsx`:
- `deleteAccount()` fonksiyonu eklendi
- DELETE çağrısı sonrası storage temizler ve unauthenticated state'e geçer

**UI** — `app/screens/ProfileScreen.tsx`:
- "Hesabımı Sil" butonu Profil sayfasının en altında
- Modal dialog açılır: "Bu işlem geri alınamaz" + silinecek veri listesi
- Onay için kullanıcı `SİL` yazmak zorunda
- iPhone Pro Max'te bottom-tab-bar overlap sorunu çözüldü (`items-center` + `max-h-[calc(100dvh-2rem)]` + `overflow-y-auto` + `z-100`)

**Smoke test (local)**:
```
DELETE /api/v1/auth/me → HTTP 200 {ok:true}
GET /api/v1/auth/me (after) → HTTP 404
```

### 2.2 Program tab — gerçek içerik (Apple 4.2)

**Yeni endpoint** — `app/api/v1/schedule/route.ts`:
- Authenticated user'ın sınıfı için tüm haftalık schedule'ı döner
- Class name normalization: admin paneli "12-A" formatında saklayabilir, kullanıcı kayıt "12A" — endpoint OR ile her iki varyantı arar

**UI rewrite** — `app/program/page.tsx`:
- Static placeholder yerine real fetch
- Day-tab navigation (Pzt–Cum), bugün otomatik seçili
- Empty state: "X sınıfı için bu gün ders programı tanımlanmamış" (informative, ne placeholder ne de "Coming Soon")

**Demo data** — `scripts/seed-demo-schedule.ts`:
- 12A sınıfı için 5 gün × 6 ders = 30 satır seed
- Idempotent: aynı (sınıf, gün, ders saati) varsa önce siler
- Demo hesap (12A) açıldığında Apple reviewer dolu Program tab görür

### 2.3 iOS bundle compliance

**`ios/App/App/Info.plist`**:
- `UISupportedInterfaceOrientations`: iPhone'da sadece `UIInterfaceOrientationPortrait` (landscape kaldırıldı)
- `UIRequiredDeviceCapabilities` array kaldırıldı (eskiden `armv7` vardı)
- `CFBundleVersion`: 2 → 6 (her iterasyonda bump)

**Yeni `ios/App/App/PrivacyInfo.xcprivacy`** — App-target privacy manifest:
- `NSPrivacyTracking: false`
- Collected data:
  - `NSPrivacyCollectedDataTypeEmailAddress` — Linked, App Functionality
  - `NSPrivacyCollectedDataTypeName` — Linked, App Functionality
  - `NSPrivacyCollectedDataTypeOtherUserContent` — Linked, App Functionality (deneme sonuçları + hedefler)
  - `NSPrivacyCollectedDataTypeUserID` — Linked, App Functionality + Authentication
- Required-reason API: `NSPrivacyAccessedAPICategoryUserDefaults` (CA92.1 — auth tokens)

**Xcode project ref** — `ios/App/scripts/add_privacy_manifest.rb`:
- PrivacyInfo.xcprivacy dosyası App target'ın resources build phase'ine eklendi (xcodeproj gem ile)
- Bunu yapmadan önce manifest bundle'a dahil edilmiyordu (sadece dosya olarak vardı)

**Device family** — `ios/App/App.xcodeproj/project.pbxproj`:
- `TARGETED_DEVICE_FAMILY = "1,2"` → `"1"` (iPhone-only)
- iPad ekran görüntüsü zorunluluğunu kaldırır

### 2.4 Public web sayfaları

App Store metadata'sındaki `privacy_url` ve `support_url`'lerin canlı olması gerekiyor:

- `app/privacy/page.tsx` — Türkçe gizlilik politikası (toplanan veri tipleri, kullanım, paylaşım, account deletion, contact)
- `app/destek/page.tsx` — Destek/iletişim sayfası (`mailto:eshagh@fennaver.com`)

Production:
- `https://15temmuz.fennaver.tech/privacy` → 200 ✓
- `https://15temmuz.fennaver.tech/destek` → 200 ✓

### 2.5 Fastlane lanes ve metadata

**`ios/App/fastlane/Fastfile`** — yeni `metadata` lane:
- `upload_to_app_store` ile binary'yi atlayıp sadece metadata + screenshot upload
- `skip_binary_upload: true`, `submit_for_review: false`, `overwrite_screenshots: true`

**`ios/App/fastlane/metadata/`**:
- Dizin adı `tr-TR` → `tr` rename (App Store Connect metadata için `tr` ister)
- Tüm Türkçe metadata dolduruldu: name, subtitle (25 chars), description, keywords, promotional_text, release_notes, marketing_url, support_url, privacy_url
- `copyright.txt`, `primary_category.txt` (EDUCATION), `secondary_category.txt` (REFERENCE)
- `review_information/`: demo creds (`reviewer@pano15.test` / `Pano15Reviewer2026!`), reviewer notes (İngilizce), email, phone (`+905349625225`)

**`ios/App/fastlane/screenshots/tr/`** (5 adet, 1320×2868):
- 01_login.png
- 02_dashboard.png
- 03_program.png
- 04_ibadet.png
- 05_profil.png

Capture: iPhone 17 Pro Max simulator + cliclick automation + xcrun simctl io screenshot.

### 2.6 Dedicated demo account

Production API'sinde:
- Email: `reviewer@pano15.test`
- Password: `Pano15Reviewer2026!`
- Role: `student`
- Class: `12A`
- Department: `teknoloji_fen`
- Boarder: false
- 12A için 30 ders satırı seedlendi (Program tab dolu görünür)

---

## 3. App Privacy questionnaire cevapları

### Data collection: **Yes, we collect data**

| Kategori | Alt tip | Linked | Tracking | Purposes |
|---|---|---|---|---|
| Contact Info | Name | ✅ Yes | ❌ No | App Functionality |
| Contact Info | Email Address | ✅ Yes | ❌ No | App Functionality |
| User Content | Other User Content | ✅ Yes | ❌ No | App Functionality |
| Identifiers | User ID | ✅ Yes | ❌ No | App Functionality |

Diğer hiçbir kategori toplanmadı (no Health, Financial, Location, Sensitive, Contacts, Photos, Audio, Browsing/Search History, Device ID, Purchases, Usage Data, Diagnostics, Surroundings, Body, Other).

### App Information

- **Age Rating**: 4+
- **Content Rights**: Yes (third-party content) + I have all necessary rights
- **Pricing**: Free
- **Availability**: All countries (or Turkey-only)
- **Categories**: Education (primary), Reference (secondary)

---

## 4. Build geçmişi (TestFlight)

| Build | İçerik | Durum |
|---|---|---|
| 1.0 (1) | Initial setup (Capacitor + iOS shell) | Processing complete |
| 1.0 (2) | `ITSAppUsesNonExemptEncryption=false` declared | Processing complete |
| 1.0 (3) | Account deletion + Program tab + privacy manifest (project ref yoktu) | Processing complete |
| 1.0 (4) | Dialog overlap fix (items-center + max-h + overflow) | Processing complete |
| 1.0 (5) | PrivacyInfo.xcprivacy bundle'a dahil edildi | Processing complete |
| 1.0 (6) | iPhone-only (TARGETED_DEVICE_FAMILY=1) | ✅ Approved 2026-04-29 |
| 1.0.1 (8) | Footer (login+profil), Selim Ulutaş + 0-commit filtre, Program SS fix, 5 SS yenilendi (9:41 status bar, reviewer hesabı) | **Submitted for Review** |

---

## 5. Git commits

| Hash | Açıklama |
|---|---|
| `c883284` | feat: App Store compliance — account deletion, Program tab, privacy manifest |
| `7eff6ca` | build(ios): bump CFBundleVersion to 3 for App Store compliance build |
| `e839d8a` | build(ios): TestFlight #5 with privacy manifest in bundle, dialog fix, metadata upload |
| `14e6c44` | build(ios): TARGETED_DEVICE_FAMILY=1 (iPhone only) |

---

## 6. Reviewer yardımcı bilgi

**Demo account (App Store Connect → App Review Information):**
- Email: `reviewer@pano15.test`
- Password: `Pano15Reviewer2026!`

**Account deletion test akışı:**
Profil tab → "Hesabımı Sil" → modal → `SİL` yaz → Hesabı Sil → silinir + login ekranına döner

**Production endpoint smoke testleri (canlı):**
```bash
GET  https://15temmuz.fennaver.tech/privacy        → 200
GET  https://15temmuz.fennaver.tech/destek         → 200
GET  https://15temmuz.fennaver.tech/api/v1/schedule (auth)  → 12A: 31 satır
DEL  https://15temmuz.fennaver.tech/api/v1/auth/me (auth)   → 200 {ok:true}
```

---

## 7. Eğer reject olursa

Resolution Center'dan rejection mesajını al, olası senaryolar:

| Reject sebebi | Çözüm |
|---|---|
| Demo account login fail | Manuel test et: `curl -X POST .../login -d '{"email":"reviewer@pano15.test","password":"Pano15Reviewer2026!"}'`. Çalışıyorsa Resolution Center'a "verified working" yaz + screenshot |
| Account deletion not found | Profil tab → en altta. Resolution Center'a screenshot yapıştır + path açıkla |
| Religious content review | App official olarak Bahçelievler 15 Temmuz AİHL utility app olduğunu netleştir, school association göster |
| Privacy URL doesn't match data collected | App Privacy questionnaire'i tekrar gözden geçir, privacy page ile tutarlı olduğunu doğrula |
| Subscription/IAP requirement | Yok, açıklanan tek monetization "Free" — yanlış anlama, Resolution Center'da netleştir |

---

## 8. Sonraki potansiyel iterasyonlar

- **Android (Google Play)**: aynı codebase, `npm run mobile:build` Android'i de günceller. Play Console setup eksik.
- **App Preview videos**: Şu an yok, iyileştirme için 15-30 sn promo video çekilebilir
- **Additional locales**: en-US ekleyip global availability'yi maksimize etmek
- **Crash reporting**: Sentry/Bugsnag eklersen App Privacy questionnaire'i güncellemen gerekir (Diagnostics → Crash Data)
- **Push notifications**: Namaz vakti uyarıları için APNs entegrasyonu

---

**v1.0 (6) submitted at**: 2026-04-26 ~03:15 (Istanbul) — ✅ Approved 2026-04-29
**v1.0.1 (8) submitted at**: 2026-04-29 ~10:15 (Istanbul) — Apple review bekleniyor

---

## 9. v1.0.1 (8) update — 2026-04-29

**Submitted version**: 1.0.1 (8)
**Submission status**: ✅ Submitted to App Review (waiting, ETA 24–48h)

### 9.1 Yapılan değişiklikler

**Footer text** — login + profil sayfalarına eklendi:
> "Fennaver Akademi desteği ile Öğrenciler tarafından geliştirilmiştir."
- "Fennaver Akademi" → `https://fennaver.com` (external, new tab)
- "Öğrenciler" → `/developers` (internal route)
- Dosyalar: `app/screens/LoginScreen.tsx`, `app/screens/ProfileScreen.tsx`

**Geliştirici Ekibi** — `app/developers/page.tsx`:
- Yeni: **Selim Ulutaş** (`Jselim1`, `/developers/selim.jpg`)
- Filtre: 0 commit'li geliştiriciler artık **gizleniyor** (önceden "Henüz commit yok" mesajıyla görünüyordu)
- Sonuç: Ahmet Talha Kuşak (github yok) listede artık yok; geri kalan 5 dev rank/score sırasına göre gösteriliyor
- Ölü "hasCommits" conditional render kodu temizlendi

### 9.2 Screenshots — 5'i de yenilendi

Hepsi 1320×2868, **9:41 Apple marketing status bar** (status_bar override), **reviewer "Test Öğrenci"** hesabı:

| Slot | İçerik | Değişim |
|---|---|---|
| 01_login.png | Login form + yeni footer | Footer eklendi, eski "Geliştirici Ekibi" kart tasarımı kaldırıldı |
| 02_dashboard.png | "Günaydın, Test" + 12A + namaz + dersler | Reviewer hesabıyla |
| 03_program.png | Gerçek Ders Programı (Çar - 6 ders) | **Eski "Yakında Geliyor" placeholder gitti** ⚡ kritik fix |
| 04_ibadet.png | Sonraki Namaz + vakit kartları + Kuran-ı Kerim | Status bar consistency |
| 05_profil.png | Test Öğrenci, Rol: **Öğrenci** (admin değil) | Önceki SS Eshagh/Yönetici idi, yeni reviewer/student |

Workflow:
- iPhone 17 Pro Max simulator (UDID `08634FD3-...`)
- Reviewer manual login (`reviewer@pano15.test`) — keyboard otomasyonu Capacitor WebView üzerinde tutmadı
- Tab navigation cliclick ile (window pos + content scale calculation)
- `xcrun simctl status_bar override --time "9:41" --batteryState charged --wifiBars 3 --cellularBars 4`
- Capture: `xcrun simctl io booted screenshot`

### 9.3 Marketing version bump (1.0 → 1.0.1)

İlk `fastlane release` denemesi şu hatayla reddedildi:
> The version number has been previously used. - /data/attributes/versionString

**Sebep**: v1.0 zaten App Store'da live; ASC editable version oluşturmuyor. Yeni binary için yeni marketing version gerek.

**Çözüm**:
- `agvtool new-marketing-version 1.0.1` (Info.plist literal substitution sorunu yarattı, geri alındı)
- `Info.plist` `CFBundleShortVersionString = $(MARKETING_VERSION)` korundu
- `App.xcodeproj/project.pbxproj` içinde `MARKETING_VERSION = 1.0` → `1.0.1` (sed)
- `CFBundleVersion` fastlane otomatik bumpladı: 7 → 8 (latest_testflight_build_number + 1)

### 9.4 Fastlane akışı

```
fastlane release   →  match + signing + build_app + upload_to_app_store
                      precheck ✅ (no negative sentiment, no broken URLs vb.)
                      Build app: 12s, Upload: 128s
fastlane metadata  →  upload_to_app_store (binary skip)
                      5 eski SS deleted, 5 yeni SS uploaded
                      tr metadata + reviewer info upload
```

`run_precheck_before_submit: false`, `submit_for_review: false` → Submit manuel App Store Connect web UI üzerinden yapıldı.

### 9.5 Bu iterasyonda öğrenilen

- **App Store live versionu varken aynı versionString'e binary yüklenemez** → marketing bump zorunlu
- **agvtool Info.plist'teki $(VAR) referansını literal'e çevirir** → manuel restore + pbxproj edit gerek
- **Capacitor WebView'da macOS HW keyboard girişi tutmuyor** → screenshot otomasyonu için manuel login adımı şart
- **Static export + AppShell**: /developers sayfasındaki bottom tab bar tap'leri navigasyon yapmıyor (router ile geri dönmek için Profil tab'ından Çıkış Yap fonksiyonu gerekti)
