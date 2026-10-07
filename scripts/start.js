#!/usr/bin/env node
import { spawn } from 'child_process';
import { platform } from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const log = (msg) => console.log(`\x1b[36m[Autopilot]\x1b[0m ${msg}`);
const success = (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`);
const error = (msg) => console.error(`\x1b[31m✗\x1b[0m ${msg}`);

function startProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
      ...options
    });

    proc.on('error', reject);
    proc.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Process exited with code ${code}`));
      else resolve();
    });
  });
}

async function start() {
  log('Starting Project Autopilot...');

  // Check environment
  if (!fs.existsSync(path.join(rootDir, '.env'))) {
    error('.env file not found');
    log('Run: npm run setup');
    process.exit(1);
  }

  if (!fs.existsSync(path.join(rootDir, 'dist'))) {
    log('Building application...');
    try {
      await startProcess('npm', ['run', 'build']);
    } catch (err) {
      error(`Build failed: ${err.message}`);
      process.exit(1);
    }
  }

  log('Starting development server...');

  const isWindows = platform() === 'win32';
  const devCommand = isWindows ? 'npm.cmd' : 'npm';

  try {
    await startProcess(devCommand, ['run', 'dev']);
  } catch (err) {
    error(`Failed to start: ${err.message}`);
    process.exit(1);
  }
}

start().catch((err) => {
  error(err.message);
  process.exit(1);
});
