# Pano15 Google Play Store Submission Log

**Tarih**: 2026-04-26
**Submitted version**: 1.0 (versionCode 1)
**App ID (Play Console)**: 4972639981574162584
**Package**: `com.fennaver.pano15`
**Developer**: Fennaver Technology
**Submission status**: ✅ Internal testing track (draft yayınlanmaya hazır)

---

## 1. Ön durum (audit)

iOS submission tamamlandıktan sonra Android tarafı için tespit:

| Eksik | Çözüm |
|---|---|
| Release keystore yoktu | Generate edildi |
| Gradle release signing config | `keystore.properties` ile loaded |
| JDK 21 yoktu (Capacitor 8.x ister) | Homebrew ile install |
| Google Play Publisher service account | Console + GCP setup |
| Fastlane Android lane'leri | Fastfile yazıldı |
| Mağaza metadata | `metadata/android/tr-TR/` |
| Feature graphic + 512px icon | Generate edildi |
| Phone screenshots | iOS'tan paylaşıldı (1320×2868) |
| `/hesap-sil` web sayfası | Data Safety formu için yazıldı |

---

## 2. Yapılan değişiklikler

### 2.1 Release signing

**Keystore generate** (`secrets/pano15-release.jks`):
```bash
keytool -genkey -v -keystore secrets/pano15-release.jks \
  -alias pano15 -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Pano15, OU=Mobile, O=Fennaver Technology, L=Istanbul, ST=Istanbul, C=TR"
```
- SHA1: `A1:DA:8D:4D:17:AE:39:75:E8:5F:9F:8D:BA:3D:0A:45:9D:74:53:D8`
- Validity: 2053'e kadar
- Alias: `pano15`

**Secrets** (`secrets/.env.fastlane.local`, gitignored):
```
PANO15_ANDROID_KEYSTORE_PATH=/Users/eshagh/web_code/ramazn15/secrets/pano15-release.jks
PANO15_ANDROID_KEYSTORE_PASSWORD=l6QhCGtPNFLQ6nAtcWBDozfC
PANO15_ANDROID_KEY_ALIAS=pano15
PANO15_ANDROID_KEY_PASSWORD=l6QhCGtPNFLQ6nAtcWBDozfC
PANO15_PLAY_PUBLISHER_JSON=/Users/eshagh/web_code/ramazn15/secrets/play-publisher.json
PANO15_PLAY_PACKAGE_NAME=com.fennaver.pano15
```

**Gradle config** (`android/app/build.gradle`):
- `keystore.properties` dosyasını okur (gitignored)
- `signingConfigs.release` dynamic
- `buildTypes.release.signingConfig` keystore varsa atanır

**`android/keystore.properties`** (gitignored):
```
storeFile=/Users/eshagh/web_code/ramazn15/secrets/pano15-release.jks
storePassword=l6QhCGtPNFLQ6nAtcWBDozfC
keyAlias=pano15
keyPassword=l6QhCGtPNFLQ6nAtcWBDozfC
```

### 2.2 Service account (Google Play Developer API)

**Google Cloud Console**:
- Project: `mahalsturcture` (mevcut)
- Google Play Android Developer API enabled
- Service account: `pano15-fastlane@mahalsturcture.iam.gserviceaccount.com`
- JSON key indirilip `secrets/play-publisher.json`'a taşındı

**Google Play Console > Kullanıcılar ve izinler**:
- Service account email davet edildi
- App permissions: Pano15
- Account permissions:
  - Release apps to production, exclude devices, and use Play App Signing
  - Manage testing tracks and edit tester lists
  - Manage store presence

### 2.3 JDK 21 + signed AAB build

**JDK 21 install**:
```bash
brew install openjdk@21
# /opt/homebrew/opt/openjdk@21
```
(Capacitor 8.x `compileReleaseJavaWithJavac` JDK 21 source release zorunlu)

**AAB build**:
```bash
JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./gradlew bundleRelease
```
- Output: `android/app/build/outputs/bundle/release/app-release.aab`
- Boyut: ~35 MB
- Signing: ✅ verified (jarsigner)

### 2.4 Fastlane Android

**`android/Gemfile`**:
```ruby
source "https://rubygems.org"
gem "fastlane"
```

