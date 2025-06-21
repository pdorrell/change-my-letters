import { WordSayerInterface } from '@/models/word-sayer-interface';
import { EmotionalWordSayer } from './emotional-word-sayer';
import { HappyOrSad } from './emotion-types';

/**
 * Wrapper that makes EmotionalWordSayer compatible with WordSayerInterface
 * for specific emotions
 */
export class EmotionalWordSayerWrapper implements WordSayerInterface {
  constructor(
    private emotionalWordSayer: EmotionalWordSayer<HappyOrSad>,
    private emotion: HappyOrSad
  ) {}

  /**
   * Preload emotional words (delegates to the emotional word sayer)
   */
  preload(_word: string): void {
    // Emotional words are preloaded all at once by the sayer
    // This is a no-op since the sayer handles preloading
  }

  /**
   * Say a random word of the specified emotion
   * The word parameter is ignored - we play a random word of the emotion
   */
  async say(_word: string): Promise<void> {
    return this.emotionalWordSayer.playRandomWord(this.emotion);
  }
}
