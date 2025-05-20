import { HistoryModel, WordChange } from '../../src/models/HistoryModel';
import { AppState } from '../../src/models/AppState';
import { Word } from '../../src/models/Word';
import { WordGraph } from '../../src/models/WordGraph';
import { WordGraphBuilder } from '../../src/models/WordGraphBuilder';

describe('HistoryModel', () => {
  let historyModel: HistoryModel;
  let appState: AppState;
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
    
    // Create an AppState instance with the word graph
    appState = new AppState('cat', wordGraph, 'test-version');
    
    // Get the Word object
    const catWord = wordGraph.getNode('cat');
    
    // Initialize the history model with AppState and the initial word
    historyModel = new HistoryModel(appState, catWord!);
  });

  it('should initialize with initial word', () => {
    const catWord = appState.wordGraph.getNode('cat')!;
    expect(historyModel.entries[0].wordString).toBe('cat');
    expect(historyModel.entries[0].word).toBe(catWord);
    expect(historyModel.currentIndex).toBe(0);
    expect(historyModel.hasVisited('cat')).toBe(false);
    expect(historyModel.visitingWord).toBe(catWord);
  });

  it('should add words to history with change information', () => {
    const change: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };
    
    const batWord = appState.wordGraph.getNode('bat')!;
    historyModel.addWord(batWord, change);
    
    expect(historyModel.entries.length).toBe(2);
    expect(historyModel.entries[1].wordString).toBe('bat');
    expect(historyModel.entries[1].word).toBe(batWord);
    expect(historyModel.entries[1].change).toEqual(change);
    expect(historyModel.currentIndex).toBe(1);
    
    // 'cat' should now be marked as visited
    expect(historyModel.hasVisited('cat')).toBe(true);
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
    
    const batWord = appState.wordGraph.getNode('bat')!;
    const ratWord = appState.wordGraph.getNode('rat')!;
    const catWord = appState.wordGraph.getNode('cat')!;
    
    historyModel.addWord(batWord, change1);
    historyModel.addWord(ratWord, change2);
    
    // Undo should move back in history
    const undoResult = historyModel.undo();
    expect(undoResult).toBe(batWord);
    expect(undoResult!.word).toBe('bat');
    expect(historyModel.currentIndex).toBe(1);
    
    // Undo again
    const undoResult2 = historyModel.undo();
    expect(undoResult2).toBe(catWord);
    expect(undoResult2!.word).toBe('cat');
    expect(historyModel.currentIndex).toBe(0);
    
    // Can't undo beyond the beginning
    const undoResult3 = historyModel.undo();
    expect(undoResult3).toBeNull();
    expect(historyModel.currentIndex).toBe(0);
    
    // Redo should move forward in history
    const redoResult = historyModel.redo();
    expect(redoResult).toBe(batWord);
    expect(redoResult!.word).toBe('bat');
    expect(historyModel.currentIndex).toBe(1);
    
    const redoResult2 = historyModel.redo();
    expect(redoResult2).toBe(ratWord);
    expect(redoResult2!.word).toBe('rat');
    expect(historyModel.currentIndex).toBe(2);
    
    // Can't redo beyond the end
    const redoResult3 = historyModel.redo();
    expect(redoResult3).toBeNull();
    expect(historyModel.currentIndex).toBe(2);
  });

  it('should correctly check if a word has been visited', () => {
    const change: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };
    
    historyModel.addWord('bat', change);
    
    // First makes 'cat' visited
    // Then the current word 'bat' isn't yet visited
    expect(historyModel.hasVisited('cat')).toBe(true);
    expect(historyModel.hasVisited('bat')).toBe(false);
    expect(historyModel.hasVisited('rat')).toBe(false);
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
    
    const batWord = appState.wordGraph.getNode('bat')!;
    const ratWord = appState.wordGraph.getNode('rat')!;
    const catWord = appState.wordGraph.getNode('cat')!;
    
    historyModel.addWord(batWord, change1);
    historyModel.addWord(ratWord, change2);
    
    // Jump to index 0
    const jumpResult = historyModel.jumpToIndex(0);
    expect(jumpResult).toBe(catWord);
    expect(jumpResult!.word).toBe('cat');
    expect(historyModel.currentIndex).toBe(0);
    
    // Jump to index 2
    const jumpResult2 = historyModel.jumpToIndex(2);
    expect(jumpResult2).toBe(ratWord);
    expect(jumpResult2!.word).toBe('rat');
    expect(historyModel.currentIndex).toBe(2);
    
    // Invalid index returns null
    const jumpResult3 = historyModel.jumpToIndex(5);
    expect(jumpResult3).toBeNull();
    expect(historyModel.currentIndex).toBe(2);
  });

  it('should clear history when reset', () => {
    const change: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };
    
    const batWord = appState.wordGraph.getNode('bat')!;
    const dogWord = appState.wordGraph.getNode('dog')!;
    
    historyModel.addWord(batWord, change);
    
    historyModel.reset(dogWord);
    
    expect(historyModel.entries.length).toBe(1);
    expect(historyModel.entries[0].wordString).toBe('dog');
    expect(historyModel.entries[0].word).toBe(dogWord);
    expect(historyModel.entries[0].change).toBeUndefined();
    expect(historyModel.currentIndex).toBe(0);
    expect(historyModel.hasVisited('cat')).toBe(false);
    expect(historyModel.hasVisited('bat')).toBe(false);
    expect(historyModel.hasVisited('dog')).toBe(false);
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
    
    const batWord = appState.wordGraph.getNode('bat')!;
    const ratWord = appState.wordGraph.getNode('rat')!;
    const fatWord = appState.wordGraph.getNode('fat')!;
    const catWord = appState.wordGraph.getNode('cat')!;
    
    historyModel.addWord(batWord, change1);
    historyModel.addWord(ratWord, change2);
    
    // Undo twice
    historyModel.undo();
    historyModel.undo();
    
    // Add a new word
    historyModel.addWord(fatWord, change3);
    
    // History should be truncated, with only 'cat' and 'fat'
    expect(historyModel.entries.length).toBe(2);
    expect(historyModel.entries[0].wordString).toBe('cat');
    expect(historyModel.entries[0].word).toBe(catWord);
    expect(historyModel.entries[1].wordString).toBe('fat');
    expect(historyModel.entries[1].word).toBe(fatWord);
    expect(historyModel.currentIndex).toBe(1);
    
    // Redo should not work now
    const redoResult = historyModel.redo();
    expect(redoResult).toBeNull();
  });
  
  it('should provide canUndo and canRedo properties', () => {
    // Initially, can't undo but also can't redo
    expect(historyModel.canUndo).toBe(false);
    expect(historyModel.canRedo).toBe(false);
    
    const change: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };
    
    historyModel.addWord('bat', change);
    
    // After adding a word, can undo but can't redo
    expect(historyModel.canUndo).toBe(true);
    expect(historyModel.canRedo).toBe(false);
    
    // After undoing, can't undo more (at beginning) but can redo
    historyModel.undo();
    expect(historyModel.canUndo).toBe(false);
    expect(historyModel.canRedo).toBe(true);
  });
  
  it('should provide currentWord property', () => {
    const catWord = appState.wordGraph.getNode('cat')!;
    const batWord = appState.wordGraph.getNode('bat')!;
    
    expect(historyModel.currentWord).toBe(catWord);
    expect(historyModel.currentWord.word).toBe('cat');
    
    const change: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };
    
    historyModel.addWord(batWord, change);
    expect(historyModel.currentWord).toBe(batWord);
    expect(historyModel.currentWord.word).toBe('bat');
    
    historyModel.undo();
    expect(historyModel.currentWord).toBe(catWord);
    expect(historyModel.currentWord.word).toBe('cat');
  });
});