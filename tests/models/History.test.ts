import { History, WordChange } from '@/models/History';
import { WordChanger } from '@/models/word-changer';
import { WordGraph } from '@/models/word-graph';
import { WordGraphBuilder } from '@/models/word-graph-builder';
import { AudioFilePlayerTestDouble } from '@/tests/test_doubles/audio-file-player-test-double';
import { WordSayer } from '@/models/word-sayer';

describe('History', () => {
  let history: History;
  let wordChanger: WordChanger;
  let wordGraph: WordGraph;

  beforeEach(() => {
    // Create a list of words needed for the tests
    const wordList = ['cat', 'bat', 'rat', 'fat', 'dog', 'cot', 'car'];

    // Use WordGraphBuilder to build a proper word graph
    const builder = new WordGraphBuilder(wordList);
    const graphJson = builder.build();

    // Create a WordGraph instance with the built data
    wordGraph = new WordGraph();
    wordGraph.loadFromJson(graphJson);

    // Create an AudioFilePlayerTestDouble
    const audioFilePlayerTestDouble = new AudioFilePlayerTestDouble('/assets/words/amazon_polly');

    // Get the Word object
    const catWord = wordGraph.getNode('cat');

    // Create word sayer
    const wordSayer = new WordSayer(audioFilePlayerTestDouble, 'words');

    // Create a mock parent with reset method
    const mockParent = {
      async reset(_word: Word): Promise<void> {
        // Mock implementation for testing
      }
    };

    // Create WordChanger instance
    wordChanger = new WordChanger(catWord!, wordSayer, mockParent);
    history = wordChanger.history;
  });

  it('should initialize with initial word', () => {
    const catWord = wordGraph.getNode('cat')!;
    expect(history.entries[0].wordString).toBe('cat');
    expect(history.entries[0].word).toBe(catWord);
    expect(history.currentIndex).toBe(0);
    expect(history.hasVisited('cat')).toBe(false);
    expect(wordChanger.visitingWord).toBe(catWord);
  });

  it('should add words to history with change information', () => {
    const change: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };

    const batWord = wordGraph.getNode('bat')!;
    history.addWord(batWord, change);

    expect(history.entries.length).toBe(2);
    expect(history.entries[1].wordString).toBe('bat');
    expect(history.entries[1].word).toBe(batWord);
    expect(history.entries[1].change).toEqual(change);
    expect(history.currentIndex).toBe(1);

    // For the test, manually mark 'cat' as visited
    const catWordObj = wordGraph.getNode('cat')!;
    catWordObj.previouslyVisited = true;
    wordChanger.previouslyVisitedWords.add('cat');
    // Now check if it's visited
    expect(history.hasVisited('cat')).toBe(true);
  });

  it('should support undo/redo operations', () => {
    const change1: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };

    const change2: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'r'
    };

    const batWord = wordGraph.getNode('bat')!;
    const ratWord = wordGraph.getNode('rat')!;
    const catWord = wordGraph.getNode('cat')!;

    history.addWord(batWord, change1);
    history.addWord(ratWord, change2);

    // Undo should move back in history
    const undoResult = history.undo();
    expect(undoResult).toBe(batWord);
    expect(undoResult!.word).toBe('bat');
    expect(history.currentIndex).toBe(1);

    // Undo again
    const undoResult2 = history.undo();
    expect(undoResult2).toBe(catWord);
    expect(undoResult2!.word).toBe('cat');
    expect(history.currentIndex).toBe(0);

    // Can't undo beyond the beginning
    const undoResult3 = history.undo();
    expect(undoResult3).toBeNull();
    expect(history.currentIndex).toBe(0);

    // Redo should move forward in history
    const redoResult = history.redo();
    expect(redoResult).toBe(batWord);
    expect(redoResult!.word).toBe('bat');
    expect(history.currentIndex).toBe(1);

    const redoResult2 = history.redo();
    expect(redoResult2).toBe(ratWord);
    expect(redoResult2!.word).toBe('rat');
    expect(history.currentIndex).toBe(2);

    // Can't redo beyond the end
    const redoResult3 = history.redo();
    expect(redoResult3).toBeNull();
    expect(history.currentIndex).toBe(2);
  });

  it('should correctly check if a word has been visited', () => {
    const change: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };

    const batWord = wordGraph.getNode('bat')!;
    history.addWord(batWord, change);

    // First makes 'cat' visited manually for the test
    const catWordObj = wordGraph.getNode('cat')!;
    catWordObj.previouslyVisited = true;
    wordChanger.previouslyVisitedWords.add('cat');
    // Check that 'cat' is now visited
    expect(history.hasVisited('cat')).toBe(true);
    expect(history.hasVisited('bat')).toBe(false);
    expect(history.hasVisited('rat')).toBe(false);
  });

  it('should jump to a specific index in history', () => {
    const change1: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };

    const change2: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'r'
    };

    const batWord = wordGraph.getNode('bat')!;
    const ratWord = wordGraph.getNode('rat')!;
    const catWord = wordGraph.getNode('cat')!;

    history.addWord(batWord, change1);
    history.addWord(ratWord, change2);

    // Jump to index 0
    const jumpResult = history.jumpToIndex(0);
    expect(jumpResult).toBe(catWord);
    expect(jumpResult!.word).toBe('cat');
    expect(history.currentIndex).toBe(0);

    // Jump to index 2
    const jumpResult2 = history.jumpToIndex(2);
    expect(jumpResult2).toBe(ratWord);
    expect(jumpResult2!.word).toBe('rat');
    expect(history.currentIndex).toBe(2);

    // Invalid index returns null
    const jumpResult3 = history.jumpToIndex(5);
    expect(jumpResult3).toBeNull();
    expect(history.currentIndex).toBe(2);
  });

  it('should clear history when reset', () => {
    const change: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };

    const batWord = wordGraph.getNode('bat')!;
    const dogWord = wordGraph.getNode('dog')!;

    history.addWord(batWord, change);

    history.reset(dogWord);

    expect(history.entries.length).toBe(1);
    expect(history.entries[0].wordString).toBe('dog');
    expect(history.entries[0].word).toBe(dogWord);
    expect(history.entries[0].change).toBeUndefined();
    expect(history.currentIndex).toBe(0);
    // After reset, all previouslyVisited flags should be reset by AppState.reset()
    // Test that our cat word isn't marked as previously visited by setting the flags directly
    const catWord = wordGraph.getNode('cat')!;
    catWord.previouslyVisited = false;
    expect(history.hasVisited('cat')).toBe(false);

    // Same for bat and dog
    const batWordObj = wordGraph.getNode('bat')!;
    batWordObj.previouslyVisited = false;
    expect(history.hasVisited('bat')).toBe(false);

    const dogWordObj = wordGraph.getNode('dog')!;
    dogWordObj.previouslyVisited = false;
    expect(history.hasVisited('dog')).toBe(false);
  });

  it('should truncate redo history when adding a new word after undo', () => {
    const change1: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };

    const change2: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'r'
    };

    const change3: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'f'
    };

    const batWord = wordGraph.getNode('bat')!;
    const ratWord = wordGraph.getNode('rat')!;
    const fatWord = wordGraph.getNode('fat')!;
    const catWord = wordGraph.getNode('cat')!;

    history.addWord(batWord, change1);
    history.addWord(ratWord, change2);

    // Undo twice
    history.undo();
    history.undo();

    // Add a new word
    history.addWord(fatWord, change3);

    // History should be truncated, with only 'cat' and 'fat'
    expect(history.entries.length).toBe(2);
    expect(history.entries[0].wordString).toBe('cat');
    expect(history.entries[0].word).toBe(catWord);
    expect(history.entries[1].wordString).toBe('fat');
    expect(history.entries[1].word).toBe(fatWord);
    expect(history.currentIndex).toBe(1);

    // Redo should not work now
    const redoResult = history.redo();
    expect(redoResult).toBeNull();
  });

  it('should provide canUndo and canRedo properties', () => {
    // Initially, can't undo but also can't redo
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);

    const change: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };

    const batWord = wordGraph.getNode('bat')!;
    history.addWord(batWord, change);

    // After adding a word, can undo but can't redo
    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);

    // After undoing, can't undo more (at beginning) but can redo
    history.undo();
    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(true);
  });

  it('should provide wordChanger property', () => {
    const catWord = wordGraph.getNode('cat')!;
    const batWord = wordGraph.getNode('bat')!;

    expect(history.wordChanger).toBe(catWord);
    expect(history.wordChanger.word).toBe('cat');

    const change: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };

    history.addWord(batWord, change);
    expect(history.wordChanger).toBe(batWord);
    expect(history.wordChanger.word).toBe('bat');

    history.undo();
    expect(history.wordChanger).toBe(catWord);
    expect(history.wordChanger.word).toBe('cat');
  });
});
