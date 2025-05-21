import { LetterInteraction } from '../../src/models/interaction/LetterInteraction';
import { Letter } from '../../src/models/Letter';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { Word } from '../../src/models/Word';
import { Position } from '../../src/models/Position';
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

describe('LetterInteraction', () => {
  let letter: Letter;
  let wordInteraction: WordInteraction;
  let appState: AppState;
  let menuManager: MenuManager;
  let letterInteraction: LetterInteraction;
  
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
    
    // Create a node and letter
    const node = new MockWord('cat') as unknown as Word;
    letter = node.letters[0]; // 'c'
    
    // Create a word interaction
    wordInteraction = new WordInteraction(node, appState, menuManager);
    
    // Create the letter interaction to test
    letterInteraction = new LetterInteraction(letter, wordInteraction, menuManager);
  });
  
  it('should initialize with correct letter and word interaction references', () => {
    expect(letterInteraction.letter).toBe(letter);
    expect(letterInteraction.wordInteraction).toBe(wordInteraction);
    expect(letterInteraction.isReplaceMenuOpen).toBe(false);
  });
  
  it('should be able to control replace menu state', () => {
    // Initially closed
    expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    
    // Set to open
    letterInteraction.isReplaceMenuOpen = true;
    expect(letterInteraction.isReplaceMenuOpen).toBe(true);
    
    // Set back to closed
    letterInteraction.isReplaceMenuOpen = false;
    expect(letterInteraction.isReplaceMenuOpen).toBe(false);
  });
  
  it('should be able to modify the state directly', () => {
    // Set menu open directly
    letterInteraction.isReplaceMenuOpen = true;
    expect(letterInteraction.isReplaceMenuOpen).toBe(true);
    
    // Set menu closed directly
    letterInteraction.isReplaceMenuOpen = false;
    expect(letterInteraction.isReplaceMenuOpen).toBe(false);
  });
});