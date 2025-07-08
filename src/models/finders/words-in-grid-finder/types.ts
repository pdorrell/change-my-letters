export type DifficultyType = 'easy' | 'hard';

export interface GridPosition {
  row: number;
  col: number;
}

export interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: 1 | -1; // 1 for forward, -1 for backward
}

export interface PopulatedGrid {
  grid: string[][];
  placedWords: PlacedWord[];
}

export interface GridSelectionRange {
  start: GridPosition;
  end: GridPosition;
}