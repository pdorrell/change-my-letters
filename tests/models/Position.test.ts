import { Position } from '../../src/models/Position';
import { CurrentWord } from '../../src/models/CurrentWord';
import { AppState } from '../../src/models/AppState';
import { WordGraphNode } from '../../src/models/WordGraphNode';

// Mock WordGraphNode for testing
class MockWordGraphNode {
  word: string;
  deletes: boolean[];
  inserts: string[];
  replaces: string[];
  uppercase: boolean[];
  lowercase: boolean[];
  
  constructor(word: string) {
    this.word = word;
    this.deletes = Array(word.length).fill(true);
    this.inserts = Array(word.length + 1).fill('aeiou');
    this.replaces = Array(word.length).fill('bcdfghjklmnpqrstvwxyz');
    this.uppercase = Array(word.length).fill(true);
    this.lowercase = Array(word.length).fill(true);
  }
  
  canDelete(position: number): boolean {
    return this.deletes[position];
  }
  
  getInsertions(position: number): string {
    return this.inserts[position];
  }
  
  getReplacements(position: number): string {
    return this.replaces[position];
  }
  
  getPossibleInsertions(position: number): string[] {
    return this.inserts[position]?.split('') || [];
  }
  
  getPossibleReplacements(position: number): string[] {
    return this.replaces[position]?.split('') || [];
  }
  
  canUppercase(position: number): boolean {
    return this.uppercase[position];
  }
  
  canLowercase(position: number): boolean {
    return this.lowercase[position];
  }
  
  canChangeCaseAt(position: number): boolean {
    return this.uppercase[position] || this.lowercase[position];
  }
}

describe('Position', () => {
  let appState: AppState;
  let currentWord: CurrentWord;

  beforeEach(() => {
    appState = {
      navigateTo: jest.fn(),
      openMenu: jest.fn(),
      closeAllMenus: jest.fn(),
    } as unknown as AppState;
    
    const node = new MockWordGraphNode('test') as unknown as WordGraphNode;
    currentWord = new CurrentWord(node, appState, false);
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