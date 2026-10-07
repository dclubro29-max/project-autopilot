#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const checks = [];

function check(name, fn) {
  checks.push({ name, fn });
}

const log = (msg) => console.log(msg);
const success = (name, msg) => {
  console.log(`  \x1b[32m✓\x1b[0m ${name.padEnd(30)} ${msg || 'PASS'}`);
};
const fail = (name, msg) => {
  console.log(`  \x1b[31m✗\x1b[0m ${name.padEnd(30)} ${msg || 'FAIL'}`);
};
const warn = (name, msg) => {
  console.log(`  \x1b[33m⚠\x1b[0m ${name.padEnd(30)} ${msg}`);
};

// Node version
check('Node version', async () => {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  if (major >= 16) {
    success('Node version', `${version}`);
    return true;
  } else {
    fail('Node version', `${version} (needs 16+)`);
    return false;
  }
});

// Dependencies
check('Dependencies', async () => {
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const nodeModulesPath = path.join(rootDir, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      success('Dependencies', 'installed');
      return true;
    } else {
      fail('Dependencies', 'not installed (run npm install)');
      return false;
    }
  } else {
    fail('Dependencies', 'package.json not found');
    return false;
  }
});

// Storage
check('Storage', async () => {
  const storageDir = path.join(rootDir, 'storage');
  if (fs.existsSync(storageDir)) {
    success('Storage', 'ready');
    return true;
  } else {
    warn('Storage', 'directory missing (will be created on first run)');
    return true;
  }
});

// Projects directory
check('Workspace', async () => {
  const projectsDir = path.join(rootDir, 'projects');
  if (fs.existsSync(projectsDir)) {
    success('Workspace', 'ready');
    return true;
  } else {
    warn('Workspace', 'directory missing (will be created on first run)');
    return true;
  }
});

// Environment
check('Environment', async () => {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('your_') || !envContent.includes('API_KEY')) {
      warn('Environment', '.env exists but not configured (add your API key)');
      return true;
    }
    success('Environment', 'configured');
    return true;
  } else {
    warn('Environment', '.env not found (copy from .env.example)');
    return true;
  }
});

// Git
check('Git', async () => {
  try {
    await execAsync('git --version');
    success('Git', 'available');
    return true;
  } catch {
    warn('Git', 'not available (some features may not work)');
    return true;
  }
});

async function runDoctor() {
  console.log('');
  console.log('\x1b[36m PROJECT AUTOPILOT DOCTOR\x1b[0m');
  console.log('');

  let passed = 0;
  let failed = 0;
  let warned = 0;

  for (const c of checks) {
    try {
      const result = await c.fn();
      if (result === false) failed++;
    } catch (err) {
      fail(c.name, err.message);
      failed++;
    }
  }

  console.log('');
  if (failed === 0) {
    console.log('\x1b[32m✓ READY TO LAUNCH\x1b[0m');
  } else {
    console.log(`\x1b[31m✗ ${failed} check(s) failed\x1b[0m`);
    process.exit(1);
  }
  console.log('');
}

runDoctor();
