# Pano15 Mobile Assets

Bu klasor mobil app icin app icon ve splash screen kaynak dosyalarini barindirir.
`@capacitor/assets` araci buradaki kaynaklari kullanarak iOS ve Android icin tum
boyutlardaki ikonlari otomatik uretir.

## Gerekli Dosyalar

| Dosya | Boyut | Aciklama |
| --- | --- | --- |
| `icon.png` | 1024x1024 | Ana app ikonu (PANO15 logosu, kose yumusatmasiz) |
| `splash.png` | 2732x2732 | Splash screen (logo orta, geni? `#F5F9F5` arka plan) |
| `icon-foreground.png` | 1024x1024 | Android adaptive icon foreground (sadece sembol/yazi) |
| `icon-background.png` | 1024x1024 | Android adaptive icon background (duz renk veya gradient) |
| `splash-dark.png` | 2732x2732 | (Opsiyonel) Karanlik mod splash |

## Logo Yerlestirme

1. PANO15 logosunu (mevcut chat'te paylasilan) `resources/icon.png` olarak kaydet (1024x1024).
2. Ayni logoyu beyaz/krem arka planli kareye yerlestirip `resources/splash.png` olarak kaydet (2732x2732).
3. Android adaptive icon icin:
   - Logoyu safe area icinde tut (merkezde, ~%66 olcekte)
   - Foreground: sadece sembol + yazi (transparent arka plan)
   - Background: duz `#F5F9F5` veya gradient

## Asset Uretimi

Kaynak dosyalar yerlestikten sonra:

```bash
npm run mobile:assets
```

Komut su yerlere yazar:
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- `ios/App/App/Assets.xcassets/Splash.imageset/`
- `android/app/src/main/res/mipmap-*/`
- `android/app/src/main/res/drawable/splash.png`

## Notlar

- iOS App Store ikonu **yarisaydam (alpha) icermemeli** - aksi halde reddedilir.
- Android adaptive icon icin guvenli bolge: 660x660 px (1024'lik bir karenin merkezi).
- Splash screen tum cihazlarda dogru gorunmesi icin `2732x2732` kare kullanilmali.
