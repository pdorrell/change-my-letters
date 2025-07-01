import { makeAutoObservable } from 'mobx';
import { Word } from '@/models/Word';

export class MakerHistory {
  private words: Word[] = [];
  private visitedWords: Set<string> = new Set();

  constructor() {
    makeAutoObservable(this);
  }

  get historyWords(): Word[] {
    return [...this.words];
  }

  addWord(word: Word): void {
    this.words.push(word);
    this.visitedWords.add(word.word);
  }

  hasVisited(wordString: string): boolean {
    return this.visitedWords.has(wordString);
  }

  reset(): void {
    this.words = [];
    this.visitedWords.clear();
  }
}
