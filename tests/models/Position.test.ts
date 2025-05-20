import { Position } from '../../src/models/Position';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { AppState } from '../../src/models/AppState';
import { Word } from '../../src/models/Word';
import { Letter } from '../../src/models/Letter';

// Mock Word for testing
class MockWord {
  word: string;
  deletes: boolean[];
  inserts: string[];
  replaces: string[];
  uppercase: boolean[];
  lowercase: boolean[];
  _letters: Letter[] | null = null;
  _positions: Position[] | null = null;
  
  constructor(word: string) {
    this.word = word;
    this.deletes = Array(word.length).fill(true);
    this.inserts = Array(word.length + 1).fill('aeiou');
    this.replaces = Array(word.length).fill('bcdfghjklmnpqrstvwxyz');
    this.uppercase = Array(word.length).fill(true);
    this.lowercase = Array(word.length).fill(true);
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
  let currentWord: WordInteraction;

  beforeEach(() => {
    appState = {
      navigateTo: jest.fn(),
      toggleMenu: jest.fn(),
      closeAllMenus: jest.fn(),
    } as unknown as AppState;
    
    const node = new MockWord('test') as unknown as Word;
    currentWord = new WordInteraction(node, appState, false);
  });

  it('should initialize with the correct properties', () => {
    // Instead of creating a new Position, use the one from node.getPositions()
    const position = currentWord.positions[1];
    
    expect(position.index).toBe(1);
    expect(position.canInsert).toBe(true);
    expect(position.insertOptions).toEqual(['a', 'e', 'i', 'o', 'u']);
  });

  it('should toggle insert menu state', () => {
    // Get a PositionInteraction instead and test that
    const positionInteraction = currentWord.positionInteractions[1];
    
    // Initially closed
    expect(positionInteraction.isInsertMenuOpen).toBe(false);
    
    // Open it
    positionInteraction.toggleInsertMenu();
    expect(positionInteraction.isInsertMenuOpen).toBe(true);
    
    // Close it
    positionInteraction.toggleInsertMenu();
    expect(positionInteraction.isInsertMenuOpen).toBe(false);
  });

  it('should have canInsert set to true by default', () => {
    const position = currentWord.positions[1];
    expect(position.canInsert).toBe(true);
  });

  it('should initialize with default insert options', () => {
    const position = currentWord.positions[1];
    expect(position.insertOptions).toEqual(['a', 'e', 'i', 'o', 'u']);
  });
});