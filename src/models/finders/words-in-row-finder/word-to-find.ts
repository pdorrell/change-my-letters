import { makeAutoObservable } from 'mobx';

export class WordToFind {
  word: string;
  active: boolean = false;
  found: boolean | null = null;
  private wrongHighlightTimeout: NodeJS.Timeout | null = null;

  constructor(word: string) {
    this.word = word;
    makeAutoObservable(this);
  }

  setActive(active: boolean): void {
    this.active = active;
    if (active && this.wrongHighlightTimeout) {
      this.clearWrongHighlight();
    }
  }

  setFound(found: boolean): void {
    this.found = found;
    if (found === false) {
      this.startWrongHighlightTimeout();
    } else {
      this.clearWrongHighlight();
    }
  }

  get canClick(): boolean {
    return this.found !== true;
  }

  get displayState(): 'waiting' | 'active' | 'correct' | 'wrong' {
    if (this.found === true) return 'correct';
    if (this.found === false) return 'wrong';
    if (this.active) return 'active';
    return 'waiting';
  }

  private startWrongHighlightTimeout(): void {
    this.clearWrongHighlight();
    this.wrongHighlightTimeout = setTimeout(() => {
      if (this.found === false) {
        this.found = null;
      }
      this.wrongHighlightTimeout = null;
    }, 5000);
  }

  private clearWrongHighlight(): void {
    if (this.wrongHighlightTimeout) {
      clearTimeout(this.wrongHighlightTimeout);
      this.wrongHighlightTimeout = null;
    }
  }

  destroy(): void {
    this.clearWrongHighlight();
  }
}

