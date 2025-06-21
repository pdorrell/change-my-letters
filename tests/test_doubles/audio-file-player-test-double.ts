import { AudioFilePlayerInterface, VerificationResult } from '@/models/audio/audio-file-player-interface';
import { findProjectRoot } from '@/lib/project-root-util';
import path from 'path';
import fs from 'fs';

/**
 * Test double for AudioFilePlayer that implements AudioFilePlayerInterface with dummy methods
 */
export class AudioFilePlayerTestDouble implements AudioFilePlayerInterface {
  // Track which files were preloaded for test verification
  public preloadedFiles: Set<string> = new Set();

  // Track which files were played for test verification
  public playedFiles: string[] = [];

  // Track missing files for test verification
  public missingFiles: string[] = [];

  constructor(
    public readonly baseUrl: string,
    public readonly extension: string = '.mp3'
  ) {}

  /**
   * Preload an audio file (test implementation)
   */
  preload(relativePath: string): void {
    this.preloadedFiles.add(relativePath);
  }

  /**
   * Play an audio file (test implementation)
   */
  playAudioFile(relativePath: string): Promise<void> {
    this.playedFiles.push(relativePath);
    this.checkFileExists(relativePath);
    return Promise.resolve();
  }

  /**
   * Verify that expected audio files exist using actual file system
   */
  async verifyFiles(baseDirectory: string, expectedPaths: string[]): Promise<VerificationResult> {
    const missingFiles: string[] = [];
    const errors: string[] = [];

    try {
      const projectRoot = findProjectRoot();
      const fullBaseDirectory = path.join(projectRoot, baseDirectory);

      for (const relativePath of expectedPaths) {
        const fullPath = path.join(fullBaseDirectory, `${relativePath}${this.extension}`);
        try {
          if (!fs.existsSync(fullPath)) {
            missingFiles.push(relativePath);
          }
        } catch (error) {
          errors.push(`Error checking ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } catch (error) {
      errors.push(`Error accessing base directory: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      allFilesExist: missingFiles.length === 0 && errors.length === 0,
      missingFiles,
      errors
    };
  }

  /**
   * Check if file exists for the given relative path
   */
  private checkFileExists(relativePath: string): void {
    try {
      const projectRoot = findProjectRoot();

      // Check common file locations based on baseUrl
      const possiblePaths = [
        path.join(projectRoot, 'deploy/assets/words/espeak', `${relativePath}${this.extension}`),
        path.join(projectRoot, 'deploy/assets/words/amazon_polly', `${relativePath}${this.extension}`),
        path.join(projectRoot, 'deploy/assets/words/eleven_labs', `${relativePath}${this.extension}`)
      ];

      const exists = possiblePaths.some(filePath => {
        try {
          return fs.existsSync(filePath);
        } catch {
          return false;
        }
      });

      if (!exists) {
        this.missingFiles.push(relativePath);
        // Note: Not logging warnings in tests to avoid console.warn failures
        // Use this.missingFiles to check for missing files in tests if needed
      }
    } catch (_error) {
      // Note: Not logging warnings in tests to avoid console.warn failures
      // File checking errors are silently ignored in test environment
    }
  }
}
