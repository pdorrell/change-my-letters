/**
 * Result of file verification operation
 */
export interface VerificationResult {
  allFilesExist: boolean;
  missingFiles: string[];
  errors: string[];
}

/**
 * Interface for playing audio files by relative path
 */
export interface AudioFilePlayerInterface {
  /**
   * Play an audio file by relative path
   * @param relativePath Path relative to baseUrl (e.g., 'words/cat' or 'sad/oh dear!')
   * @returns Promise that resolves when audio finishes playing
   */
  playAudioFile(relativePath: string): Promise<void>;

  /**
   * Preload an audio file for faster playback
   * @param relativePath Path relative to baseUrl
   */
  preload(relativePath: string): void;

  /**
   * Verify that expected audio files exist
   * @param baseDirectory Base directory to check (for verification purposes)
   * @param expectedPaths List of relative paths that should exist
   * @returns Promise with verification results
   */
  verifyFiles(baseDirectory: string, expectedPaths: string[]): Promise<VerificationResult>;
}
