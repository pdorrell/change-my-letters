import { makeAutoObservable } from 'mobx';
import { WordDragState } from './word-drag-state';
import { populateLettersRow } from './populate-letters-row';
import { DifficultyType } from './types';

export class LettersRow {
  letters: string | null = null;
  word: string = '';
  wordStart: number = 0;
  wordDirection: number = 1;
  dragState: WordDragState | null = null;
  correctSelection: { start: number; end: number } | null = null;
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
    this.clearDragState();
    this.correctSelection = null;
  }

  startDrag(position: number, forwardsOnly: boolean): void {
    this.dragState = new WordDragState(
      position,
      1, // Initial direction
      this.rowLength, // Allow selection to extend to end of row
      forwardsOnly
    );
  }

  updateDrag(endPosition: number): void {
    if (!this.dragState) return;

    const start = this.dragState.start;
    const requestedDirection = endPosition >= start ? 1 : -1;

    // In forwards-only mode, don't allow backwards direction
    if (this.dragState.possibleDirections.includes(requestedDirection)) {
      const length = Math.abs(endPosition - start) + 1;
      this.dragState.updateDirection(requestedDirection);
      this.dragState.updateLength(length);
    } else {
      // In forwards-only mode trying to go backwards, keep length at 1
      this.dragState.updateLength(1);
    }
  }

  clearDragState(): void {
    this.dragState = null;
  }

  markSelectionCorrect(): void {
    if (this.dragState) {
      this.correctSelection = {
        start: this.dragState.startIndex,
        end: this.dragState.endIndex
      };
      this.clearDragState();
    }
  }

  checkDraggedWord(): boolean {
    if (!this.dragState || !this.letters) return false;

    const dragStart = this.dragState.startIndex;
    const dragEnd = this.dragState.endIndex;
    const draggedLength = dragEnd - dragStart + 1;

    if (draggedLength !== this.word.length) return false;

    const draggedText = this.letters.slice(dragStart, dragEnd + 1);
    const expectedText = this.dragState.direction === 1 ?
      this.word : this.word.split('').reverse().join('');

    return draggedText.toLowerCase() === expectedText.toLowerCase();
  }

  get draggedSelection(): { start: number; end: number } | null {
    if (this.dragState) {
      return {
        start: this.dragState.startIndex,
        end: this.dragState.endIndex
      };
    }

    if (this.correctSelection) {
      return this.correctSelection;
    }

    return null;
  }

  get lettersArray(): string[] {
    return this.letters ? this.letters.split('') : Array(this.rowLength).fill('');
  }
}

