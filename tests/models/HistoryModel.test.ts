import { HistoryModel, WordChange } from '../../src/models/HistoryModel';
import { AppState } from '../../src/models/AppState';

describe('HistoryModel', () => {
  let historyModel: HistoryModel;
  let appState: AppState;

  beforeEach(() => {
    // Create an AppState instance
    appState = new AppState();
    
    // Initialize the history model with AppState and the initial word
    historyModel = new HistoryModel(appState, 'cat');
  });

  it('should initialize with initial word', () => {
    expect(historyModel.entries).toEqual([{ word: 'cat' }]);
    expect(historyModel.currentIndex).toBe(0);
    expect(historyModel.hasVisited('cat')).toBe(false);
    expect(historyModel.visitingWord).toBe('cat');
  });

  it('should add words to history with change information', () => {
    const change: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };
    
    historyModel.addWord('bat', change);
    
    expect(historyModel.entries.length).toBe(2);
    expect(historyModel.entries[1].word).toBe('bat');
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
    
    historyModel.addWord('bat', change1);
    historyModel.addWord('rat', change2);
    
    // Undo should move back in history
    const undoResult = historyModel.undo();
    expect(undoResult).toBe('bat');
    expect(historyModel.currentIndex).toBe(1);
    
    // Undo again
    const undoResult2 = historyModel.undo();
    expect(undoResult2).toBe('cat');
    expect(historyModel.currentIndex).toBe(0);
    
    // Can't undo beyond the beginning
    const undoResult3 = historyModel.undo();
    expect(undoResult3).toBeNull();
    expect(historyModel.currentIndex).toBe(0);
    
    // Redo should move forward in history
    const redoResult = historyModel.redo();
    expect(redoResult).toBe('bat');
    expect(historyModel.currentIndex).toBe(1);
    
    const redoResult2 = historyModel.redo();
    expect(redoResult2).toBe('rat');
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
    
    historyModel.addWord('bat', change1);
    historyModel.addWord('rat', change2);
    
    // Jump to index 0
    const jumpResult = historyModel.jumpToIndex(0);
    expect(jumpResult).toBe('cat');
    expect(historyModel.currentIndex).toBe(0);
    
    // Jump to index 2
    const jumpResult2 = historyModel.jumpToIndex(2);
    expect(jumpResult2).toBe('rat');
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
    
    historyModel.addWord('bat', change);
    
    historyModel.reset('dog');
    
    expect(historyModel.entries.length).toBe(1);
    expect(historyModel.entries[0].word).toBe('dog');
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
    
    historyModel.addWord('bat', change1);
    historyModel.addWord('rat', change2);
    
    // Undo twice
    historyModel.undo();
    historyModel.undo();
    
    // Add a new word
    historyModel.addWord('fat', change3);
    
    // History should be truncated, with only 'cat' and 'fat'
    expect(historyModel.entries.length).toBe(2);
    expect(historyModel.entries[0].word).toBe('cat');
    expect(historyModel.entries[1].word).toBe('fat');
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
    expect(historyModel.currentWord).toBe('cat');
    
    const change: WordChange = {
      type: 'replace_letter',
      position: 0,
      letter: 'b'
    };
    
    historyModel.addWord('bat', change);
    expect(historyModel.currentWord).toBe('bat');
    
    historyModel.undo();
    expect(historyModel.currentWord).toBe('cat');
  });
});