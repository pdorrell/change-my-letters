import { makeAutoObservable } from 'mobx';
import { WordToFind } from './word-to-find';

export class WordsToFind {
  words: WordToFind[] = [];
  activeWord: WordToFind | null = null;

  constructor(wordStrings: string[]) {
    this.words = wordStrings.map(word => new WordToFind(word));
    makeAutoObservable(this);
  }

  setActiveWord(wordToFind: WordToFind): void {
    if (this.activeWord && this.activeWord !== wordToFind) {
      this.activeWord.setActive(false);
    }

    this.activeWord = wordToFind;
    wordToFind.setActive(true);
  }

  clearActiveWord(): void {
    if (this.activeWord) {
      this.activeWord.setActive(false);
      this.activeWord = null;
    }
  }

  markActiveWordCorrect(): void {
    if (this.activeWord) {
      this.activeWord.setFound(true);
      // Keep the word active until the next word is chosen
    }
  }

  markActiveWordWrong(): void {
    if (this.activeWord) {
      this.activeWord.setFound(false);
    }
  }

  get completed(): boolean {
    return this.words.every(word => word.found === true);
  }

  get nextUnfoundWord(): WordToFind | null {
    return this.words.find(word => word.found !== true) || null;
  }

  reset(): void {
    this.words.forEach(word => {
      word.setActive(false);
      word.found = null;
    });
    this.activeWord = null;
  }

  destroy(): void {
    this.words.forEach(word => word.destroy());
  }
}

