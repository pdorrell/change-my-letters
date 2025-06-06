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
   * @param onFinished Optional callback to call when the word finishes playing
   */
  say(word: string, onFinished?: () => void): void {
    this.playedWords.push(word);
    if (onFinished) {
      onFinished();
    }
  }
}
