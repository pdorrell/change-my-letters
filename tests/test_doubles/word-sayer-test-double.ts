import { WordSayerInterface } from '@/models/word-sayer-interface';
import { findProjectRoot } from '@/lib/project-root-util';
import path from 'path';
import fs from 'fs';

/**
 * A test double for WordSayer that implements WordSayerInterface with dummy methods
 */
export class WordSayerTestDouble implements WordSayerInterface {
  // Track which words were preloaded for test verification
  public preloadedWords: Set<string> = new Set();

  // Track which words were played for test verification
  public playedWords: string[] = [];

  // Track missing MP3 files for test verification
  public missingMp3Files: string[] = [];

  /**
   * Preload the audio for a word (test implementation)
   * @param word The word to preload
   */
  preload(word: string): void {
    this.preloadedWords.add(word);
  }

  /**
   * Play the audio for a word (test implementation)
   * @param word The word to play
   * @returns Promise that resolves immediately (for testing)
   */
  say(word: string): Promise<void> {
    this.playedWords.push(word);
    this.checkMp3FileExists(word);
    return Promise.resolve();
  }

  /**
   * Check if MP3 file exists for the given word in deploy/assets
   * @param word The word to check
   */
  private checkMp3FileExists(word: string): void {
    try {
      const projectRoot = findProjectRoot();

      // Check common MP3 file locations
      const possiblePaths = [
        path.join(projectRoot, 'deploy/assets/words/espeak', `${word}.mp3`),
        path.join(projectRoot, 'deploy/assets/words/amazon_polly', `${word}.mp3`),
        path.join(projectRoot, 'deploy/assets/words/eleven_labs', `${word}.mp3`),
        // For negative words in sad subdirectory
        path.join(projectRoot, 'deploy/assets/words/amazon_polly/sad', `${word}.mp3`),
        path.join(projectRoot, 'deploy/assets/words/eleven_labs/sad', `${word}.mp3`)
      ];

      const exists = possiblePaths.some(filePath => {
        try {
          return fs.existsSync(filePath);
        } catch {
          return false;
        }
      });

      if (!exists) {
        this.missingMp3Files.push(word);
        // Note: Not logging warnings in tests to avoid console.warn failures
        // Use this.missingMp3Files to check for missing files in tests if needed
      }
    } catch (_error) {
      // Note: Not logging warnings in tests to avoid console.warn failures
      // MP3 file checking errors are silently ignored in test environment
    }
  }
}
