import { makeAutoObservable } from 'mobx';
import { Word } from '@/models/Word';

export class MakeWordResult {
  private isCorrect: boolean | null = null;

  constructor(public readonly word: Word) {
    makeAutoObservable(this);
  }

  get backgroundClass(): string {
    if (this.isCorrect === true) {
      return 'make-result-correct'; // Correct: light green
    }
    if (this.isCorrect === false) {
      return 'make-result-incorrect'; // Incorrect: light red
    }
    return ''; // No background if not yet determined
  }

  get showDeleteButton(): boolean {
    return this.isCorrect === false;
  }

  setCorrect(correct: boolean): void {
    this.isCorrect = correct;
  }
}

export class MakeWordResultPlaceholder {
  constructor() {
    makeAutoObservable(this);
  }

  get backgroundClass(): string {
    return 'make-result-placeholder'; // White background for empty placeholder
  }

  get showDeleteButton(): boolean {
    return false;
  }
}
