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
  }

  startDrag(position: number, forwardsOnly: boolean): void {
    this.dragState = new WordDragState(
      position,
      1, // Initial direction
      this.word.length,
      forwardsOnly
    );
  }

  updateDrag(endPosition: number): void {
    if (!this.dragState) return;

    const start = this.dragState.start;
    const direction = endPosition >= start ? 1 : -1;
    const length = Math.abs(endPosition - start) + 1;

    this.dragState.updateDirection(direction);
    this.dragState.updateLength(length);
  }

  clearDragState(): void {
    this.dragState = null;
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
    if (!this.dragState) return null;

    return {
      start: this.dragState.startIndex,
      end: this.dragState.endIndex
    };
  }

  get lettersArray(): string[] {
    return this.letters ? this.letters.split('') : [];
  }
}

