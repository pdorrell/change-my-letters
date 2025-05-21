import { PositionInteraction } from '../../src/models/interaction/PositionInteraction';
import { Position } from '../../src/models/Position';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { Word } from '../../src/models/Word';
import { Letter } from '../../src/models/Letter';
import { AppState } from '../../src/models/AppState';
import { MenuManager } from '../../src/models/MenuManager';

// Create a mock for Word
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

describe('PositionInteraction', () => {
  let position: Position;
  let wordInteraction: WordInteraction;
  let appState: AppState;
  let menuManager: MenuManager;
  let positionInteraction: PositionInteraction;
  
  beforeEach(() => {
    // Create a mock MenuManager
    menuManager = {
      activeButtonElement: null,
      toggleMenu: jest.fn(),
      closeMenus: jest.fn()
    } as unknown as MenuManager;
    
    // Set up mocks
    appState = {
      currentPage: 'wordView',
      history: { hasVisited: () => false },
      wordGraph: { getNode: (word: string) => new MockWord(word) as unknown as Word },
      isLoading: false,
      menuManager: menuManager,
    } as unknown as AppState;
    
    // Create a node and position
    const node = new MockWord('cat') as unknown as Word;
    position = node.positions[0]; // Position at index 0 (before 'c')
    
    // Create a word interaction
    wordInteraction = new WordInteraction(node, appState, menuManager);
    
    // Create the position interaction to test
    positionInteraction = new PositionInteraction(position, wordInteraction, menuManager);
  });
  
  it('should initialize with correct position and word interaction references', () => {
    expect(positionInteraction.position).toBe(position);
    expect(positionInteraction.wordInteraction).toBe(wordInteraction);
    expect(positionInteraction.isInsertMenuOpen).toBe(false);
  });
  
  it('should be able to control insert menu state', () => {
    // Initially closed
    expect(positionInteraction.isInsertMenuOpen).toBe(false);
    
    // Set to open
    positionInteraction.isInsertMenuOpen = true;
    expect(positionInteraction.isInsertMenuOpen).toBe(true);
    
    // Set back to closed
    positionInteraction.isInsertMenuOpen = false;
    expect(positionInteraction.isInsertMenuOpen).toBe(false);
  });
  
  it('should be able to modify the state directly', () => {
    // Set menu open directly
    positionInteraction.isInsertMenuOpen = true;
    expect(positionInteraction.isInsertMenuOpen).toBe(true);
    
    // Set menu closed directly
    positionInteraction.isInsertMenuOpen = false;
    expect(positionInteraction.isInsertMenuOpen).toBe(false);
  });
});