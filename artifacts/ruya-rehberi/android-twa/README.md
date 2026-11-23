# Manevi Rüya Rehberi — Android TWA

Unsigned Android project generated with Google's Bubblewrap CLI 1.27.0.

| Setting | Value |
| --- | --- |
| PWA origin | `https://manevi-ruya-rehberi.replit.app` |
| Web manifest | `https://manevi-ruya-rehberi.replit.app/manifest.json` |
| Android package | `com.huzuryolculugu.ruyarehberi` |
| App name | `Manevi Rüya Rehberi` |

Do not use `https://replit.app`; it is not the app's published origin.

## Signing and building

This workspace contains **no keystore and no signed AAB**. Keep the upload keystore and its passwords on a trusted machine or in your private backup; never commit them or put them in a public download route. Losing the upload key can complicate future releases, and exposing it can let someone sign app updates.

Use Google's Play App Signing. Generate an upload key locally with `keytool` (it prompts for passwords; do not put passwords directly in a command):

```sh
keytool -genkeypair -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Install Bubblewrap and build from this directory with JDK 17 and the Android SDK available:

```sh
pnpm dlx @bubblewrap/cli@1.27.0 build \
  --manifest=./twa-manifest.json \
  --signingKeyPath=/secure/path/upload-keystore.jks \
  --signingKeyAlias=upload
```

Bubblewrap prompts for the keystore and key passwords. The signed bundle is written as `app-release-bundle.aab`. `--skipSigning` can make an unsigned test bundle, but that bundle is **not uploadable to Google Play**.

## Full-screen TWA verification

The PWA is served at the verified origin above. Chrome will show browser UI until Digital Asset Links is published and matches the app's signing certificate. With Play App Signing enabled, use the **App signing key certificate SHA-256 fingerprint from Play Console**, not the upload-key fingerprint:

```sh
node scripts/generate-assetlinks.mjs "AA:BB:CC:...:FF"
```

The script writes `../public/.well-known/assetlinks.json`; rebuild and publish the web app afterward. Confirm the published `/.well-known/assetlinks.json` returns JSON before testing the signed Android app. Do not use an invented or placeholder fingerprint.

This workspace currently has no Android SDK or compatible JDK 17 installed, so the project is scaffolded but not compiled here.
