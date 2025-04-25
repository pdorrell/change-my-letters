#!/usr/bin/env node

/**
 * This script performs a build while preserving the .git directory in the dist folder.
 * It backs up the .git directory before the build and restores it afterward.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');
const gitPath = path.join(distPath, '.git');
const gitBackupPath = path.join(__dirname, '.git-dist-backup');

// Check if dist/.git exists
const hasGit = fs.existsSync(gitPath);

// Backup .git folder if it exists
if (hasGit) {
  console.log('🔄 Backing up dist/.git directory...');
  
  // Make sure any previous backup is removed
  if (fs.existsSync(gitBackupPath)) {
    execSync(`rm -rf "${gitBackupPath}"`);
  }
  
  // Create backup
  execSync(`cp -R "${gitPath}" "${gitBackupPath}"`);
  console.log('✅ Backup complete.');
}

// Run the webpack build
try {
  console.log('🏗️ Building project...');
  execSync('webpack --mode production', { stdio: 'inherit' });
  console.log('✅ Build complete.');
  
  // Restore .git folder if we backed it up
  if (hasGit) {
    console.log('🔄 Restoring .git directory...');
    
    // Make sure the dist directory exists
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }
    
    // Restore from backup
    execSync(`cp -R "${gitBackupPath}" "${gitPath}"`);
    
    // Clean up backup
    execSync(`rm -rf "${gitBackupPath}"`);
    
    console.log('✅ .git directory restored.');
  }
} catch (error) {
  // Restore .git folder even if build fails
  if (hasGit && fs.existsSync(gitBackupPath)) {
    console.log('🔄 Build failed but attempting to restore .git directory...');
    
    // Make sure the dist directory exists
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }
    
    // Restore from backup
    execSync(`cp -R "${gitBackupPath}" "${gitPath}"`);
    
    // Clean up backup
    execSync(`rm -rf "${gitBackupPath}"`);
    
    console.log('✅ .git directory restored.');
  }
  
  // Re-throw the error to maintain the same exit code
  throw error;
}