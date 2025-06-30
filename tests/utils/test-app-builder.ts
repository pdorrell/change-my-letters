import { createTestWordGraph, testWordLists } from '@/tests/utils/test-word-graph-builder';
import { AudioFilePlayerTestDouble } from '@/tests/test_doubles/audio-file-player-test-double';
import { AudioFilePlayerInterface } from '@/models/audio/audio-file-player-interface';
import { AppState } from '@/models/app-state';
import { WordChanger } from '@/models/changer/word-changer';
import { WordSayer } from '@/models/word-sayer';
import { Word } from '@/models/Word';

/**
 * Creates a test AppState with AudioFilePlayerTestDouble and minimal word graph
 */
export function createTestAppState(audioFilePlayer?: AudioFilePlayerInterface): AppState {
  const wordGraph = createTestWordGraph(testWordLists.minimal);
  const audioFilePlayerToUse = audioFilePlayer || new AudioFilePlayerTestDouble('/assets/words/amazon_polly');

  // Get the first word from the test word graph as initial word
  const initialWordString = Array.from(wordGraph.words)[0];

  return new AppState(initialWordString, wordGraph, 'test-version', audioFilePlayerToUse);
}

/**
 * Creates a test WordChanger with AudioFilePlayerTestDouble and minimal word graph
 */
export function createTestWordChanger(audioFilePlayer?: AudioFilePlayerInterface): WordChanger {
  const wordGraph = createTestWordGraph(testWordLists.minimal);
  const audioFilePlayerToUse = audioFilePlayer || new AudioFilePlayerTestDouble('/assets/words/amazon_polly');

  // Get the first word from the test word graph as initial word
  const initialWordString = Array.from(wordGraph.words)[0];
  const initialWord = wordGraph.getNode(initialWordString)!;

  // Create a word sayer for the word changer
  const wordSayer = new WordSayer(audioFilePlayerToUse, 'words');

  // Create a mock parent with reset method
  const mockParent = {
    async reset(_word: Word): Promise<void> {
      // Mock implementation for testing
    }
  };

  return new WordChanger(initialWord, wordSayer, mockParent);
}
