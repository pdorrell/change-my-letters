/**
 * Type for happy or sad emotions
 */
export type HappyOrSad = 'happy' | 'sad';

/**
 * Generic class representing a set of words for a specific emotion
 */
export class EmotionWordSet<EmotionType extends string> {
  constructor(
    public readonly emotion: EmotionType,
    public readonly words: string[]
  ) {}
}
