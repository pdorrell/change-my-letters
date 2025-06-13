import { makeAutoObservable } from 'mobx';

export class WordDragState {
  start: number;
  direction: number;
  length: number;
  maxRowLength: number;
  possibleDirections: number[];

  constructor(start: number, direction: number, maxRowLength: number, forwardsOnly: boolean) {
    this.start = start;
    this.direction = direction;
    this.length = 1;
    this.maxRowLength = maxRowLength;
    this.possibleDirections = forwardsOnly ? [1] : [1, -1];

    makeAutoObservable(this);
  }

  get end(): number {
    return this.start + (this.direction * (this.length - 1));
  }

  get startIndex(): number {
    return Math.min(this.start, this.end);
  }

  get endIndex(): number {
    return Math.max(this.start, this.end);
  }

  updateLength(newLength: number): void {
    // Ensure the selection stays within the row bounds
    const maxForwards = this.maxRowLength - this.start;
    const maxBackwards = this.start + 1;
    const maxAllowedLength = this.direction === 1 ? maxForwards : maxBackwards;

    this.length = Math.max(1, Math.min(newLength, maxAllowedLength));
  }

  updateDirection(newDirection: number): void {
    if (this.possibleDirections.includes(newDirection)) {
      this.direction = newDirection;
    }
  }
}

