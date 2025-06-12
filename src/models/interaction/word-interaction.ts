import { makeObservable, observable, computed, action } from 'mobx';
import { LetterInteraction } from '@/models/interaction/letter-interaction';
import { PositionInteraction } from '@/models/interaction/position-interaction';
import { Word } from '@/models/Word';
import { Letter } from '@/models/Letter';
import { Position } from '@/models/Position';
import { MenuManager } from '@/lib/views/menu-manager';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { History } from '@/models/History';

/**
 * Model representing the user's current interaction with a word
 */
export class WordInteraction {
  // The word property is now defined in the constructor

  // Array of letter interactions
  letterInteractions: LetterInteraction[] = [];

  // Array of position interactions
  positionInteractions: PositionInteraction[] = [];

  // For backward compatibility - get the underlying letters
  get letters(): Letter[] {
    return this.letterInteractions.map(interaction => interaction.letter);
  }

  // For backward compatibility - get the underlying positions
  get positions(): Position[] {
    return this.positionInteractions.map(interaction => interaction.position);
  }

  constructor(
    // The Word object this interaction is for
    public word: Word,

    // Handler function for setting new words
    public readonly newWordHandler: (word: Word) => void,

    // Word sayer for audio pronunciation
    public readonly wordSayer: WordSayerInterface,

    // Reference to the menu manager
    public readonly menuManager: MenuManager,

    // History model for compact history view
    public readonly history: History
  ) {
    // Initialize letter and position interactions
    this.initializeInteractions();

    // Use makeObservable instead of makeAutoObservable for classes with inheritance
    makeObservable(this, {
      word: observable,
      letterInteractions: observable,
      positionInteractions: observable,
      letters: computed,
      positions: computed,
      value: computed,
      updateWord: action,
      closeAllMenus: action,
      say: action,
      setNewWord: action
    });
  }

  /**
   * Initialize the letter and position interactions for this word
   */
  private initializeInteractions(): void {
    // Get the base Letter and Position objects from the word
    const letters = this.word.letters;
    const positions = this.word.positions;

    // Create interaction wrappers for each
    this.letterInteractions = letters.map(
      letter => new LetterInteraction(letter, this.newWordHandler, this.menuManager)
    );

    this.positionInteractions = positions.map(
      position => new PositionInteraction(position, this.newWordHandler, this.menuManager)
    );
  }

  /**
   * Update to a new word
   */
  updateWord(word: Word): void {
    this.word = word;

    // Reinitialize interactions for the new word
    this.initializeInteractions();
  }

  /**
   * Get the word changer value
   */
  get value(): string {
    return this.word.word;
  }

  /**
   * Close any open menus
   */
  closeAllMenus(): void {
    this.letterInteractions.forEach(interaction => {
      interaction.isReplaceMenuOpen = false;
    });

    this.positionInteractions.forEach(interaction => {
      interaction.isInsertMenuOpen = false;
    });
  }

  getActivePositionInteraction(index : number): PositionInteraction | null {
    let positionInteraction: PositionInteraction | null = null;
    if (index < this.positionInteractions.length) {
      positionInteraction = this.positionInteractions[index];
      if (!positionInteraction.position.canInsert) {
        positionInteraction = null;
      }
    }
    return positionInteraction;
  }

  getActiveLetterInteraction(index : number): LetterInteraction | null {
    return index < this.letterInteractions.length ? this.letterInteractions[index] : null;
  }

  /**
   * Say the word changer using the wordSayer
   */
  async say(): Promise<void> {
    // Use the wordSayer to play the audio for this word
    await this.wordSayer.say(this.word.word);
  }

  /**
   * Set a new word for the application
   * @param wordObj The Word object to set as the new word
   */
  setNewWord(wordObj: Word): void {
    // Use the newWordHandler to set the new word
    this.newWordHandler(wordObj);
  }
}