**`android/fastlane/Appfile`**:
```ruby
json_key_file(ENV["PANO15_PLAY_PUBLISHER_JSON"] || "../secrets/play-publisher.json")
package_name(ENV["PANO15_PLAY_PACKAGE_NAME"] || "com.fennaver.pano15")
```

**`android/fastlane/Fastfile`** lane'leri:
| Lane | Açıklama |
|---|---|
| `build_aab` | Sadece signed AAB build (clean + bundleRelease) |
| `internal` | build_aab + Internal track upload (draft) |
| `upload_internal` | Mevcut AAB'yi internal'a upload (build atla) |
| `production` | build_aab + Production track upload (draft) |
| `metadata` | Sadece metadata + screenshot upload (binary atlanır, internal track) |

JDK 21 path Fastfile içinde sabit:
```ruby
JDK21 = "/opt/homebrew/opt/openjdk@21"
gradle(task: "...", properties: { "org.gradle.java.home" => JDK21 })
```

### 2.5 Mağaza metadata

**`android/fastlane/metadata/android/tr-TR/`**:
- `title.txt` — "Pano15 — Okulun Cebinde" (26 chars, limit 30)
- `short_description.txt` — "Namaz vakitleri, ders takibi, deneme analizi ve Kuran-ı Kerim uygulaması." (76 chars, limit 80)
- `full_description.txt` — Kapsamlı açıklama (1112 chars, limit 4000)
- `video.txt` — boş
- `changelogs/1.txt` — "Pano15'in ilk sürümü. Hata bildirimleri ve önerileriniz için: eshagh@fennaver.com"

### 2.6 Asset'ler

