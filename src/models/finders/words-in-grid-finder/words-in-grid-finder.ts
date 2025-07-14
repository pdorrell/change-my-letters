import { makeAutoObservable, computed } from 'mobx';
import { DifficultyType } from './types';
import { LettersGrid } from './letters-grid';
import { WordsToFind } from '@/models/finders/words-to-find';
import { WordToFind } from '@/models/finders/word-to-find';
import { selectWordsForGrid, populateGrid } from './populate-grid';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { ValueModel } from '@/lib/models/value-models';
import { ButtonAction } from '@/lib/models/actions';
import { EmotionalWordSayer } from '@/models/audio/emotional-word-sayer';
import { HappyOrSad } from '@/models/audio/emotion-types';
import { RangeSelectable } from '@/lib/models/range-selectable';

export class WordsInGridFinder implements RangeSelectable {
  wordSayer: WordSayerInterface;
  emotionalWordSayer: EmotionalWordSayer<HappyOrSad>;
  difficulty: ValueModel<DifficultyType>;
  forwardsOnly: ValueModel<boolean>;
  auto: ValueModel<boolean>;

  wordsToFind: WordsToFind | null = null;
  lettersGrid: LettersGrid | null = null;
  taskStarted: boolean = false;
  newWordsCallback?: () => string[];

  constructor(wordSayer: WordSayerInterface, emotionalWordSayer: EmotionalWordSayer<HappyOrSad>, words: string[] = [], newWordsCallback?: () => string[]) {
    this.wordSayer = wordSayer;
    this.emotionalWordSayer = emotionalWordSayer;
    this.newWordsCallback = newWordsCallback;

    this.difficulty = new ValueModel<DifficultyType>(
      'easy',
      'Difficulty',
      'Easy: random letters. Hard: includes letters from the words'
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

    makeAutoObservable(this, {
      canChangeSettings: computed,
      newAction: computed,
      showNewButton: computed
    });

    // Initialize with words if provided
    if (words.length > 0) {
      this.initializeWithWords(words);
    }
  }

  get canChangeSettings(): boolean {
    // Can change settings before task starts or after completion
    if (!this.taskStarted || this.wordsToFind?.completed) {
      return true;
    }

    // During task: can't change settings if user is actively trying to find a word
    const activeWord = this.wordsToFind?.activeWord;
    if (activeWord && activeWord.found !== true) {
      return false;
    }

    // During task: can change settings if no active word or active word was found
    return true;
  }

  get newAction(): ButtonAction {
    const handler = this.showNewButton ? () => this.new() : null;
    return new ButtonAction(handler, { tooltip: 'Start with a new set of words' });
  }

  get showNewButton(): boolean {
    return this.wordsToFind?.completed ?? false;
  }

  private initializeWithWords(words: string[]): void {
    // Select words for the grid
    const selectedWords = selectWordsForGrid(words);

    // Populate the grid with the selected words
    const populatedGrid = populateGrid(selectedWords, this.difficulty.value, this.forwardsOnly.value);

    // Create the models
    this.wordsToFind = new WordsToFind(selectedWords);
    this.lettersGrid = new LettersGrid(populatedGrid.grid, populatedGrid.placedWords);
  }

  new(): void {
    if (!this.newWordsCallback) {
      throw new Error('WordsInGridFinder not initialized with newWordsCallback');
    }

    // Get all available words and select words for the grid
    const allWords = this.newWordsCallback();
    const selectedWords = selectWordsForGrid(allWords);

    // Populate the grid with the selected words
    const populatedGrid = populateGrid(selectedWords, this.difficulty.value, this.forwardsOnly.value);

    // Create the models
    this.wordsToFind = new WordsToFind(selectedWords);
    this.lettersGrid = new LettersGrid(populatedGrid.grid, populatedGrid.placedWords);

    // Reset task state
    this.taskStarted = false;
  }

  async selectWordToFind(wordToFind: WordToFind): Promise<void> {
    if (!wordToFind.canClick) return;

    if (!this.taskStarted) {
      this.taskStarted = true;
    }

    this.wordsToFind?.setActiveWord(wordToFind);

    // Clear any previous wrong selections
    this.lettersGrid?.clearTemporarySelections();

    // Pronounce the word
    await this.wordSayer.say(wordToFind.word);
  }

  handleGridSelection(selectedText: string): void {
    if (!this.wordsToFind || !this.lettersGrid || !this.wordsToFind.activeWord) {
      return;
    }

    const activeWord = this.wordsToFind.activeWord.word;
    const isCorrect = this.lettersGrid.isWordCorrect(activeWord, selectedText);

    if (isCorrect) {
      // Mark as correct
      this.lettersGrid.markSelectionCorrect(activeWord);
      this.wordsToFind.markActiveWordCorrect();

      // Play success sound only when all words are completed
      if (this.completed) {
        this.emotionalWordSayer.playRandomWord('happy');
      }

      // Auto-advance to next word if enabled
      if (this.auto.value && !this.completed) {
        setTimeout(async () => {
          await this.advanceToNextWord();
        }, 1000);
      }
    } else {
      // Mark as wrong
      this.lettersGrid.markSelectionWrong(activeWord);
      this.wordsToFind.markActiveWordWrong();

      // Play error sound
      this.emotionalWordSayer.playRandomWord('sad');
    }
  }

  private async advanceToNextWord(): Promise<void> {
    if (!this.wordsToFind) return;

    const nextWord = this.wordsToFind.nextUnfoundWord;
    if (nextWord) {
      await this.selectWordToFind(nextWord);
    }
  }

  get completed(): boolean {
    return this.wordsToFind?.completed ?? false;
  }

  reset(): void {
    this.wordsToFind?.reset();
    this.lettersGrid?.reset();
    this.taskStarted = false;
  }

  destroy(): void {
    this.wordsToFind?.destroy();
    this.wordsToFind = null;
    this.lettersGrid = null;
  }

  // RangeSelectable implementation
  get canSelect(): boolean {
    return this.lettersGrid !== null && this.wordsToFind?.activeWord !== null;
  }

  startSelection(index: number): void {
    if (!this.lettersGrid || !this.canSelect) return;

    const position = this.indexToGridPosition(index);
    this.lettersGrid.startSelection(position, this.forwardsOnly.value);
  }

  updateSelection(index: number): void {
    if (!this.lettersGrid || !this.canSelect) return;

    const position = this.indexToGridPosition(index);
    this.lettersGrid.updateSelection(position);
  }

  finishSelection(): void {
    if (!this.lettersGrid || !this.canSelect) return;

    const selectedText = this.lettersGrid.finishSelection();
    if (selectedText) {
      this.handleGridSelection(selectedText);
    }
  }

  clearSelection(): void {
    if (!this.lettersGrid) return;
    this.lettersGrid.cancelSelection();
  }

  // Helper methods for converting between 1D index and 2D grid position
  private indexToGridPosition(index: number): { row: number; col: number } {
    const gridSize = this.lettersGrid?.gridSize || 10;
    return {
      row: Math.floor(index / gridSize),
      col: index % gridSize
    };
  }

  private gridPositionToIndex(row: number, col: number): number {
    const gridSize = this.lettersGrid?.gridSize || 10;
    return row * gridSize + col;
  }
}
