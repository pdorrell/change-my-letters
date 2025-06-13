import { makeAutoObservable } from 'mobx';

export class WordDragState {
  start: number;
  direction: number;
  length: number;
  maxLength: number;
  possibleDirections: number[];

  constructor(start: number, direction: number, maxLength: number, forwardsOnly: boolean) {
    this.start = start;
    this.direction = direction;
    this.length = 1;
    this.maxLength = maxLength;
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
    this.length = Math.max(1, Math.min(newLength, this.maxLength));
  }

  updateDirection(newDirection: number): void {
    if (this.possibleDirections.includes(newDirection)) {
      this.direction = newDirection;
    }
  }
}

