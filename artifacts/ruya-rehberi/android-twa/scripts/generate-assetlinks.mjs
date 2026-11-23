#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageName = 'com.huzuryolculugu.ruyarehberi';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultOutputPath = path.resolve(scriptDirectory, '../../public/.well-known/assetlinks.json');
const args = process.argv.slice(2);
const outputArg = args.find((value) => value.startsWith('--output='));
const outputPath = outputArg
  ? path.resolve(outputArg.slice('--output='.length))
  : defaultOutputPath;
const fingerprints = args
  .filter((value) => !value.startsWith('--output='))
  .map((value) => value.trim().toUpperCase());

if (fingerprints.length === 0 || fingerprints.some((value) => !/^(?:[A-F0-9]{2}:){31}[A-F0-9]{2}$/.test(value))) {
  console.error('Usage: node scripts/generate-assetlinks.mjs <SHA-256 fingerprint> [<SHA-256 fingerprint> ...] [--output=<path>]');
  console.error('Use the Play App Signing certificate fingerprint, not a private key or password.');
  process.exit(1);
}

const assetLinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: packageName,
      sha256_cert_fingerprints: [...new Set(fingerprints)],
    },
  },
];

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(assetLinks, null, 2)}\n`, 'utf8');
console.log(`Wrote ${path.relative(path.resolve(scriptDirectory, '..'), outputPath)} for ${packageName}.`);
