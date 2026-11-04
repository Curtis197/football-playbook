// Runs a TypeScript script from /scripts without adding a runtime dependency:
// bundles it with rolldown (already installed through vite) into a temp file, then imports it.
import { rolldown } from 'rolldown';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

const entry = process.argv[2];
if (!entry) {
  console.error('usage: node scripts/run-ts.mjs <script.ts>');
  process.exit(2);
}

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'football-check-'));
const outFile = path.join(outDir, 'bundle.mjs');
try {
  const bundle = await rolldown({ input: path.resolve(entry), platform: 'node', logLevel: 'silent' });
  await bundle.write({ file: outFile, format: 'esm' });
  await bundle.close();
  await import(pathToFileURL(outFile).href);
} finally {
  fs.rmSync(outDir, { recursive: true, force: true });
}
