import { makeAutoObservable } from 'mobx';
import { GridPosition, PlacedWord } from './types';
import { GridSelectionState } from './grid-selection-state';

export class LettersGrid {
  grid: string[][] = [];
  placedWords: PlacedWord[] = [];
  foundWords: Set<string> = new Set();
  currentSelection: GridSelectionState | null = null;
  correctSelections: Array<{ positions: GridPosition[]; word: string }> = [];
  wrongSelections: Array<{ positions: GridPosition[]; word: string }> = [];
  
  constructor(grid: string[][], placedWords: PlacedWord[]) {
    this.grid = grid;
    this.placedWords = placedWords;
    makeAutoObservable(this);
  }

  get gridSize(): number {
    return this.grid.length;
  }

  getLetterAt(position: GridPosition): string {
    return this.grid[position.row][position.col];
  }

  startSelection(position: GridPosition, forwardsOnly: boolean): void {
    this.currentSelection = new GridSelectionState(position, forwardsOnly);
    this.clearTemporarySelections();
  }

  updateSelection(position: GridPosition): void {
    if (this.currentSelection) {
      this.currentSelection.updateCurrent(position);
    }
  }

  finishSelection(): string | null {
    if (!this.currentSelection || !this.currentSelection.isValid) {
      this.currentSelection = null;
      return null;
    }

    const selectedText = this.currentSelection.getSelectedText(this.grid);
    // Don't clear currentSelection yet - let markSelectionCorrect/Wrong handle it
    return selectedText;
  }

  cancelSelection(): void {
    this.currentSelection = null;
    this.clearTemporarySelections();
  }

  markSelectionCorrect(word: string): void {
    if (this.currentSelection && this.currentSelection.isValid) {
      const positions = this.currentSelection.positions;
      this.correctSelections.push({ positions, word });
      this.foundWords.add(word);
      this.currentSelection = null; // Clear selection after marking
      this.clearTemporarySelections(); // Clear wrong selections after correct one
    }
  }

  markSelectionWrong(word: string): void {
    if (this.currentSelection && this.currentSelection.isValid) {
      const positions = this.currentSelection.positions;
      this.wrongSelections.push({ positions, word });
      this.currentSelection = null; // Clear selection after marking
    }
  }

  clearTemporarySelections(): void {
    this.wrongSelections = [];
  }

  getCellState(position: GridPosition): 'normal' | 'selecting' | 'correct' | 'wrong' {
    // Check if currently selecting
    if (this.currentSelection && this.currentSelection.isPositionSelected(position)) {
      return 'selecting';
    }

    // Check if in a correct selection
    if (this.correctSelections.some(sel => 
      sel.positions.some(p => p.row === position.row && p.col === position.col)
    )) {
      return 'correct';
    }

    // Check if in a wrong selection
    if (this.wrongSelections.some(sel => 
      sel.positions.some(p => p.row === position.row && p.col === position.col)
    )) {
      return 'wrong';
    }

    return 'normal';
  }

  isWordCorrect(word: string, selectedText: string): boolean {
    // Check if the selected text matches the word (case insensitive)
    const normalizedWord = word.toLowerCase();
    const normalizedSelected = selectedText.toLowerCase();
    
    // Direct match
    if (normalizedSelected === normalizedWord) {
      return true;
    }

    // Check if it's a palindrome and matches in reverse
    const reversedSelected = normalizedSelected.split('').reverse().join('');
    if (reversedSelected === normalizedWord) {
      return true;
    }

    return false;
  }

  getPlacedWordForText(word: string): PlacedWord | null {
    return this.placedWords.find(p => p.word.toLowerCase() === word.toLowerCase()) || null;
  }

  reset(): void {
    this.foundWords.clear();
    this.correctSelections = [];
    this.wrongSelections = [];
    this.currentSelection = null;
  }
}