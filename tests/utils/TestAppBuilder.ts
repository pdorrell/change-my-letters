import { createTestWordGraph, testWordLists } from './TestWordGraphBuilder';
import { WordSayerTestDouble } from '../test_doubles/WordSayerTestDouble';
import { AppState } from '../../src/models/AppState';

/**
 * Creates a test AppState with WordSayerTestDouble and minimal word graph
 */
export function createTestAppState(): AppState {
  const wordGraph = createTestWordGraph(testWordLists.minimal);
  const wordSayerTestDouble = new WordSayerTestDouble();
  
  // Get the first word from the test word graph as initial word
  const initialWord = Array.from(wordGraph.words)[0];
  
  return new AppState(initialWord, wordGraph, 'test-version', wordSayerTestDouble);
}