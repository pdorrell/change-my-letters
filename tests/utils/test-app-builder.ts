import { createTestWordGraph, testWordLists } from '@/tests/utils/test-word-graph-builder';
import { WordSayerTestDouble } from '@/tests/test_doubles/word-sayer-test-double';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { AppState } from '@/models/app-state';

/**
 * Creates a test AppState with WordSayerTestDouble and minimal word graph
 */
export function createTestAppState(wordSayer?: WordSayerInterface): AppState {
  const wordGraph = createTestWordGraph(testWordLists.minimal);
  const wordSayerToUse = wordSayer || new WordSayerTestDouble();

  // Get the first word from the test word graph as initial word
  const initialWord = Array.from(wordGraph.words)[0];

  return new AppState(initialWord, wordGraph, 'test-version', wordSayerToUse, wordSayerToUse);
}
