import { WordInteraction } from '@/models/interaction/word-interaction';
import { WordChanger } from '@/models/changer/word-changer';
import { MenuManager } from '@/lib/views/menu-manager';
import { createTestWordChanger } from '@/tests/utils/test-app-builder';
import { createTestWordGraph, testWordLists } from '@/tests/utils/test-word-graph-builder';

describe('WordInteraction', () => {
  let wordChanger: WordChanger;
  let menuManager: MenuManager;

  beforeEach(() => {
    // Create WordChanger with test data
    wordChanger = createTestWordChanger();
    menuManager = wordChanger.menuManager;
  });

  it('should initialize correctly with a word', () => {
    const wordGraph = createTestWordGraph(testWordLists.minimal);
    const wordObj = wordGraph.getRequiredWord('cat');
    const wordInteractionLocal = new WordInteraction(wordObj, wordChanger.newWordHandler, wordChanger.wordSayer, menuManager);

    expect(wordInteractionLocal.value).toBe('cat');
    expect(wordInteractionLocal.word).toBe(wordObj);

    // Should have 3 letterInteractions for 'cat'
    expect(wordInteractionLocal.letterInteractions.length).toBe(3);

    // Should have 4 positionInteractions (before, between, and after letters)
    expect(wordInteractionLocal.positionInteractions.length).toBe(4);
  });

  it('should update word value and related properties', () => {
    const wordGraph = createTestWordGraph(testWordLists.minimal);
    const catWord = wordGraph.getRequiredWord('cat');
    const batWord = wordGraph.getRequiredWord('bat');
    const wordInteractionLocal = new WordInteraction(catWord, wordChanger.newWordHandler, wordChanger.wordSayer, menuManager);
    wordInteractionLocal.updateWord(batWord);

    expect(wordInteractionLocal.value).toBe('bat');
    expect(wordInteractionLocal.word).toBe(batWord);

    // Should have 3 letterInteractions
    expect(wordInteractionLocal.letterInteractions.length).toBe(3);

    // Should still have 4 positionInteractions
    expect(wordInteractionLocal.positionInteractions.length).toBe(4);
  });

  it('should access letters and positions via getters', () => {
    const word = createTestWordGraph(testWordLists.minimal).getRequiredWord('cat');
    const wordInteractionLocal = new WordInteraction(word, wordChanger.newWordHandler, wordChanger.wordSayer, menuManager);

    // letters and positions are getters that map from interactions
    expect(wordInteractionLocal.letters.length).toBe(3);
    expect(wordInteractionLocal.positions.length).toBe(4);
  });

  it('should handle different word lengths when updating', () => {
    const catWord = createTestWordGraph(testWordLists.minimal).getRequiredWord('cat');
    const canWord = createTestWordGraph(testWordLists.minimal).getRequiredWord('can');
    const atWord = createTestWordGraph(testWordLists.minimal).getRequiredWord('at'); // 2-letter word from deletion

    const wordInteractionLocal = new WordInteraction(catWord, wordChanger.newWordHandler, wordChanger.wordSayer, menuManager);

    // Update to same length word
    wordInteractionLocal.updateWord(canWord);
    expect(wordInteractionLocal.letterInteractions.length).toBe(3);
    expect(wordInteractionLocal.positionInteractions.length).toBe(4);

    // Update to shorter word
    wordInteractionLocal.updateWord(atWord);
    expect(wordInteractionLocal.letterInteractions.length).toBe(2);
    expect(wordInteractionLocal.positionInteractions.length).toBe(3);
  });
});