**Feature graphic** — `images/featureGraphic.png` (1024×500):
- Sol: PANO15 logosu (320×320)
- Sağ: "Pano15" başlık (kırmızı), "Okulun Cebinde" subtitle, "Namaz · Ders · Kuran-ı Kerim" + "15 Temmuz Şehitleri AİHL"
- Background: krem (#F5F9F5) + dekoratif kırmızı blur
- Generate: `Pillow` ile Python script, `resources/icon.png`'i scale + composite

**Store icon** — `images/icon.png` (512×512):
- `resources/icon.png` (1024×1024) → `sips -z 512 512`

**Phone screenshots** — `images/phoneScreenshots/` (5 adet, 1320×2868):
1. `01_login.png` — Giriş ekranı
2. `02_dashboard.png` — Ana sayfa (namaz timer + dersler)
3. `03_program.png` — Ders programı
4. `04_ibadet.png` — Namaz vakitleri + Kuran
5. `05_profil.png` — Profil bilgileri

iOS App Store Connect'e yüklenenlerin aynısı (Capacitor cross-platform aynı UI).

### 2.7 `/hesap-sil` web sayfası

**`app/hesap-sil/page.tsx`** — Google Play Data Safety formu zorunlu kıldı:

İçerik:
- Yöntem 1: In-app silme adımları (Profil → Hesabımı Sil → "SİL" yaz → onayla)
- Yöntem 2: E-posta talep akışı (`mailto:eshagh@fennaver.com`)
- Hangi veriler silinir (full list: profil, deneme sonuçları, hedefler, vs.)
- Hangi veriler kısa süre saklanır (5651 sayılı Kanun logs, DB backups, 30 gün)
- Verinin seçici silinmesi (mümkün değil, hesabı sil)

Production: `https://15temmuz.fennaver.tech/hesap-sil` → 200 ✓

---

## 3. Upload sonuçları

### Internal testing AAB upload
```
fastlane upload_internal
[13:56:33]: Preparing aab at path '/Users/eshagh/web_code/ramazn15/android/app/build/outputs/bundle/release/app-release.aab'
[13:56:55]: Updating track 'internal'...
[13:56:57]: Successfully finished the upload to Google Play
upload_to_play_store: 25s
```

Status: Internal track, **versionCode 1**, release_status: **draft**

### Mağaza metadata + asset upload
```
fastlane metadata
[13:59:13]: ⬆️ Uploading image file featureGraphic.png
[13:59:18]: ⬆️ Uploading image file icon.png
[13:59:22-50]: ⬆️ Uploading 5 phoneScreenshots (login, dashboard, program, ibadet, profil)
[13:59:56]: Updating changelog for '1' and language 'tr-TR'
[13:59:58]: Successfully finished the upload to Google Play
upload_to_play_store: 46s
```

---

## 4. Play Console form'ları (manuel — App content)

Tamamlanan form'lar:

### 4.1 Privacy policy
- URL: `https://15temmuz.fennaver.tech/privacy`

### 4.2 App access
- All or some functionality is restricted (login required)
- Test creds:
  - Username: `reviewer@pano15.test`
  - Password: `Pano15Reviewer2026!`
  - Notes: Login required to access dashboard, schedule, mock-exam tracker, profile

### 4.3 Ads
- **No, my app does not contain ads**

### 4.4 Content rating
**Tüm sorulara HAYIR** → Sonuç: **Everyone (3+)**

| Soru | Cevap |
|---|---|
| İndirilen uygulama içeriğinde derecelendirme alakalı şey | Hayır |
| Kullanıcı içeriği paylaşımı (mesajlaşma vs.) | Hayır |
| Online içerik (Netflix tarzı) | Hayır |
| Yaş kısıtlamasına tabi ürünler/etkinlikler | Hayır |
| Konum paylaşımı diğer kullanıcılarla | Hayır |
| Dijital ürün satışı | Hayır |
| Para/kripto/NFT ödülleri | Hayır |
| Web tarayıcısı/arama motoru | Hayır |
| Esas olarak haber veya eğitim ürünü | Hayır (utility, formal eğitim değil) |

### 4.5 Target audience and content
- Hedef yaş grupları: **13–15** ve üstü
- Çocuklara cazip değil
- Mature/sensitive content yok

### 4.6 News app
- Hayır (utility app)

### 4.7 Government apps
- Hayır

### 4.8 Financial features
- Hayır

### 4.9 Health
- Hayır

### 4.10 Data safety

**Genel:**
- Veri topluyor mu? **Evet**
- Aktarım sırasında şifreli? **Evet** (HTTPS)
- Hesap oluşturma yöntemi: **Kullanıcı adı ve şifre**
- Hesap silme URL: `https://15temmuz.fennaver.tech/hesap-sil`
- Hesap silmeden veri silme: **Hayır**

**Toplanan veri tipleri:**

| Kategori | Toplandı | Paylaşıldı | Required | Purposes |
|---|---|---|---|---|
| Personal info → Name | ✅ | ❌ | Required | App functionality, Account management |
| Personal info → Email Address | ✅ | ❌ | Required | App functionality, Account management |
| App activity → Other user-generated content | ✅ | ❌ | Required | App functionality, Account management |

**Toplanmayan kategoriler** (hepsi ❌):
- Location (Approximate, Precise) — kullanıcı manuel ilçe seçer, GPS yok
- Personal info → Phone, Address, Race, Beliefs, etc.
- Financial info
- Health & Fitness
- Messages
- Photos and videos
- Audio files
- Files and docs
- Calendar
- Contacts
- Web browsing
- App info and performance (no crash/analytics SDK)
- Device or other IDs (no IDFA/AAID)

---

## 5. Bekleyen adımlar

### 5.1 Internal testing → publish + tester
1. Play Console → Test edin ve yayınlayın → Test → Dahili test
2. Sürümler sekmesi → Sürümü gözden geçir ve hazırla → **Sürümü dahili teste başlat**
3. Test kullanıcıları sekmesi → E-posta listesi oluştur (`fennaverteam@gmail.com`, `eshagh@fennaver.com`)
4. Bağlantıyı kopyala → Android telefonda Chrome'da aç → Become a tester → Download on Google Play

### 5.2 Production submit
Internal'da test edip onaylandıktan sonra:
- Test edin ve yayınlayın → Yayın → Üretim → **Yeni sürüm**
- Internal track'ten promote (aynı AAB'yi tekrar build/upload etmeden)
- Yayın notları
- **Sürümü incele ve üretime sun** → review submit

Google ortalama 24-48 saat inceler, ilk yayında bazen 7 güne kadar sürebilir.

---

## 6. Git commits

