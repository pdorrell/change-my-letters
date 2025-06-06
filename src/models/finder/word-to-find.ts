import { makeAutoObservable } from 'mobx';
import { WordSayerInterface } from '@/models/word-sayer-interface';

export type WordToFindState = 'waiting' | 'current' | 'wrong' | 'right';

interface FinderInterface {
  wordSayer: WordSayerInterface;
  setWordChangerToFind(wordToFind: WordToFind): void;
  setMessage(message: string): void;
  incrementCorrect(): void;
  incrementTried(): void;
  clearWordChangerToFind(): void;
}

export class WordToFind {
  finder: FinderInterface;
  word: string;
  state: WordToFindState = 'waiting';

  constructor(finder: FinderInterface, word: string) {
    this.finder = finder;
    this.word = word;

    makeAutoObservable(this);
  }

  get canSetToFind(): boolean {
    return this.state === 'waiting' || this.state === 'current';
  }

  setToFind(): void {
    if (!this.canSetToFind) return;

    this.finder.wordSayer.say(this.word);
    this.finder.setWordChangerToFind(this);
  }

  chosenAs(chosenWord: string): void {
    if (this.state === 'right' || this.state === 'wrong') return;

    if (chosenWord === this.word) {
      this.state = 'right';
      this.finder.setMessage('Correct 😊');
      this.finder.incrementCorrect();
    } else {
      this.state = 'wrong';
      this.finder.setMessage('Wrong 😢');
      this.finder.incrementTried();
    }

    this.finder.clearWordChangerToFind();
  }
}
