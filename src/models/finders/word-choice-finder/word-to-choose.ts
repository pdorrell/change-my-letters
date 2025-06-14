import { makeAutoObservable } from 'mobx';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { WordToFind } from './word-to-find';

interface FinderInterface {
  wordSayer: WordSayerInterface;
  wordChangerToFind: WordToFind | null;
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
    return this.finder.wordChangerToFind !== null;
  }

  async choose(): Promise<void> {
    if (!this.enabled || !this.finder.wordChangerToFind) return;

    const isCorrect = this.word === this.finder.wordChangerToFind.word;
    if (!isCorrect) {
      await this.finder.wordSayer.say(this.word);
    }
    this.finder.wordChangerToFind.chosenAs(this.word);
  }
}
