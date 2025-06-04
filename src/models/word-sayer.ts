import { WordSayerInterface } from './word-sayer-interface';

/**
 * Class responsible for pre-loading and playing word audio
 */
export class WordSayer implements WordSayerInterface {
  // Maps words to their Audio objects
  private loadedWords: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    // No need for makeAutoObservable as this class doesn't contain observable state
  }

  /**
   * Get the URL for the word's MP3 file
   */
  getMp3Url(word: string): string {
    return `/assets/words/eleven_labs/${word.toLowerCase()}.mp3`;
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
   * @param onFinished Optional callback to call when the word finishes playing
   * @param volume Optional volume level (0.0 to 1.0, default 1.0)
   */
  say(word: string, onFinished?: () => void, volume: number = 1.0): void {
    // Preload the word if it's not already loaded
    if (!this.loadedWords.has(word)) {
      this.preload(word);
    }

    // Get the audio element
    const audio = this.loadedWords.get(word);

    if (audio) {
      // Set the volume
      audio.volume = Math.max(0.0, Math.min(1.0, volume));

      // If there's an onFinished callback, add the event listener
      if (onFinished) {
        const handleEnded = () => {
          onFinished();
          audio.removeEventListener('ended', handleEnded);
        };
        audio.addEventListener('ended', handleEnded);
      }

      // Play the audio
      audio.play().catch(error => {
        console.error(`Error playing word audio for "${word}":`, error);
        // If there was an error, still call the callback
        if (onFinished) {
          onFinished();
        }
      });
    } else if (onFinished) {
      // If no audio available, still call the callback
      onFinished();
    }
  }
}
