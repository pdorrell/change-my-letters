import { Letter } from '../../src/models/Letter';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { AppState } from '../../src/models/AppState';
import { Word } from '../../src/models/Word';
import { Position } from '../../src/models/Position';

// Mock Word for testing
class MockWord {
  word: string;
  deletes: boolean[];
  inserts: string[];
  replaces: string[];
  _letters: Letter[] | null = null;
  _positions: Position[] | null = null;
  
  constructor(word: string) {
    this.word = word;
    this.deletes = Array(word.length).fill(true);
    this.inserts = Array(word.length + 1).fill('aeiou');
    this.replaces = Array(word.length).fill('bcdfghjklmnpqrstvwxyz');
  }
  
  get letters(): Letter[] {
    if (!this._letters) {
      this._letters = Array.from(this.word).map(
        (letter, index) => new Letter(this as unknown as Word, letter, index)
      );
    }
    return this._letters;
  }
  
  get positions(): Position[] {
    if (!this._positions) {
      this._positions = Array(this.word.length + 1)
        .fill(0)
        .map((_, index) => new Position(this as unknown as Word, index));
    }
    return this._positions;
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
  
  // Case-related methods have been removed
  
  get possibleNextWords(): string[] {
    return ['bat', 'cat', 'dat', 'fat', 'rat', 'test'];
  }
}

describe('Letter', () => {
  let appState: AppState;
  let currentWord: WordInteraction;

  beforeEach(() => {
    appState = {
      navigateTo: jest.fn(),
      toggleMenu: jest.fn(),
      closeAllMenus: jest.fn(),
      menuManager: {
        activeButtonElement: null,
        toggleMenu: jest.fn(),
        closeMenus: jest.fn()
      },
    } as unknown as AppState;
    
    const node = new MockWord('test') as unknown as Word;
    currentWord = new WordInteraction(node, appState, appState.menuManager, false);
  });

  it('should initialize with the correct properties', () => {
    // Use the letter from the currentWord instead of creating a new one
    const letter = currentWord.letters[0];
    
    expect(letter.value).toBe('t');
    expect(letter.position).toBe(0);
    expect(letter.canDelete).toBe(true);
    expect(letter.canReplace).toBe(true);
    expect(letter.replacements.length).toBeGreaterThan(0);
  });

  it('should toggle replace menu state', () => {
    // Use the letterInteraction instead
    const letterInteraction = currentWord.letterInteractions[0];
    
    // Initially closed
    expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    
    // Open it
    letterInteraction.toggleReplaceMenu();
    expect(letterInteraction.isReplaceMenuOpen).toBe(true);
    
    // Close it
    letterInteraction.toggleReplaceMenu();
    expect(letterInteraction.isReplaceMenuOpen).toBe(false);
  });

  // Case-related tests have been removed

  it('should have replacements', () => {
    const letter = currentWord.letters[0];
    expect(letter.replacements.length).toBeGreaterThan(0);
  });
});