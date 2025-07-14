import { makeAutoObservable } from 'mobx';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { WordToFind } from './word-to-find';
import { EmotionalWordSayer } from '@/models/audio/emotional-word-sayer';
import { HappyOrSad } from '@/models/audio/emotion-types';

interface FinderInterface {
  wordSayer: WordSayerInterface;
  emotionalWordSayer: EmotionalWordSayer<HappyOrSad>;
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
      // Play a random sad word first, then the chosen word
      if (this.finder.emotionalWordSayer) {
        await this.finder.emotionalWordSayer.playRandomWord('sad');
      }
      // Wait a moment before saying the chosen word
      await new Promise(resolve => setTimeout(resolve, 200));
      await this.finder.wordSayer.say(this.word);
    }
    this.finder.wordChangerToFind.chosenAs(this.word);
  }
}
