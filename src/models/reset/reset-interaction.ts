import { makeAutoObservable, computed } from 'mobx';
import { AppState } from '@/models/app-state';
import { ButtonAction } from '@/lib/models/actions';
import { Word } from '@/models/Word';
import { Filter } from '@/lib/filter';

/**
 * Model for the Reset page interaction
 */
export class ResetInteraction {
  // Filter for word selection
  filter: Filter;

  // Button actions
  cancelAction: ButtonAction;
  randomAction: ButtonAction;

  // Reference to the app state
  appState: AppState;

  constructor(appState: AppState) {
    this.appState = appState;

    // Initialize filter
    this.filter = new Filter(true);

    // Initialize button actions with tooltips
    this.cancelAction = new ButtonAction(
      () => this.cancel(),
      {
        tooltip: "Return to the current word without changing"
      }
    );
    this.randomAction = new ButtonAction(
      () => this.chooseRandom(),
      {
        tooltip: "Choose a random word from the full list (ignores filter)"
      }
    );

    makeAutoObservable(this, {
      filteredWords: computed,
      cancelAction: false,
      randomAction: false
    });
  }

  /**
   * Get the filtered list of words based on current filter settings
   */
  get filteredWords(): string[] {
    // Get the Word objects from the graph
    const wordObjects = this.appState.wordGraph.sortedWords;
    const allWords = wordObjects.map(wordObj => wordObj.word);

    return this.filter.filtered(allWords);
  }



  /**
   * Reset the state to default values
   */
  reset(): void {
    this.filter.value.set('');
    this.filter.matchStartOnly.set(true);
  }

  /**
   * Choose a random word from the full word list, ignoring current filtering
   */
  chooseRandom(): void {
    const allWordObjects = this.appState.wordGraph.sortedWords;
    if (allWordObjects.length > 0) {
      const randomIndex = Math.floor(Math.random() * allWordObjects.length);
      const randomWordObj = allWordObjects[randomIndex];
      this.setNewWord(randomWordObj);
    }
  }

  /**
   * Set a new word as the current word and reset the history
   */
  setNewWord(wordObj: Word): void {
    // Reset the app state with the new word object
    // This already sets the word as the current visiting word and resets history
    this.appState.reset(wordObj);

    // Navigate back to the word view
    this.appState.navigateTo('wordView');
  }

  /**
   * Cancel the reset operation and return to the word view
   */
  cancel(): void {
    // Navigate back to the word view without changing the current word
    this.appState.navigateTo('wordView');

    // Reset the filter state for next time
    this.reset();
  }
}
