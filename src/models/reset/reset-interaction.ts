import { makeAutoObservable, computed } from 'mobx';
import { AppState } from '@/models/app-state';
import { ButtonAction } from '@/lib/models/actions';
import { Word } from '@/models/Word';
import { Filter } from '@/lib/models/filter';

/**
 * Model for the Reset page interaction
 */
export class ResetInteraction {
  // Filter for word selection
  filter: Filter;

  // Button actions
  randomAction: ButtonAction;

  // Reference to the app state
  appState: AppState;

  constructor(appState: AppState) {
    this.appState = appState;

    // Initialize filter
    this.filter = new Filter('start');

    this.randomAction = new ButtonAction(
      () => this.chooseRandom(),
      {
        tooltip: "Choose a random word from the full list (ignores filter)"
      }
    );

    makeAutoObservable(this, {
      filteredWords: computed,
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
    this.filter.matchOption.set('start');
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
   * Set a new word as the word changer and reset the history
   */
  setNewWord(wordObj: Word): void {
    // Reset the app state with the new word object
    // This already sets the word as the current visiting word and resets history
    this.appState.reset(wordObj);

    // Navigate back to the word view
    this.appState.navigateTo('wordView');
  }

}
