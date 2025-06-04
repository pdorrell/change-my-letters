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
   * @param onFinished Optional callback to call when the word finishes playing
   * @param volume Optional volume level (0.0 to 1.0, default 1.0)
   */
  say(word: string, onFinished?: () => void, volume?: number): void;
}
