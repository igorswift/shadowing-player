# Shadowing Player for Android

The Android app bundles the existing Continuous player and its demo. It uses the Android document picker to remember local videos and their Premiere JSON files without copying the films. Playback position, preferences and favorites are stored on the phone. The RU button uses the supplied translation if available, or downloads an ML Kit translation model on first use. Subsequent translations run locally.

Build from the repository root with JDK 17, Android SDK 35 and Gradle 8.10.2:

```sh
gradle -p android-build assembleDebug
```

Output: `android-build/app/build/outputs/apk/debug/app-debug.apk`.
