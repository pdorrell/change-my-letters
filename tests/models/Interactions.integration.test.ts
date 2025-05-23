import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { LetterInteraction } from '../../src/models/interaction/LetterInteraction';
import { PositionInteraction } from '../../src/models/interaction/PositionInteraction';
import { Letter } from '../../src/models/Letter';
import { Position } from '../../src/models/Position';
import { Word } from '../../src/models/Word';
import { AppState } from '../../src/models/AppState';
import { MenuManager } from '../../src/models/MenuManager';
import { createTestAppState } from '../utils/TestAppBuilder';


describe('Interaction Classes Integration', () => {
  let appState: AppState;
  let wordInteraction: WordInteraction;

  beforeEach(() => {
    // Create a real AppState with test data
    appState = createTestAppState();

    // Use the WordInteraction that's already created by AppState
    wordInteraction = appState.currentWord;
  });

  it('should initialize with all menus closed', () => {
    // Check all letter interactions
    for (const letterInteraction of wordInteraction.letterInteractions) {
      expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    }

    // Check all position interactions
    for (const positionInteraction of wordInteraction.positionInteractions) {
      expect(positionInteraction.isInsertMenuOpen).toBe(false);
    }
  });

  it('should allow opening a letter replace menu', () => {
    // Open the first letter's replace menu directly
    wordInteraction.letterInteractions[0].isReplaceMenuOpen = true;

    expect(wordInteraction.letterInteractions[0].isReplaceMenuOpen).toBe(true);

    // Other letter menus should still be closed (cat has 3 letters)
    expect(wordInteraction.letterInteractions[1].isReplaceMenuOpen).toBe(false);
    expect(wordInteraction.letterInteractions[2].isReplaceMenuOpen).toBe(false);

    // All position menus should still be closed
    for (const positionInteraction of wordInteraction.positionInteractions) {
      expect(positionInteraction.isInsertMenuOpen).toBe(false);
    }
  });

  it('should allow opening a position insert menu', () => {
    // Open the first position's insert menu directly
    wordInteraction.positionInteractions[0].isInsertMenuOpen = true;

    expect(wordInteraction.positionInteractions[0].isInsertMenuOpen).toBe(true);

    // Other position menus should still be closed (cat has 4 positions: before c, between c-a, between a-t, after t)
    expect(wordInteraction.positionInteractions[1].isInsertMenuOpen).toBe(false);
    expect(wordInteraction.positionInteractions[2].isInsertMenuOpen).toBe(false);
    expect(wordInteraction.positionInteractions[3].isInsertMenuOpen).toBe(false);

    // All letter menus should still be closed
    for (const letterInteraction of wordInteraction.letterInteractions) {
      expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    }
  });

  it('should close all menus when wordInteraction.closeAllMenus is called', () => {
    // Open some menus directly
    wordInteraction.letterInteractions[0].isReplaceMenuOpen = true;
    wordInteraction.positionInteractions[0].isInsertMenuOpen = true;

    // Verify they're open
    expect(wordInteraction.letterInteractions[0].isReplaceMenuOpen).toBe(true);
    expect(wordInteraction.positionInteractions[0].isInsertMenuOpen).toBe(true);

    // Close all menus
    wordInteraction.closeAllMenus();

    // Verify all menus are closed
    for (const letterInteraction of wordInteraction.letterInteractions) {
      expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    }

    for (const positionInteraction of wordInteraction.positionInteractions) {
      expect(positionInteraction.isInsertMenuOpen).toBe(false);
    }
  });

  it('should close all menus when appState.closeAllMenus is called', () => {
    // Open some menus directly
    wordInteraction.letterInteractions[0].isReplaceMenuOpen = true;
    wordInteraction.positionInteractions[0].isInsertMenuOpen = true;

    // Verify they're open
    expect(wordInteraction.letterInteractions[0].isReplaceMenuOpen).toBe(true);
    expect(wordInteraction.positionInteractions[0].isInsertMenuOpen).toBe(true);

    // Close all menus via appState
    appState.menuManager.closeMenus();

    // Verify all menus are closed
    for (const letterInteraction of wordInteraction.letterInteractions) {
      expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    }

    for (const positionInteraction of wordInteraction.positionInteractions) {
      expect(positionInteraction.isInsertMenuOpen).toBe(false);
    }

    // Verify all menus are still closed after calling closeAllMenus
    // (This tests the functionality rather than mock calls)
  });

  it('should recreate interactions when the word changes', () => {
    // Open a menu on the current word directly
    wordInteraction.letterInteractions[0].isReplaceMenuOpen = true;
    expect(wordInteraction.letterInteractions[0].isReplaceMenuOpen).toBe(true);

    // Store references to the current interaction objects
    const oldLetterInteractions = [...wordInteraction.letterInteractions];
    const oldPositionInteractions = [...wordInteraction.positionInteractions];

    // Update the word to a different word from the graph
    const newNode = appState.wordGraph.getRequiredWord('bat');
    wordInteraction.updateWord(newNode);

    // Verify the interactions are new objects
    for (let i = 0; i < wordInteraction.letterInteractions.length; i++) {
      expect(wordInteraction.letterInteractions[i]).not.toBe(oldLetterInteractions[i]);
    }

    for (let i = 0; i < wordInteraction.positionInteractions.length; i++) {
      if (i < oldPositionInteractions.length) {
        expect(wordInteraction.positionInteractions[i]).not.toBe(oldPositionInteractions[i]);
      }
    }

    // Verify all menus are closed in the new word
    for (const letterInteraction of wordInteraction.letterInteractions) {
      expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    }

    for (const positionInteraction of wordInteraction.positionInteractions) {
      expect(positionInteraction.isInsertMenuOpen).toBe(false);
    }
  });
});
