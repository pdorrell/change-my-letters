import { makeAutoObservable } from 'mobx';
import { FinderType } from './finder-types';
import { WordSayerInterface } from '@/models/word-sayer-interface';

export class FindersInteraction {
  currentFinderType: FinderType = 'word-choice';

  constructor(
    public readonly wordSayer: WordSayerInterface,
    public readonly happyWordSayer: WordSayerInterface,
    public readonly getRandomWords: () => string[]
  ) {
    makeAutoObservable(this);
  }

  setFinderType(finderType: FinderType): void {
    this.currentFinderType = finderType;
  }
}
