import { makeAutoObservable } from 'mobx';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { WordToFind } from './word-to-find';
import { getRandomNegativeWord } from '@/lib/util';

interface FinderInterface {
  wordSayer: WordSayerInterface;
  sadWordSayer?: WordSayerInterface;
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
      // Say negative word first, then the chosen word
      const negativeWord = getRandomNegativeWord();
      const sadSayer = this.finder.sadWordSayer || this.finder.wordSayer;
      await sadSayer.say(negativeWord);
      // Wait a moment before saying the chosen word
      await new Promise(resolve => setTimeout(resolve, 200));
      await this.finder.wordSayer.say(this.word);
    }
    this.finder.wordChangerToFind.chosenAs(this.word);
  }
}
