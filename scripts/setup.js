#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const log = (msg) => console.log(`\x1b[36m[Setup]\x1b[0m ${msg}`);
const success = (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`);
const error = (msg) => console.error(`\x1b[31m✗\x1b[0m ${msg}`);
const warn = (msg) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`);

async function setup() {
  try {
    log('Project Autopilot Setup');
    log('='.repeat(50));

    // Check if .env exists
    const envPath = path.join(rootDir, '.env');
    if (!fs.existsSync(envPath)) {
      log('Creating .env from .env.example...');
      const examplePath = path.join(rootDir, '.env.example');
      if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        success('.env created. Please update with your API key.');
      } else {
        error('.env.example not found');
      }
    } else {
      success('.env already exists');
    }

    // Create projects directory
    const projectsDir = path.join(rootDir, 'projects');
    if (!fs.existsSync(projectsDir)) {
      log('Creating projects directory...');
      fs.mkdirSync(projectsDir, { recursive: true });
      success('Projects directory created');
    } else {
      success('Projects directory exists');
    }

    // Create logs directory
    const logsDir = path.join(rootDir, 'logs');
    if (!fs.existsSync(logsDir)) {
      log('Creating logs directory...');
      fs.mkdirSync(logsDir, { recursive: true });
      success('Logs directory created');
    }

    // Create storage directory
    const storageDir = path.join(rootDir, 'storage');
    if (!fs.existsSync(storageDir)) {
      log('Creating storage directory...');
      fs.mkdirSync(storageDir, { recursive: true });
      success('Storage directory created');
    }

    log('Running npm install...');
    await execAsync('npm install', { cwd: rootDir });
    success('Dependencies installed');

    log('Building application...');
    await execAsync('npm run build', { cwd: rootDir });
    success('Application built');

    log('='.repeat(50));
    success('Setup complete!');
    log('Next steps:');
    log('  1. Edit .env with your AI provider settings');
    log('  2. Run: npm run autopilot');
    log('');
  } catch (err) {
    error(`Setup failed: ${err.message}`);
    process.exit(1);
  }
}

setup();
