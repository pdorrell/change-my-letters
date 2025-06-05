import { makeAutoObservable } from 'mobx';
import { WordSayerInterface } from './word-sayer-interface';
import { WordToFind } from './word-to-find';

interface FinderInterface {
  wordSayer: WordSayerInterface;
  currentWordToFind: WordToFind | null;
}

export class WordToChoose {
  finder: FinderInterface;
  word: string;

  constructor(finder: FinderInterface, word: string) {
    this.finder = finder;
    this.word = word;

    makeAutoObservable(this);
  }

  get enabled(): boolean {
    return this.finder.currentWordToFind !== null;
  }

  choose(): void {
    if (!this.enabled || !this.finder.currentWordToFind) return;

    const isCorrect = this.word === this.finder.currentWordToFind.word;
    if (!isCorrect) {
      this.finder.wordSayer.say(this.word);
    }
    this.finder.currentWordToFind.chosenAs(this.word);
  }
}
