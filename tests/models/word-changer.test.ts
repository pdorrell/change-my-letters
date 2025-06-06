import { WordInteraction } from '@/models/interaction/word-interaction';
import { AppState } from '@/models/app-state';
import { MenuManager } from '@/lib/views/menu-manager';
import { createTestAppState } from '@/tests/utils/test-app-builder';


describe('WordInteraction', () => {
  let appState: AppState;
  let menuManager: MenuManager;

  beforeEach(() => {
    // Create AppState with test data
    appState = createTestAppState();
    menuManager = appState.menuManager;
  });

  it('should initialize correctly with a word', () => {
    const wordObj = appState.wordGraph.getRequiredWord('cat');
    const wordChanger = new WordInteraction(wordObj, appState.newWordHandler, appState.wordSayer, menuManager, appState.history);

    expect(wordChanger.value).toBe('cat');
    expect(wordChanger.word).toBe(wordObj);

    // Should have 3 letterInteractions for 'cat'
    expect(wordChanger.letterInteractions.length).toBe(3);

    // Should have 4 positionInteractions (before, between, and after letters)
    expect(wordChanger.positionInteractions.length).toBe(4);
  });

  it('should update word value and related properties', () => {
    const catWord = appState.wordGraph.getRequiredWord('cat');
    const batWord = appState.wordGraph.getRequiredWord('bat');
    const wordChanger = new WordInteraction(catWord, appState.newWordHandler, appState.wordSayer, menuManager, appState.history);
    wordChanger.updateWord(batWord);

    expect(wordChanger.value).toBe('bat');
    expect(wordChanger.word).toBe(batWord);

    // Should have 3 letterInteractions
    expect(wordChanger.letterInteractions.length).toBe(3);

    // Should still have 4 positionInteractions
    expect(wordChanger.positionInteractions.length).toBe(4);
  });

  it('should access letters and positions via getters', () => {
    const word = appState.wordGraph.getRequiredWord('cat');
    const wordChanger = new WordInteraction(word, appState.newWordHandler, appState.wordSayer, menuManager, appState.history);

    // letters and positions are getters that map from interactions
    expect(wordChanger.letters.length).toBe(3);
    expect(wordChanger.positions.length).toBe(4);
  });

  it('should handle different word lengths when updating', () => {
    const catWord = appState.wordGraph.getRequiredWord('cat');
    const canWord = appState.wordGraph.getRequiredWord('can');
    const atWord = appState.wordGraph.getRequiredWord('at'); // 2-letter word from deletion

    const wordChanger = new WordInteraction(catWord, appState.newWordHandler, appState.wordSayer, menuManager, appState.history);

    // Update to same length word
    wordChanger.updateWord(canWord);
    expect(wordChanger.letterInteractions.length).toBe(3);
    expect(wordChanger.positionInteractions.length).toBe(4);

    // Update to shorter word
    wordChanger.updateWord(atWord);
    expect(wordChanger.letterInteractions.length).toBe(2);
    expect(wordChanger.positionInteractions.length).toBe(3);
  });
});
