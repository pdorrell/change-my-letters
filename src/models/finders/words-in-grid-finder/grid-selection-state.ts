import { makeAutoObservable } from 'mobx';
import { GridPosition } from './types';

export class GridSelectionState {
  start: GridPosition;
  current: GridPosition;
  forwardsOnly: boolean;
  
  constructor(start: GridPosition, forwardsOnly: boolean) {
    this.start = start;
    this.current = start;
    this.forwardsOnly = forwardsOnly;
    makeAutoObservable(this);
  }

  get isValid(): boolean {
    // Selection must be horizontal only
    if (this.start.row !== this.current.row) {
      return false;
    }
    
    // If forwards only, current must be >= start
    if (this.forwardsOnly && this.current.col < this.start.col) {
      return false;
    }
    
    return true;
  }

  get startCol(): number {
    return Math.min(this.start.col, this.current.col);
  }

  get endCol(): number {
    return Math.max(this.start.col, this.current.col);
  }

  get direction(): 1 | -1 {
    return this.current.col >= this.start.col ? 1 : -1;
  }

  get length(): number {
    return Math.abs(this.current.col - this.start.col) + 1;
  }

  get positions(): GridPosition[] {
    if (!this.isValid) return [];
    
    const positions: GridPosition[] = [];
    const row = this.start.row;
    const minCol = this.startCol;
    const maxCol = this.endCol;
    
    for (let col = minCol; col <= maxCol; col++) {
      positions.push({ row, col });
    }
    
    return positions;
  }

  updateCurrent(position: GridPosition): void {
    this.current = position;
  }

  getSelectedText(grid: string[][]): string {
    if (!this.isValid) return '';
    
    const positions = this.positions;
    let text = '';
    
    if (this.direction === 1) {
      // Forward direction - read left to right
      for (const pos of positions) {
        text += grid[pos.row][pos.col];
      }
    } else {
      // Backward direction - read right to left  
      for (let i = positions.length - 1; i >= 0; i--) {
        const pos = positions[i];
        text += grid[pos.row][pos.col];
      }
    }
    
    return text;
  }

  isPositionSelected(position: GridPosition): boolean {
    if (!this.isValid) return false;
    
    return this.positions.some(p => p.row === position.row && p.col === position.col);
  }
}