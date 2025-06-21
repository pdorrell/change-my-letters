import { WordSayerInterface } from '@/models/word-sayer-interface';
import { AudioFilePlayerInterface, VerificationResult } from '@/models/audio/audio-file-player-interface';

/**
 * Class responsible for pre-loading and playing word audio using AudioFilePlayer
 */
export class WordSayer implements WordSayerInterface {
  constructor(
    private audioFilePlayer: AudioFilePlayerInterface,
    private relativeBaseDir: string
  ) {}

  /**
   * Preload the audio for a word
   * @param word The word to preload
   */
  preload(word: string): void {
    const relativePath = `${this.relativeBaseDir}/${word.toLowerCase()}`;
    this.audioFilePlayer.preload(relativePath);
  }

  /**
   * Play the audio for a word, preloading it if necessary
   * @param word The word to play
   * @returns Promise that resolves when the word finishes playing
   */
  say(word: string): Promise<void> {
    const relativePath = `${this.relativeBaseDir}/${word.toLowerCase()}`;
    return this.audioFilePlayer.playAudioFile(relativePath);
  }

  /**
   * Verify that all expected word files exist
   * @param baseDirectory Base directory for verification
   * @param words List of words to verify
   * @returns Promise with verification results
   */
  async verifyFiles(baseDirectory: string, words: string[]): Promise<VerificationResult> {
    const expectedPaths = words.map(word => `${this.relativeBaseDir}/${word.toLowerCase()}`);
    return this.audioFilePlayer.verifyFiles(baseDirectory, expectedPaths);
  }
}
