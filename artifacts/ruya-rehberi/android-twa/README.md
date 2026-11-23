# Manevi Rüya Rehberi — Android TWA

Unsigned Android project generated with Google's Bubblewrap CLI 1.27.0.

| Setting | Value |
| --- | --- |
| PWA origin | `https://manevi-ruya-rehberi.replit.app` |
| Web manifest | `https://manevi-ruya-rehberi.replit.app/manifest.json` |
| Android package | `com.huzuryolculugu.ruyarehberi` |
| App name | `Manevi Rüya Rehberi` |

Do not use `https://replit.app`; it is not the app's published origin.

## GitHub Actions build and signing

`.github/workflows/build-aab.yml` builds a signed release bundle on every push and can also be started manually from the GitHub Actions tab. It uploads `app-release-bundle.aab` and `upload-key-sha256.txt` as a downloadable artifact for 14 days.

The workflow signs with a stable upload keystore stored in GitHub Actions Secrets. It deliberately does **not** generate a new key on every push: Google Play updates must continue using the same upload key, and a private key must never be uploaded as a workflow artifact.

Generate an upload key once on a trusted machine with `keytool` (it prompts for passwords; do not put passwords directly in a command):

```sh
keytool -genkeypair -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Add these four values under the GitHub repository's **Settings → Secrets and variables → Actions → New repository secret**:

- `ANDROID_KEYSTORE_BASE64`: base64-encoded upload keystore (`base64 < upload-keystore.jks | tr -d '\n'`)
- `ANDROID_KEYSTORE_PASSWORD`: keystore password
- `ANDROID_KEY_ALIAS`: key alias (for the command above, `upload`)
- `ANDROID_KEY_PASSWORD`: key password

Do not commit the keystore or share the passwords in chat. The workflow installs JDK 17 and Android SDK 36, signs the AAB on the ephemeral GitHub runner, then exposes only the AAB and public upload-certificate fingerprint as downloadable artifacts. It fails with a clear message if a required secret is missing.

## Full-screen TWA verification

The fingerprint artifact is for the **upload key**. With Play App Signing enabled, Chrome full-screen verification needs the different **App signing key certificate SHA-256 fingerprint from Play Console**, not the upload-key fingerprint. The PWA is served at the verified origin above; Chrome will show browser UI until Digital Asset Links is published with the Play signing fingerprint:

```sh
node scripts/generate-assetlinks.mjs "AA:BB:CC:...:FF"
```

The script writes `../public/.well-known/assetlinks.json`; rebuild and publish the web app afterward. Confirm the published `/.well-known/assetlinks.json` returns JSON before testing the signed Android app. Do not use an invented or placeholder fingerprint.

This workspace does not compile Android apps locally; the GitHub Actions runner supplies the Android toolchain.
