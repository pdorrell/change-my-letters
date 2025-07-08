import { makeAutoObservable } from 'mobx';

export class WordToFind {
  word: string;
  active: boolean = false;
  found: boolean | null = null;

  constructor(word: string) {
    this.word = word;
    makeAutoObservable(this);
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  setFound(found: boolean): void {
    this.found = found;
  }

  get canClick(): boolean {
    return this.found !== true;
  }

  get displayState(): 'waiting' | 'active' | 'correct' | 'correct-active' | 'wrong' {
    if (this.found === true && this.active) return 'correct-active';
    if (this.found === true) return 'correct';
    if (this.found === false) return 'wrong';
    if (this.active) return 'active';
    return 'waiting';
  }

  destroy(): void {
    // No cleanup needed
  }
}
