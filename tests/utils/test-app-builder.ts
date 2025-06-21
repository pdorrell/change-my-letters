import { createTestWordGraph, testWordLists } from '@/tests/utils/test-word-graph-builder';
import { AudioFilePlayerTestDouble } from '@/tests/test_doubles/audio-file-player-test-double';
import { AudioFilePlayerInterface } from '@/models/audio/audio-file-player-interface';
import { AppState } from '@/models/app-state';

/**
 * Creates a test AppState with AudioFilePlayerTestDouble and minimal word graph
 */
export function createTestAppState(audioFilePlayer?: AudioFilePlayerInterface): AppState {
  const wordGraph = createTestWordGraph(testWordLists.minimal);
  const audioFilePlayerToUse = audioFilePlayer || new AudioFilePlayerTestDouble('/assets/words/amazon_polly');

  // Get the first word from the test word graph as initial word
  const initialWord = Array.from(wordGraph.words)[0];

  return new AppState(initialWord, wordGraph, 'test-version', audioFilePlayerToUse);
}