| Hash | Açıklama |
|---|---|
| `bd764df` | feat(android): Google Play release pipeline + first AAB upload |
| `67a4722` | feat(web): /hesap-sil page for Google Play Data Safety requirement |

---

## 7. Reject olursa

| Olası sebep | Çözüm |
|---|---|
| **Account access not provided** | Reviewer creds zaten verildi (App access form'da). Resolution Center'a tekrar gönder |
| **Privacy policy mismatches data** | Data Safety form'u ve `/privacy` sayfasını gözden geçir, tutarlı olduğunu doğrula |
| **Religious content review** | Pano15 official olarak Bahçelievler 15 Temmuz AİHL utility app olduğunu açıkla |
| **Misleading category** | Education kategorisi (utility kategorisi olarak Education / Tools) |
| **Demo account broken** | Test et: `curl -X POST .../login -d '...'`. Çalışıyorsa screenshot + Resolution Center |
| **Target audience violation** | 13+ olarak ayarlandı, lise yaş aralığı için doğru |

---

## 8. Yapılandırma artefaktları

### Tracked dosyalar (git'e dahil)
```
android/Gemfile
android/Gemfile.lock
android/app/build.gradle (signing config eklendi)
android/fastlane/Appfile
android/fastlane/Fastfile
android/fastlane/metadata/android/tr-TR/title.txt
android/fastlane/metadata/android/tr-TR/short_description.txt
android/fastlane/metadata/android/tr-TR/full_description.txt
android/fastlane/metadata/android/tr-TR/video.txt
android/fastlane/metadata/android/tr-TR/changelogs/1.txt
android/fastlane/metadata/android/tr-TR/images/featureGraphic.png
android/fastlane/metadata/android/tr-TR/images/icon.png
android/fastlane/metadata/android/tr-TR/images/phoneScreenshots/*.png
app/hesap-sil/page.tsx
.gitignore (android/keystore.properties eklendi)
```

### Untracked / gitignored
```
secrets/pano15-release.jks
secrets/play-publisher.json
secrets/.env.fastlane.local
android/keystore.properties
android/app/build/
```

---

## 9. Sonraki potansiyel iterasyonlar

- **Hata izleme**: Sentry/Crashlytics → Data Safety form güncellenmesi gerekir
- **Push notifications**: Namaz vakti için FCM (`@capacitor-firebase/messaging`)
- **Tablet UI**: Şu an phone-optimized; tablet layout responsive iyileştirme
- **Open testing → Production**: Internal'dan open testing'e promote, beta tester collection
- **Closed testing**: Email-restricted feedback grubu (testFlight benzeri)
- **In-app updates**: Play Core In-App Updates API
- **Bundle splitting**: AAB density/language splits için `bundleConfig` (şu an app boyutu 35MB → 15MB'a inebilir)

---

## 10. Hızlı komut referansı

```bash
# Mobile bundle sync (web build → android/app/src/main/assets)
npm run mobile:build

# Signed AAB build
cd android && JAVA_HOME=/opt/homebrew/opt/openjdk@21 ./gradlew bundleRelease

# Fastlane lanes (cd android)
PATH="/opt/homebrew/opt/ruby/bin:$PATH" bundle exec fastlane build_aab        # build only
PATH="/opt/homebrew/opt/ruby/bin:$PATH" bundle exec fastlane internal         # build + upload internal
PATH="/opt/homebrew/opt/ruby/bin:$PATH" bundle exec fastlane upload_internal  # upload only (skip build)
PATH="/opt/homebrew/opt/ruby/bin:$PATH" bundle exec fastlane metadata         # metadata + assets only
PATH="/opt/homebrew/opt/ruby/bin:$PATH" bundle exec fastlane production       # build + upload production

# AAB lokasyonu
ls -la android/app/build/outputs/bundle/release/app-release.aab

# Keystore SHA1 doğrulama
keytool -list -v -keystore secrets/pano15-release.jks -alias pano15 \
  -storepass l6QhCGtPNFLQ6nAtcWBDozfC
```

---

**Bu döngü sonu**: Internal track'ta versionCode=1 draft hazır, Console'daki form'lar tamam. Tester eklenip test sonrası production submit.
