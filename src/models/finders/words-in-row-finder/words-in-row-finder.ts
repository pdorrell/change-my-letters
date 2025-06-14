import { makeAutoObservable, computed } from 'mobx';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { ValueModel } from '@/lib/models/value-models';
import { ButtonAction } from '@/lib/models/actions';
import { LettersRow } from './letters-row';
import { WordsToFind } from './words-to-find';
import { WordToFind } from './word-to-find';
import { DifficultyType } from './types';

export class WordsInRowFinder {
  wordSayer: WordSayerInterface;
  difficulty: ValueModel<DifficultyType>;
  forwardsOnly: ValueModel<boolean>;
  lettersRow: LettersRow;
  wordsToFind: WordsToFind;
  taskStarted: boolean = false;
  newWordsCallback?: () => string[];

  constructor(wordSayer: WordSayerInterface, words: string[] = [], newWordsCallback?: () => string[]) {
    this.wordSayer = wordSayer;
    this.newWordsCallback = newWordsCallback;

    this.difficulty = new ValueModel<DifficultyType>(
      'easy',
      'Difficulty',
      'Easy: random letters. Hard: includes letters from the word'
    );

    this.forwardsOnly = new ValueModel<boolean>(
      true,
      'Forwards only',
      'If checked, words only appear forwards. If unchecked, words can appear backwards too'
    );

    this.lettersRow = new LettersRow();
    this.wordsToFind = new WordsToFind(words);

    makeAutoObservable(this, {
      canChangeSettings: computed,
      newAction: computed,
      showNewButton: computed
    });
  }

  get canChangeSettings(): boolean {
    return !this.taskStarted || this.wordsToFind.completed;
  }

  get newAction(): ButtonAction {
    const handler = this.showNewButton ? () => this.new() : null;
    return new ButtonAction(handler, { tooltip: 'Start with a new set of words' });
  }

  get showNewButton(): boolean {
    return this.wordsToFind.completed;
  }

  async selectWordToFind(wordToFind: WordToFind): Promise<void> {
    if (!wordToFind.canClick) return;

    if (!this.taskStarted) {
      this.taskStarted = true;
    }

    const wasAlreadyActive = this.wordsToFind.activeWord === wordToFind;
    this.wordsToFind.setActiveWord(wordToFind);

    // Only populate the letters row if this is a new active word
    if (!wasAlreadyActive) {
      this.lettersRow.populate(
        wordToFind.word,
        this.difficulty.value,
        this.forwardsOnly.value
      );
    }

    await this.wordSayer.say(wordToFind.word);
  }

  startDrag(position: number): void {
    if (!this.wordsToFind.activeWord) return;

    // Clear wrong state when starting a new drag
    if (this.wordsToFind.activeWord.found === false) {
      this.wordsToFind.activeWord.found = null;
    }

    this.lettersRow.startDrag(position, this.forwardsOnly.value);
  }

  updateDrag(endPosition: number): void {
    this.lettersRow.updateDrag(endPosition);
  }

  finishDrag(): void {
    if (!this.lettersRow.dragState || !this.wordsToFind.activeWord) {
      this.lettersRow.clearDragState();
      return;
    }

    const isCorrect = this.lettersRow.checkDraggedWord();

    if (isCorrect) {
      this.wordsToFind.markActiveWordCorrect();
      this.lettersRow.markSelectionCorrect();
    } else {
      this.wordsToFind.markActiveWordWrong();
      this.lettersRow.markSelectionWrong();
    }
  }

  clearDragSelection(): void {
    this.lettersRow.clearDragState();
  }

  new(): void {
    if (this.newWordsCallback) {
      const newWords = this.newWordsCallback();
      this.setWords(newWords);
    } else {
      this.reset();
    }
  }

  setWords(words: string[]): void {
    this.wordsToFind.destroy();
    this.wordsToFind = new WordsToFind(words);
    this.reset();
  }

  reset(): void {
    this.taskStarted = false;
    this.wordsToFind.reset();
    this.lettersRow.clearDragState();
    this.lettersRow.letters = null;
    this.lettersRow.word = '';
  }

  destroy(): void {
    this.wordsToFind.destroy();
  }
}

