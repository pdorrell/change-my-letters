import { Position } from '../../src/models/Position';
import { CurrentWord } from '../../src/models/CurrentWord';
import { AppState } from '../../src/models/AppState';

describe('Position', () => {
  let appState: AppState;
  let currentWord: CurrentWord;

  beforeEach(() => {
    appState = new AppState();
    currentWord = new CurrentWord("test", appState);
  });

  it('should initialize with the correct properties', () => {
    const position = new Position(currentWord, 1);
    
    expect(position.index).toBe(1);
    expect(position.isInsertMenuOpen).toBe(false);
    expect(position.canInsert).toBe(true);
    expect(position.insertOptions).toEqual(['a', 'e', 'i', 'o', 'u']);
    expect(position.word).toBe(currentWord);
  });

  it('should toggle insert menu state', () => {
    const position = new Position(currentWord, 1);
    
    // Initially closed
    expect(position.isInsertMenuOpen).toBe(false);
    
    // Open it
    position.toggleInsertMenu();
    expect(position.isInsertMenuOpen).toBe(true);
    
    // Close it
    position.toggleInsertMenu();
    expect(position.isInsertMenuOpen).toBe(false);
  });

  it('should have canInsert set to true by default', () => {
    const position = new Position(currentWord, 1);
    expect(position.canInsert).toBe(true);
  });

  it('should initialize with default insert options', () => {
    const position = new Position(currentWord, 1);
    expect(position.insertOptions).toEqual(['a', 'e', 'i', 'o', 'u']);
  });
});