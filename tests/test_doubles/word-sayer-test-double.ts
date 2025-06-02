import { WordSayerInterface } from '../../src/models/word-sayer-interface';

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
   */
  say(word: string): void {
    this.playedWords.push(word);
  }
}
