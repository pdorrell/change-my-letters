import { WordSayerInterface } from '@/models/word-sayer-interface';

/**
 * A test double for WordSayer that implements WordSayerInterface with dummy methods
 */
export class WordSayerTestDouble implements WordSayerInterface {
  // Track which words were preloaded for test verification
  public preloadedWords: Set<string> = new Set();

  // Track which words were played for test verification
  public playedWords: string[] = [];

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
    return Promise.resolve();
  }
}
