import { createTestWordGraph, testWordLists } from './TestWordGraphBuilder';
import { WordSayerTestDouble } from '../test_doubles/WordSayerTestDouble';

/**
 * Creates a test AppState with WordSayerTestDouble and minimal word graph
 */
export function createTestAppState(): any {
  const wordGraph = createTestWordGraph(testWordLists.minimal);
  const wordSayerTestDouble = new WordSayerTestDouble();
  
  return {
    setNewWord: jest.fn(),
    menuManager: {
      activeButtonElement: null,
      toggleMenu: jest.fn(),
      closeMenus: jest.fn()
    },
    wordGraph: wordGraph,
    navigateTo: jest.fn(),
    wordSayer: wordSayerTestDouble,
    history: {
      hasVisited: jest.fn().mockReturnValue(false),
      currentIndex: 0,
      canUndo: false,
      canRedo: false,
      words: []
    }
  };
}