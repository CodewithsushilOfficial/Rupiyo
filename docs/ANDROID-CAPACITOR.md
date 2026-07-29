# Android Capacitor Integration

## Application Package Identifier
- **Package ID**: `com.rupiyo.app`
- **App Name**: `Rupiyo`

## Capacitor Configuration (`capacitor.config.json`)
- Plugins configured: `@capacitor/camera`
- Web dir: `out`

## Android Manifest (`android/app/src/main/AndroidManifest.xml`)
- Declares camera permissions: `android.permission.CAMERA`
- Declares file storage permissions: `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `READ_MEDIA_IMAGES`
- Declares intent filters for Android Share Target receiving:
  - `ACTION_SEND` for `image/*`
  - `ACTION_SEND` for `application/pdf`
  - `ACTION_SEND` for `text/plain`
