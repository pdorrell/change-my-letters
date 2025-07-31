import { AudioFilePlayerInterface, VerificationResult } from './audio-file-player-interface';

/**
 * Concrete implementation of AudioFilePlayer for web browsers
 */
export class AudioFilePlayer implements AudioFilePlayerInterface {
  // Maps relative paths to their Audio objects
  private loadedFiles: Map<string, HTMLAudioElement> = new Map();

  constructor(
    public readonly baseUrl: string,
    public readonly extension: string = '.mp3'
  ) {}

  /**
   * Get the full URL for a relative path
   */
  private getFullUrl(relativePath: string): string {
    // Ensure baseUrl doesn't end with slash and relativePath doesn't start with slash
    const cleanBaseUrl = this.baseUrl.replace(/\/$/, '');
    const cleanRelativePath = relativePath.replace(/^\//, '');
    return `${cleanBaseUrl}/${cleanRelativePath}${this.extension}`;
  }

  /**
   * Preload an audio file for faster playback
   */
  preload(relativePath: string): void {
    // If we've already loaded this file, do nothing
    if (this.loadedFiles.has(relativePath)) {
      return;
    }

    try {
      // Create the audio element
      const audio = new Audio(this.getFullUrl(relativePath));

      // Add a loading error handler
      audio.addEventListener('error', (e) => {
        console.error(`Error loading audio for path "${relativePath}":`, e);
        // Remove from loaded files on error
        this.loadedFiles.delete(relativePath);
      });

      // Start loading the audio
      audio.load();

      // Add to our map of loaded files
      this.loadedFiles.set(relativePath, audio);
    } catch (error) {
      console.error(`Error creating audio for path "${relativePath}":`, error);
    }
  }

  /**
   * Play an audio file by relative path
   */
  playAudioFile(relativePath: string): Promise<void> {
    return new Promise<void>((resolve) => {
      // Preload the file if it's not already loaded
      if (!this.loadedFiles.has(relativePath)) {
        this.preload(relativePath);
      }

      // Get the audio element
      const audio = this.loadedFiles.get(relativePath);

      if (audio) {
        // Add event listener for when audio ends
        const handleEnded = () => {
          resolve();
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', handleError);
        };

        // Add error handler
        const handleError = (e: Event) => {
          console.error(`Error playing audio for path "${relativePath}":`, e);
          resolve(); // Resolve anyway to not block the flow
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', handleError);
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        // Reset audio to start and play
        audio.currentTime = 0;
        const playPromise = audio.play();

        // Handle browsers that return a promise from play()
        if (playPromise) {
          playPromise.catch((error) => {
            console.error(`Error starting playback for path "${relativePath}":`, error);
            resolve(); // Resolve anyway to not block the flow
          });
        }
      } else {
        // If audio element doesn't exist, resolve immediately
        console.warn(`Audio element not found for path "${relativePath}"`);
        resolve();
      }
    });
  }

  /**
   * Verify that expected audio files exist
   * Note: This is a basic implementation for browser environment
   * In a real implementation, this might use fetch() to check file existence
   */
  async verifyFiles(_baseDirectory: string, expectedPaths: string[]): Promise<VerificationResult> {
    const missingFiles: string[] = [];
    const errors: string[] = [];

    // For browser environment, we can't easily list directories
    // So we'll attempt to fetch each file to verify existence
    for (const relativePath of expectedPaths) {
      try {
        const fullUrl = this.getFullUrl(relativePath);
        const response = await fetch(fullUrl, { method: 'HEAD' });
        if (!response.ok) {
          missingFiles.push(relativePath);
        }
      } catch (error) {
        errors.push(`Error checking ${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      allFilesExist: missingFiles.length === 0 && errors.length === 0,
      missingFiles,
      errors
    };
  }
}
