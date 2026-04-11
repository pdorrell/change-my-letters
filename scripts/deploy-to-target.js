#!/usr/bin/env node

/**
 * Script to copy files from dist to deploy directory
 * - Preserves deploy/.git directory
 * - Preserves deploy/assets directory
 * - Removes files in deploy root and deploy/data
 * - Copies all files from dist to deploy
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const rootDir = path.join(__dirname, '..');
const distPath = path.join(rootDir, 'dist');
const deployPath = path.join(rootDir, 'deploy');
const deployDataPath = path.join(deployPath, 'data');

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: dist directory does not exist. Run the build first.');
  process.exit(1);
}

// Check if deploy directory exists
if (!fs.existsSync(deployPath)) {
  console.error('❌ Error: deploy directory does not exist.');
  console.error('   You need to checkout the corresponding deployment git project into that directory.');
  process.exit(1);
}

console.log('🔄 Starting deployment process...');

// Step 1: Remove files in deploy root (preserving directories)
console.log('🗑️ Removing files in deploy root directory...');
try {
  const deployContents = fs.readdirSync(deployPath);
  for (const item of deployContents) {
    const itemPath = path.join(deployPath, item);
    const isDirectory = fs.statSync(itemPath).isDirectory();

    // Skip .git directory
    if (isDirectory && item === '.git') {
      console.log(`  ⏩ Preserving ${item}/ directory`);
      continue;
    }

    // Remove file or directory
    if (isDirectory) {
      if (item === 'data' || item === 'assets') {
        // For assets, only remove assets/app (preserve assets/words)
        if (item === 'assets') {
          const appAssetsPath = path.join(itemPath, 'app');
          if (fs.existsSync(appAssetsPath)) {
            console.log(`  🗑️ Removing ${item}/app/ directory`);
            execSync(`rm -rf "${appAssetsPath}"`);
          }
        } else {
          console.log(`  🗑️ Removing ${item}/ directory`);
          execSync(`rm -rf "${itemPath}"`);
        }
      }
    } else {
      console.log(`  🗑️ Removing ${item}`);
      fs.unlinkSync(itemPath);
    }
  }
} catch (error) {
  console.error(`❌ Error removing files: ${error.message}`);
  process.exit(1);
}

// Step 2: Copy all files from dist to deploy
console.log('📋 Copying files from dist to deploy...');
try {
  execSync(`cp -r "${distPath}"/* "${deployPath}"/`, { stdio: 'inherit' });
  console.log('✅ Files copied successfully');
} catch (error) {
  console.error(`❌ Error copying files: ${error.message}`);
  process.exit(1);
}

console.log('');
console.log('✅ Deployment complete!');
console.log('');
console.log('You can now access your application at:');
console.log(`  file://${deployPath}/index.html`);
