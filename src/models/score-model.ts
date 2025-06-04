import { makeAutoObservable } from 'mobx';

/**
 * Model to track the Make Me feature scoring with correct and incorrect counts
 */
export class ScoreModel {
  correct: number = 0;
  incorrect: number = 0;
  label: string[];

  constructor(label: string[]) {
    this.label = label;
    makeAutoObservable(this);
  }

  /**
   * Increment the correct score
   */
  incrementCorrect(): void {
    this.correct++;
  }

  /**
   * Increment the incorrect score
   */
  incrementIncorrect(): void {
    this.incorrect++;
  }

  /**
   * Reset both scores to zero
   */
  reset(): void {
    this.correct = 0;
    this.incorrect = 0;
  }
}
