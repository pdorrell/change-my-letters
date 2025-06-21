import { WordSayerInterface } from '@/models/word-sayer-interface';
import { EmotionalWordPlayer } from './emotional-word-player';
import { HappyOrSad } from './emotion-types';

/**
 * Wrapper that makes EmotionalWordPlayer compatible with WordSayerInterface
 * for specific emotions
 */
export class EmotionalWordSayer implements WordSayerInterface {
  constructor(
    private emotionalWordPlayer: EmotionalWordPlayer<HappyOrSad>,
    private emotion: HappyOrSad
  ) {}

  /**
   * Preload emotional words (delegates to the emotional word player)
   */
  preload(_word: string): void {
    // Emotional words are preloaded all at once by the player
    // This is a no-op since the player handles preloading
  }

  /**
   * Say a random word of the specified emotion
   * The word parameter is ignored - we play a random word of the emotion
   */
  async say(_word: string): Promise<void> {
    return this.emotionalWordPlayer.playRandomWord(this.emotion);
  }
}
