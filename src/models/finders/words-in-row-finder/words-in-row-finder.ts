import { makeAutoObservable, computed } from 'mobx';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { ValueModel } from '@/lib/models/value-models';
import { ButtonAction } from '@/lib/models/actions';
import { RangeSelectable } from '@/lib/models/range-selectable';
import { LettersRow } from './letters-row';
import { WordsToFind } from './words-to-find';
import { WordToFind } from './word-to-find';
import { DifficultyType } from './types';
import { getRandomNegativeWord } from '@/lib/util';

export class WordsInRowFinder implements RangeSelectable {
  wordSayer: WordSayerInterface;
  difficulty: ValueModel<DifficultyType>;
  forwardsOnly: ValueModel<boolean>;
  auto: ValueModel<boolean>;
  lettersRow: LettersRow;
  wordsToFind: WordsToFind;
  taskStarted: boolean = false;
  newWordsCallback?: () => string[];
  autoTimeoutId: number | null = null;

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

    this.auto = new ValueModel<boolean>(
      false,
      'Auto',
      'If checked, automatically selects the next word after finding one correctly'
    );

    this.lettersRow = new LettersRow();
    this.wordsToFind = new WordsToFind(words);

    makeAutoObservable(this, {
      canChangeSettings: computed,
      newAction: computed,
      showNewButton: computed,
      canSelect: computed
    });
  }

  get canChangeSettings(): boolean {
    // Can change settings before task starts or after completion
    if (!this.taskStarted || this.wordsToFind.completed) {
      return true;
    }

    // During task: can't change settings if user is actively trying to find a word
    const activeWord = this.wordsToFind.activeWord;
    if (activeWord && activeWord.found !== true) {
      return false;
    }

    // During task: can change settings if no active word or active word was found
    return true;
  }

  get canSelect(): boolean {
    return !this.lettersRow.interactionsDisabled;
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

    // Clear any pending auto-selection since user is manually selecting
    this.clearAutoSelection();

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

  startSelection(position: number): void {
    if (!this.wordsToFind.activeWord) return;

    // Clear wrong state when starting a new selection
    if (this.wordsToFind.activeWord.found === false) {
      this.wordsToFind.activeWord.found = null;
    }

    this.lettersRow.startSelection(position, this.forwardsOnly.value);
  }

  updateSelection(endPosition: number): void {
    this.lettersRow.updateSelection(endPosition);
  }

  async finishSelection(): Promise<void> {
    if (!this.lettersRow.selectionState || !this.wordsToFind.activeWord) {
      this.lettersRow.clearSelection();
      return;
    }

    const isCorrect = this.lettersRow.checkSelectedWord();

    if (isCorrect) {
      this.wordsToFind.markActiveWordCorrect();
      this.lettersRow.markSelectionCorrect();
      this.scheduleAutoSelection();
    } else {
      this.wordsToFind.markActiveWordWrong();
      this.lettersRow.markSelectionWrong();
      // Say a negative word for incorrect selection
      const negativeWord = getRandomNegativeWord();
      await this.wordSayer.say(negativeWord);
    }
  }

  clearSelection(): void {
    this.lettersRow.clearSelection();
  }

  private scheduleAutoSelection(): void {
    // Clear any existing timeout
    this.clearAutoSelection();

    // Only schedule if auto is enabled and there are more words to find
    if (!this.auto.value || this.wordsToFind.completed) {
      return;
    }

    this.autoTimeoutId = window.setTimeout(() => {
      this.autoTimeoutId = null;
      this.performAutoSelection();
    }, 1000);
  }

  private clearAutoSelection(): void {
    if (this.autoTimeoutId !== null) {
      clearTimeout(this.autoTimeoutId);
      this.autoTimeoutId = null;
    }
  }

  private async performAutoSelection(): Promise<void> {
    const randomWord = this.wordsToFind.randomUnfoundWord;
    if (randomWord) {
      await this.selectWordToFind(randomWord);
    }
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
    this.clearAutoSelection();
    this.taskStarted = false;
    this.wordsToFind.reset();
    this.lettersRow.clearSelection();
    this.lettersRow.letters = null;
    this.lettersRow.word = '';
    this.lettersRow.correctSelection = null;
    this.lettersRow.wrongSelection = null;
    this.lettersRow.correctSelectionStart = null;
    this.lettersRow.wrongSelectionStart = null;
  }

  destroy(): void {
    this.clearAutoSelection();
    this.wordsToFind.destroy();
  }
}
