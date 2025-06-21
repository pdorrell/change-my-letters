import { LetterInteraction } from '@/models/interaction/letter-interaction';
import { Letter } from '@/models/Letter';
import { AppState } from '@/models/app-state';
import { createTestAppState } from '@/tests/utils/test-app-builder';


describe('LetterInteraction', () => {
  let letter: Letter;
  let appState: AppState;
  let letterInteraction: LetterInteraction;

  beforeEach(() => {
    // Create AppState with AudioFilePlayerTestDouble
    appState = createTestAppState();

    // Create WordInteraction using Word from WordGraph
    const catWord = appState.wordGraph.getRequiredWord('cat');

    // Get the first letter ('c')
    letter = catWord.letters[0];

    // Create the letter interaction to test
    letterInteraction = new LetterInteraction(letter, appState.newWordHandler, appState.menuManager);
  });

  it('should initialize with correct letter references', () => {
    expect(letterInteraction.letter).toBe(letter);
    expect(letterInteraction.isReplaceMenuOpen).toBe(false);
  });

  it('should be able to control replace menu state', () => {
    // Initially closed
    expect(letterInteraction.isReplaceMenuOpen).toBe(false);

    // Set to open
    letterInteraction.isReplaceMenuOpen = true;
    expect(letterInteraction.isReplaceMenuOpen).toBe(true);

    // Set back to closed
    letterInteraction.isReplaceMenuOpen = false;
    expect(letterInteraction.isReplaceMenuOpen).toBe(false);
  });

  it('should be able to modify the state directly', () => {
    // Set menu open directly
    letterInteraction.isReplaceMenuOpen = true;
    expect(letterInteraction.isReplaceMenuOpen).toBe(true);

    // Set menu closed directly
    letterInteraction.isReplaceMenuOpen = false;
    expect(letterInteraction.isReplaceMenuOpen).toBe(false);
  });
});
