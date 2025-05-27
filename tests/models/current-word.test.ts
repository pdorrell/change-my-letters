import { WordInteraction } from '../../src/models/interaction/word-interaction';
import { AppState } from '../../src/models/app-state';
import { Word } from '../../src/models/word';
import { MenuManager } from '../../src/models/menu-manager';
import { createTestAppState } from '../utils/test-app-builder';


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
    const currentWord = new WordInteraction(wordObj, appState.newWordHandler, appState.wordSayer, menuManager, appState.history);

    expect(currentWord.value).toBe('cat');
    expect(currentWord.word).toBe(wordObj);

    // Should have 3 letterInteractions for 'cat'
    expect(currentWord.letterInteractions.length).toBe(3);
    
    // Should have 4 positionInteractions (before, between, and after letters)
    expect(currentWord.positionInteractions.length).toBe(4);
  });

  it('should update word value and related properties', () => {
    const catWord = appState.wordGraph.getRequiredWord('cat');
    const batWord = appState.wordGraph.getRequiredWord('bat');
    const currentWord = new WordInteraction(catWord, appState.newWordHandler, appState.wordSayer, menuManager, appState.history);
    currentWord.updateWord(batWord);

    expect(currentWord.value).toBe('bat');
    expect(currentWord.word).toBe(batWord);

    // Should have 3 letterInteractions
    expect(currentWord.letterInteractions.length).toBe(3);
    
    // Should still have 4 positionInteractions
    expect(currentWord.positionInteractions.length).toBe(4);
  });

  it('should access letters and positions via getters', () => {
    const word = appState.wordGraph.getRequiredWord('cat');
    const currentWord = new WordInteraction(word, appState.newWordHandler, appState.wordSayer, menuManager, appState.history);

    // letters and positions are getters that map from interactions
    expect(currentWord.letters.length).toBe(3);
    expect(currentWord.positions.length).toBe(4);
  });

  it('should handle different word lengths when updating', () => {
    const catWord = appState.wordGraph.getRequiredWord('cat');
    const canWord = appState.wordGraph.getRequiredWord('can');
    const atWord = appState.wordGraph.getRequiredWord('at'); // 2-letter word from deletion
    
    const currentWord = new WordInteraction(catWord, appState.newWordHandler, appState.wordSayer, menuManager, appState.history);

    // Update to same length word
    currentWord.updateWord(canWord);
    expect(currentWord.letterInteractions.length).toBe(3);
    expect(currentWord.positionInteractions.length).toBe(4);

    // Update to shorter word
    currentWord.updateWord(atWord);
    expect(currentWord.letterInteractions.length).toBe(2);
    expect(currentWord.positionInteractions.length).toBe(3);
  });
});