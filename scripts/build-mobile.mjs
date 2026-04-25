#!/usr/bin/env node
/**
 * Pano15 mobile build script.
 *
 * Static export ile uyumsuz olan server-only klasorleri (API routes,
 * admin paneli) build sirasinda gecici olarak yan tarafa tasir, build
 * bitince geri tasir. Boylece tek monorepo iki hedefe uretim yapabilir.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const STAGING = join(ROOT, '.mobile-staging');

// .env.mobile.local > .env.mobile (her ikisi de opsiyonel)
function loadMobileEnv() {
  const candidates = ['.env.mobile.local', '.env.mobile'];
  for (const rel of candidates) {
    const file = join(ROOT, rel);
    if (!existsSync(file)) continue;
    const content = readFileSync(file, 'utf8');
    let count = 0;
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      // Var olan process.env ezilmesin (CI override icin)
      if (process.env[key] !== undefined) continue;
      process.env[key] = value;
      count++;
    }
    if (count > 0) {
      console.log(`[mobile-build] env :: ${rel} icinden ${count} degisken yuklendi`);
    }
    return rel;
  }
  return null;
}

// Static export sirasinda devre disi birakilacak klasorler.
// /giris ve /kayit artik JWT useAuth ile calisiyor; mobil build'e dahil.
const DISABLE = [
  'app/api',
  'app/admin',
];

function log(step, msg) {
  console.log(`\n[mobile-build] ${step} :: ${msg}`);
}

function moveAside() {
  if (existsSync(STAGING)) rmSync(STAGING, { recursive: true, force: true });
  mkdirSync(STAGING, { recursive: true });

  for (const rel of DISABLE) {
    const src = join(ROOT, rel);
    if (!existsSync(src)) continue;
    const dest = join(STAGING, rel);
    mkdirSync(join(STAGING, rel.split('/').slice(0, -1).join('/')), { recursive: true });
    renameSync(src, dest);
    log('isolate', `${rel} -> .mobile-staging/${rel}`);
  }
}

function restore() {
  if (!existsSync(STAGING)) return;
  for (const rel of DISABLE) {
    const src = join(STAGING, rel);
    const dest = join(ROOT, rel);
    if (!existsSync(src)) continue;
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    renameSync(src, dest);
    log('restore', `.mobile-staging/${rel} -> ${rel}`);
  }
  rmSync(STAGING, { recursive: true, force: true });
}

function runBuild() {
  log('build', 'next build (BUILD_TARGET=mobile, output=export)');
  const result = spawnSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    cwd: ROOT,
    env: { ...process.env, BUILD_TARGET: 'mobile' },
  });
  if (result.status !== 0) {
    throw new Error(`next build failed with code ${result.status}`);
  }
}

function runCapSync() {
  log('cap', 'npx cap sync');
  const result = spawnSync('npx', ['cap', 'sync'], {
    stdio: 'inherit',
    cwd: ROOT,
  });
  if (result.status !== 0) {
    log('cap', 'cap sync atlandi (henuz iOS/Android eklenmedi olabilir)');
  }
}

function ensurePlaceholderIndex() {
  // Placeholder yalnizca cap init / cap add icin gerekli.
  const out = join(ROOT, 'out');
  if (!existsSync(out)) mkdirSync(out, { recursive: true });
  const indexFile = join(out, 'index.html');
  if (!existsSync(indexFile)) {
    writeFileSync(
      indexFile,
      '<!DOCTYPE html><html><head><title>Pano15</title></head><body>Pano15 mobile placeholder</body></html>'
    );
  }
}

async function main() {
  const cmd = process.argv[2] ?? 'build';

  if (cmd === 'placeholder') {
    ensurePlaceholderIndex();
    log('done', 'out/ placeholder hazirlandi');
    return;
  }

  loadMobileEnv();
  if (!process.env.NEXT_PUBLIC_API_URL) {
    log(
      'warn',
      'NEXT_PUBLIC_API_URL tanimsiz. Mobil app relative URL kullanir ve VPS\'e ulasmaz.\n' +
        '          .env.mobile.local olustur veya: NEXT_PUBLIC_API_URL=... npm run mobile:build'
    );
  } else {
    log('env', `NEXT_PUBLIC_API_URL = ${process.env.NEXT_PUBLIC_API_URL}`);
  }

  let isolated = false;
  try {
    moveAside();
    isolated = true;
    runBuild();
  } finally {
    if (isolated) restore();
  }
  runCapSync();
  log('done', 'mobile build tamamlandi');
}

main().catch((err) => {
  console.error('[mobile-build] failed:', err);
  process.exitCode = 1;
});
