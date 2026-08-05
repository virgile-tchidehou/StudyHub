// Lanceur dev étudié pour StudyHub (npm workspaces).
// Démarre le backend (node server.js) et le frontend (next dev) en parallèle,
// et forward leurs sorties avec un préfixe coloré. Aucune dépendance externe.
//
// Usage : node scripts/dev-all.mjs   (ou : npm run dev:all)

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const children = [];
const running = new Set();

function start(name, color, cwd, cmd, args, env = {}) {
  const child = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const tag = `[${color}m[${name}][0m `;
  const pipe = (stream) => {
    let buf = '';
    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
      buf += chunk;
      let idx;
      while ((idx = buf.indexOf('\n')) >= 0) {
        process.stdout.write(tag + buf.slice(0, idx) + '\n');
        buf = buf.slice(idx + 1);
      }
    });
    stream.on('end', () => {
      if (buf) process.stdout.write(tag + buf + '\n');
    });
  };
  pipe(child.stdout);
  pipe(child.stderr);

  child.on('exit', (code, signal) => {
    running.delete(child.pid);
    if (code === 0 || signal === 'SIGTERM') {
      // arrêt normal
    } else {
      process.stdout.write(`[31m[${name}] terminé avec le code ${code} (${signal})[0m\n`);
    }
    if (running.size === 0) process.exit(0);
  });

  running.add(child.pid);
  children.push({ name, child });
  return child;
}

// Backend : node server.js (port 8000)
start('backend', '36', resolve(root, 'backend'), 'node', ['server.js']);

// Frontend : next dev -p 3000 -H 0.0.0.0 (variable d'env pour éviter le patch lockfile)
const frontendNext = resolve(root, 'frontend', 'node_modules', '.bin', 'next');
start(
  'frontend',
  '35',
  resolve(root, 'frontend'),
  frontendNext,
  ['dev', '-p', '3000', '-H', '0.0.0.0'],
  { NEXT_IGNORE_INCORRECT_LOCKFILE: '1' }
);

process.stdout.write('StudyHub dev: backend (8000) + frontend (3000) démarrés. Ctrl+C pour arrêter.\n');

function shutdown(signal) {
  process.stdout.write(`\n[33mArrêt (${signal})...[0m\n`);
  for (const { child } of children) {
    try {
      child.kill(signal);
    } catch {
      /* ignore */
    }
  }
  // Si les enfants ne réagissent pas, on force après 5s
  setTimeout(() => process.exit(0), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGTERM'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
