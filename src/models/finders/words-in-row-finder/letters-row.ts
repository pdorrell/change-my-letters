import { makeAutoObservable } from 'mobx';
import { WordSelectionState } from './word-selection-state';
import { populateLettersRow } from './populate-letters-row';
import { DifficultyType } from './types';

export class LettersRow {
  letters: string | null = null;
  word: string = '';
  wordStart: number = 0;
  wordDirection: number = 1;
  selectionState: WordSelectionState | null = null;
  correctSelection: { start: number; end: number } | null = null;
  wrongSelection: { start: number; end: number } | null = null;
  correctSelectionStart: number | null = null;
  wrongSelectionStart: number | null = null;
  private rowLength: number = 12;

  constructor() {
    makeAutoObservable(this);
  }

  populate(word: string, difficulty: DifficultyType, forwardsOnly: boolean): void {
    const result = populateLettersRow(word, this.rowLength, difficulty, forwardsOnly);
    this.letters = result.letters;
    this.word = word;
    this.wordStart = result.wordStart;
    this.wordDirection = result.wordDirection;
    this.clearSelection();
    this.correctSelection = null;
    this.wrongSelection = null;
    this.correctSelectionStart = null;
    this.wrongSelectionStart = null;
  }

  startSelection(position: number, forwardsOnly: boolean): void {
    // Clear wrong selection when starting a new selection
    this.wrongSelection = null;

    this.selectionState = new WordSelectionState(
      position,
      1, // Initial direction
      this.rowLength, // Allow selection to extend to end of row
      forwardsOnly
    );
  }

  updateSelection(endPosition: number): void {
    if (!this.selectionState) return;

    const start = this.selectionState.start;
    const requestedDirection = endPosition >= start ? 1 : -1;

    // In forwards-only mode, don't allow backwards direction
    if (this.selectionState.possibleDirections.includes(requestedDirection)) {
      const length = Math.abs(endPosition - start) + 1;
      this.selectionState.updateDirection(requestedDirection);
      this.selectionState.updateLength(length);
    } else {
      // In forwards-only mode trying to go backwards, keep length at 1
      this.selectionState.updateLength(1);
    }
  }

  clearSelection(): void {
    this.selectionState = null;
  }

  markSelectionCorrect(): void {
    if (this.selectionState) {
      this.correctSelection = {
        start: this.selectionState.startIndex,
        end: this.selectionState.endIndex
      };
      this.correctSelectionStart = this.selectionState.start;
      this.clearSelection();
    }
  }

  markSelectionWrong(): void {
    if (this.selectionState) {
      this.wrongSelection = {
        start: this.selectionState.startIndex,
        end: this.selectionState.endIndex
      };
      this.wrongSelectionStart = this.selectionState.start;
      this.clearSelection();
    }
  }

  checkSelectedWord(): boolean {
    if (!this.selectionState || !this.letters) return false;

    const selectionStart = this.selectionState.startIndex;
    const selectionEnd = this.selectionState.endIndex;
    const selectedLength = selectionEnd - selectionStart + 1;

    if (selectedLength !== this.word.length) return false;

    const selectedText = this.letters.slice(selectionStart, selectionEnd + 1);
    const expectedText = this.selectionState.direction === 1 ?
      this.word : this.word.split('').reverse().join('');

    return selectedText.toLowerCase() === expectedText.toLowerCase();
  }

  get selection(): { start: number; end: number } | null {
    if (this.selectionState) {
      return {
        start: this.selectionState.startIndex,
        end: this.selectionState.endIndex
      };
    }

    if (this.correctSelection) {
      return this.correctSelection;
    }

    if (this.wrongSelection) {
      return this.wrongSelection;
    }

    return null;
  }

  get lettersArray(): string[] {
    return this.letters ? this.letters.split('') : Array(this.rowLength).fill('');
  }

  get interactionsDisabled(): boolean {
    return this.correctSelection !== null;
  }
}

