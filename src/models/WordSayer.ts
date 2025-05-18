import { makeAutoObservable } from 'mobx';

/**
 * Class responsible for pre-loading and playing word audio
 */
export class WordSayer {
  // Maps words to their Audio objects
  private loadedWords: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    makeAutoObservable(this);
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
   */
  say(word: string): void {
    // Preload the word if it's not already loaded
    if (!this.loadedWords.has(word)) {
      this.preload(word);
    }

    // Get the audio element
    const audio = this.loadedWords.get(word);
    
    if (audio) {
      // Play the audio
      audio.play().catch(error => {
        console.error(`Error playing word audio for "${word}":`, error);
      });
    }
  }
}