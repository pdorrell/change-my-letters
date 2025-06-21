import path from 'path';
import fs from 'fs';

/**
 * Find the project root directory by looking for package.json
 * @param startDir The directory to start searching from (defaults to __dirname)
 * @returns The absolute path to the project root
 */
export function findProjectRoot(startDir: string = __dirname): string {
  let currentDir = startDir;

  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  throw new Error('Could not find project root (package.json not found)');
}
