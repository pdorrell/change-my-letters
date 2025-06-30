import { makeAutoObservable, computed } from 'mobx';
import { History, WordStateManager } from '@/views/changer/History';
import { WordInteraction } from '@/models/interaction/word-interaction';
import { Word } from '@/models/Word';
import { ButtonAction } from '@/lib/models/actions';
import { ValueModel } from '@/lib/models/value-models';
import { MenuManager } from '@/lib/views/menu-manager';
import { WordSayerInterface } from '@/models/word-sayer-interface';

/**
 * Model representing the Word Changer page functionality
 * Encapsulates all state and behavior specific to the Word Changer page
 */
export class WordChanger implements WordStateManager {
  // The word interaction model
  wordInteraction: WordInteraction;

  // The word history model
  history: History;

  // Menu manager for closing menus when actions occur
  menuManager: MenuManager;

  // The word we're currently visiting (may differ from word interaction due to undo/redo)
  visitingWord: Word;

  // Set of previously visited words
  previouslyVisitedWords: Set<string> = new Set();

  // Audio settings
  sayImmediately: ValueModel<boolean>;

  // Button actions
  sayAction: ButtonAction;

  // Word sayer for audio pronunciation
  public readonly wordSayer: WordSayerInterface;

  constructor(
    initialWord: Word,
    wordSayer: WordSayerInterface,
    // Parent reference for history callback
    _parentAppState: { reset(word: Word): Promise<void> }
  ) {
    this.wordSayer = wordSayer;

    // Initialize audio settings
    this.sayImmediately = new ValueModel(true, 'Say Immediately', 'Automatically pronounce words when they change');

    // Initialize menu manager first
    this.menuManager = new MenuManager(() => {
      if (this.wordInteraction) {
        this.wordInteraction.closeAllMenus();
      }
    });

    // Initialize visitingWord
    this.visitingWord = initialWord;

    // Initialize history with the initial word object
    this.history = new History(this, initialWord);

    // Initialize the word interaction with the menu manager and history
    this.wordInteraction = new WordInteraction(initialWord, this.newWordHandler, this.wordSayer, this.menuManager, this.history);

    // Initialize button actions
    this.sayAction = new ButtonAction(() => this.wordInteraction.say(), { tooltip: "Say the word" });

    // Preload the initial word's audio
    this.wordSayer.preload(initialWord.word);

    makeAutoObservable(this, {
      undoAction: computed,
      redoAction: computed,
      newWordHandler: computed
    });
  }

  /**
   * Get a handler function for setting new words
   */
  get newWordHandler(): (word: Word) => Promise<void> {
    return async (word: Word) => await this.setNewWord(word);
  }

  /**
   * Set the word interaction without adding to history
   * @param wordObj The Word object to set as the word interaction
   */
  async setWordChanger(wordObj: Word): Promise<void> {
    // Get the word string value
    const word = wordObj.word;

    // Mark current visiting word as visited and add to the set
    if (this.visitingWord) {
      this.visitingWord.previouslyVisited = true;
      this.previouslyVisitedWords.add(this.visitingWord.word);
    }

    // Update visitingWord to the new word
    this.visitingWord = wordObj;

    // Update the word interaction
    this.wordInteraction.updateWord(wordObj);

    // Close any open menus when the word changes
    this.menuManager.closeMenus();

    // Preload the word (in case it's not already loaded)
    this.wordSayer.preload(word);

    // Preload all possible next words
    const possibleNextWords = wordObj.possibleNextWords;
    for (const nextWord of possibleNextWords) {
      this.wordSayer.preload(nextWord);
    }

    // Handle audio playback
    if (this.sayImmediately.value) {
      // Play the new word
      await this.wordInteraction.say();
    }
  }

  /**
   * Set a new word and add it to history
   * @param wordObj The Word object to set as the new word
   */
  async setNewWord(wordObj: Word): Promise<void> {
    // Add the new word to history first
    this.history.addWord(wordObj);

    // Then set it as the word interaction
    await this.setWordChanger(wordObj);
  }

  /**
   * Get undo action (computed)
   */
  get undoAction(): ButtonAction {
    return new ButtonAction(
      this.history.canUndo ? () => this.history.undo() : null,
      { tooltip: "Undo" }
    );
  }

  /**
   * Get redo action (computed)
   */
  get redoAction(): ButtonAction {
    return new ButtonAction(
      this.history.canRedo ? () => this.history.redo() : null,
      { tooltip: "Redo" }
    );
  }

  /**
   * Reset the word changer with a new starting word
   * @param wordObj The new word to start with
   */
  async reset(wordObj: Word): Promise<void> {
    // Clear the visited words set
    this.previouslyVisitedWords.clear();

    // Reset history with the new word
    this.history.reset(wordObj);

    // Set the new word as the current word
    await this.setWordChanger(wordObj);
  }
}
