/**
 * Interface for classes that handle word pronunciation
 */
export interface WordSayerInterface {
  /**
   * Preload the audio for a word
   * @param word The word to preload
   */
  preload(word: string): void;

  /**
   * Play the audio for a word
   * @param word The word to play
   */
  say(word: string): void;
}