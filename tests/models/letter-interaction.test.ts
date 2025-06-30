import { LetterInteraction } from '@/models/interaction/letter-interaction';
import { Letter } from '@/models/Letter';
import { WordChanger } from '@/models/changer/word-changer';
import { createTestWordChanger } from '@/tests/utils/test-app-builder';
import { createTestWordGraph, testWordLists } from '@/tests/utils/test-word-graph-builder';

describe('LetterInteraction', () => {
  let letter: Letter;
  let wordChanger: WordChanger;
  let letterInteraction: LetterInteraction;

  beforeEach(() => {
    // Create WordChanger with AudioFilePlayerTestDouble
    wordChanger = createTestWordChanger();

    // Create WordInteraction using Word from WordGraph
    const wordGraph = createTestWordGraph(testWordLists.minimal);
    const catWord = wordGraph.getRequiredWord('cat');

    // Get the first letter ('c')
    letter = catWord.letters[0];

    // Create the letter interaction to test
    letterInteraction = new LetterInteraction(letter, wordChanger.newWordHandler, wordChanger.menuManager);
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
