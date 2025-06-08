import { makeAutoObservable, computed } from 'mobx';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { WordToFind } from '@/models/finder/word-to-find';
import { WordToChoose } from '@/models/finder/word-to-choose';
import { ButtonAction } from '@/lib/models/actions';
import { ValueModel } from '@/lib/models/value-models';
import { ConfirmationModel } from '@/lib/models/confirmation';

export class FinderInteraction {
  wordSayer: WordSayerInterface;
  words: string[];
  wordsToFind: WordToFind[];
  wordChangerToFind: WordToFind | null = null;
  wordsToChoose: WordToChoose[];
  message: string = '';
  correct: number = 0;
  tried: number = 0;
  newWordsCallback?: () => string[];
  auto: ValueModel<boolean>;
  happyWordSayer?: WordSayerInterface;
  confirmation: ConfirmationModel;

  // Happy celebration words for perfect score
  private readonly celebrationWords: string[] = ['cool!!', 'wow!!', 'hooray!!', 'yes!!'];

  constructor(wordSayer: WordSayerInterface, words?: string[], newWordsCallback?: () => string[], happyWordSayer?: WordSayerInterface) {
    this.wordSayer = wordSayer;
    this.newWordsCallback = newWordsCallback;
    this.happyWordSayer = happyWordSayer;

    if (words) {
      this.words = words.slice();
    } else {
      this.words = [];
    }

    this.wordsToFind = this.words.map(word => new WordToFind(this, word));
    this.wordsToChoose = this.words.map(word => new WordToChoose(this, word));

    // Initialize auto checkbox (defaulted to checked)
    this.auto = new ValueModel(true, 'Auto', 'Automatically choose next word to find');

    // Initialize confirmation model
    this.confirmation = new ConfirmationModel();

    makeAutoObservable(this, {
      numWordsChosen: computed,
      finished: computed,
      scoreText: computed,
      retryAction: computed,
      newAction: computed,
      allWordsAttempted: computed
    });
  }

  get numWordsChosen(): number {
    return this.wordsToFind.filter(w => w.state === 'right' || w.state === 'wrong').length;
  }

  get finished(): boolean {
    return this.numWordsChosen === this.wordsToFind.length;
  }

  get scoreText(): string {
    return `${this.correct} / ${this.tried}`;
  }

  get allWordsAttempted(): boolean {
    return this.numWordsChosen === this.wordsToFind.length;
  }

  get retryAction(): ButtonAction {
    const handler = this.finished ? () => this.retry() : null;
    return new ButtonAction(handler, { tooltip: "Retry with the same words" });
  }

  get newAction(): ButtonAction {
    const handler = () => this.requestNew();
    return new ButtonAction(handler, { tooltip: "Start with a new set of words" });
  }

  async requestNew(): Promise<void> {
    if (this.allWordsAttempted) {
      // All words have been attempted, proceed directly
      this.new();
    } else {
      // Not all words attempted, ask for confirmation
      await this.confirmation.askForConfirmationYesOrNo(
        'Are you sure you want to quit and start again with new words to find?',
        () => this.new()
      );
    }
  }

  setWordChangerToFind(wordToFind: WordToFind): void {
    if (this.wordChangerToFind && this.wordChangerToFind !== wordToFind) {
      this.wordChangerToFind.state = 'waiting';
    }
    this.wordChangerToFind = wordToFind;
    wordToFind.state = 'current';
  }

  clearWordChangerToFind(): void {
    this.wordChangerToFind = null;

    // If auto is enabled, choose next word after delay
    if (this.auto.value) {
      setTimeout(() => {
        this.autoChooseNextWord();
      }, 300);
    }
  }

  private async autoChooseNextWord(): Promise<void> {
    const waitingWords = this.wordsToFind.filter(w => w.state === 'waiting');
    if (waitingWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * waitingWords.length);
      const nextWord = waitingWords[randomIndex];
      this.setWordChangerToFind(nextWord);
      await this.wordSayer.say(nextWord.word);
    }
  }

  setMessage(message: string): void {
    this.message = message;
    setTimeout(() => {
      this.message = '';
    }, 2000);
  }

  incrementCorrect(): void {
    this.correct++;
    this.tried++;
    this.checkFinished();
  }

  incrementTried(): void {
    this.tried++;
    this.checkFinished();
  }

  private async checkFinished(): Promise<void> {
    if (this.finished) {
      if (this.correct === this.wordsToFind.length) {
        this.setMessage(`Congratulations you got all ${this.wordsToFind.length} words right! 😊😊`);

        // Play a random happy word for perfect score
        if (this.happyWordSayer) {
          const randomIndex = Math.floor(Math.random() * this.celebrationWords.length);
          const celebrationWord = this.celebrationWords[randomIndex];
          await this.happyWordSayer.say(celebrationWord);
        }
      } else {
        this.setMessage(`You got ${this.correct} out of ${this.wordsToFind.length}`);
      }
    }
  }

  retry(): void {
    this.wordChangerToFind = null;
    this.message = '';
    this.correct = 0;
    this.tried = 0;

    this.wordsToFind.forEach(wordToFind => {
      wordToFind.state = 'waiting';
    });
  }

  new(): void {
    if (this.newWordsCallback) {
      const newWords = this.newWordsCallback();
      this.setWords(newWords);
    } else {
      this.retry();
    }
  }

  setWords(words: string[]): void {
    this.words = words.slice();
    this.wordsToFind = this.words.map(word => new WordToFind(this, word));
    this.wordsToChoose = this.words.map(word => new WordToChoose(this, word));
    // Keep the auto setting when setting new words
    this.retry();
  }
}
