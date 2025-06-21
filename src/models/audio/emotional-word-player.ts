import { AudioFilePlayerInterface, VerificationResult } from './audio-file-player-interface';
import { EmotionWordSet } from './emotion-types';

/**
 * Player for emotional words using AudioFilePlayer
 */
export class EmotionalWordPlayer<EmotionType extends string> {
  private emotionWordSets: Map<EmotionType, string[]> = new Map();

  constructor(
    private audioFilePlayer: AudioFilePlayerInterface,
    emotionWordSets: EmotionWordSet<EmotionType>[]
  ) {
    // Build map of emotion to words
    for (const wordSet of emotionWordSets) {
      this.emotionWordSets.set(wordSet.emotion, wordSet.words);
    }
  }

  /**
   * Play a random word for the specified emotion
   */
  async playRandomWord(emotion: EmotionType): Promise<void> {
    const words = this.emotionWordSets.get(emotion);
    if (!words || words.length === 0) {
      console.warn(`No words available for emotion: ${emotion}`);
      return;
    }

    const randomWord = words[Math.floor(Math.random() * words.length)];
    const relativePath = `${emotion}/${randomWord}`;
    return this.audioFilePlayer.playAudioFile(relativePath);
  }

  /**
   * Preload all emotional words for faster playback
   */
  preload(): void {
    for (const [emotion, words] of this.emotionWordSets) {
      for (const word of words) {
        const relativePath = `${emotion}/${word}`;
        this.audioFilePlayer.preload(relativePath);
      }
    }
  }

  /**
   * Verify that all expected emotional word files exist
   */
  async verifyFiles(baseDirectory: string): Promise<VerificationResult> {
    const expectedPaths: string[] = [];

    // Build list of all expected paths
    for (const [emotion, words] of this.emotionWordSets) {
      for (const word of words) {
        expectedPaths.push(`${emotion}/${word}`);
      }
    }

    return this.audioFilePlayer.verifyFiles(baseDirectory, expectedPaths);
  }

  /**
   * Get all emotions that have word sets
   */
  getAvailableEmotions(): EmotionType[] {
    return Array.from(this.emotionWordSets.keys());
  }

  /**
   * Get words for a specific emotion
   */
  getWordsForEmotion(emotion: EmotionType): string[] {
    return this.emotionWordSets.get(emotion) || [];
  }
}
