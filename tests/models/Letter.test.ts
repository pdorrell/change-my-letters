import { Letter } from '../../src/models/Letter';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { AppState } from '../../src/models/AppState';
import { WordGraphNode } from '../../src/models/WordGraphNode';
import { Position } from '../../src/models/Position';

// Mock WordGraphNode for testing
class MockWordGraphNode {
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
        (letter, index) => new Letter(this as unknown as WordGraphNode, letter, index)
      );
    }
    return this._letters;
  }
  
  get positions(): Position[] {
    if (!this._positions) {
      this._positions = Array(this.word.length + 1)
        .fill(0)
        .map((_, index) => new Position(this as unknown as WordGraphNode, index));
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
      openMenu: jest.fn(),
      closeAllMenus: jest.fn(),
    } as unknown as AppState;
    
    const node = new MockWordGraphNode('test') as unknown as WordGraphNode;
    currentWord = new WordInteraction(node, appState, false);
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

  it('should have canUpperCase property for lowercase letters', () => {
    // Override the node to control uppercase property
    const mockNode = new MockWordGraphNode('test') as unknown as WordGraphNode;
    // Ensure uppercase is true for position 0
    mockNode.uppercase[0] = true;
    
    // Create a new Letter directly
    const letter = new Letter(mockNode, 't', 0);
    
    // Since 't' is lowercase and uppercase[0] is true, canUpperCase should be true
    expect(letter.canUpperCase).toBe(true);
  });

  it('should have canLowerCase property for uppercase letters', () => {
    // Override the node to control lowercase property
    const mockNode = new MockWordGraphNode('TEST') as unknown as WordGraphNode;
    // Ensure lowercase is true for position 0
    mockNode.lowercase[0] = true;
    
    // Create a new Letter directly with uppercase letter
    const letter = new Letter(mockNode, 'T', 0);
    
    // Since 'T' is uppercase and lowercase[0] is true, canLowerCase should be true
    expect(letter.canLowerCase).toBe(true);
  });

  it('should have replacements', () => {
    const letter = currentWord.letters[0];
    expect(letter.replacements.length).toBeGreaterThan(0);
  });
});