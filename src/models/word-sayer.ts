import { WordSayerInterface } from '@/models/word-sayer-interface';

/**
 * Class responsible for pre-loading and playing word audio
 */
export class WordSayer implements WordSayerInterface {
  // Maps words to their Audio objects
  private loadedWords: Map<string, HTMLAudioElement> = new Map();

  constructor(
    public readonly baseMp3Url: string
  ) {
    // No need for makeAutoObservable as this class doesn't contain observable state
  }

  /**
   * Get the URL for the word's MP3 file
   */
  getMp3Url(word: string): string {
    return `${this.baseMp3Url}/${word.toLowerCase()}.mp3`;
  }

  /**
   * Preload the audio for a word
   * @param word The word to preload
   */
  preload(word: string): void {
    // If we've already loaded this word, do nothing
    if (this.loadedWords.has(word)) {
      return;
    }

    try {
      // Create the audio element
      const audio = new Audio(this.getMp3Url(word));

      // Add a loading error handler
      audio.addEventListener('error', (e) => {
        console.error(`Error loading audio for word "${word}":`, e);
        // Remove from loaded words on error
        this.loadedWords.delete(word);
      });

      // Start loading the audio
      audio.load();

      // Add to our map of loaded words
      this.loadedWords.set(word, audio);
    } catch (error) {
      console.error(`Error creating audio for word "${word}":`, error);
    }
  }

  /**
   * Play the audio for a word, preloading it if necessary
   * @param word The word to play
   * @returns Promise that resolves when the word finishes playing
   */
  say(word: string): Promise<void> {
    return new Promise<void>((resolve) => {
      // Preload the word if it's not already loaded
      if (!this.loadedWords.has(word)) {
        this.preload(word);
      }

      // Get the audio element
      const audio = this.loadedWords.get(word);

      if (audio) {

        // Add event listener for when audio ends
        const handleEnded = () => {
          resolve();
          audio.removeEventListener('ended', handleEnded);
        };
        audio.addEventListener('ended', handleEnded);

        // Play the audio
        audio.play().catch(error => {
          console.error(`Error playing word audio for "${word}":`, error);
          // If there was an error, still resolve the promise
          resolve();
        });
      } else {
        // If no audio available, resolve immediately
        resolve();
      }
    });
  }
}
