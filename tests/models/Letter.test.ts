import { WordInteraction } from '../../src/models/interaction/word-interaction';
import { AppState } from '../../src/models/app-state';
import { createTestAppState } from '../utils/test-app-builder';

describe('Letter', () => {
  let appState: AppState;
  let currentWord: WordInteraction;

  beforeEach(() => {
    // Create AppState with WordSayerTestDouble
    appState = createTestAppState();

    // Create WordInteraction using Word from WordGraph
    const catWord = appState.wordGraph.getRequiredWord('cat');
    currentWord = new WordInteraction(catWord, appState.newWordHandler, appState.wordSayer, appState.menuManager, appState.history);
  });

  it('should initialize with the correct properties', () => {
    // Use the first letter from the word
    const letter = currentWord.letterInteractions[0].letter;

    expect(letter.value).toBe('c');
    expect(letter.position).toBe(0);
    expect(letter.canDelete).toBeDefined();
    expect(letter.canReplace).toBeDefined();
  });

  it('should provide replacement options when replacements are possible', () => {
    const letter = currentWord.letterInteractions[0].letter;

    if (letter.canReplace) {
      expect(letter.replacements.length).toBeGreaterThan(0);
      // Replace options should be strings
      letter.replacements.forEach(option => {
        expect(typeof option).toBe('string');
        expect(option.length).toBe(1);
      });
    }
  });

  it('should have correct position values for all letters', () => {
    // Check all letters have correct positions
    currentWord.letterInteractions.forEach((letterInteraction, index) => {
      expect(letterInteraction.letter.position).toBe(index);
    });
  });

  it('should have changes property', () => {
    const letter = currentWord.letterInteractions[0].letter;
    expect(letter.changes).toBeDefined();
    expect(letter.changes.deleteChange).toBeDefined();
    expect(letter.changes.replaceChanges).toBeDefined();
  });
});
