import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { LetterInteraction } from '../../src/models/interaction/LetterInteraction';
import { PositionInteraction } from '../../src/models/interaction/PositionInteraction';
import { Letter } from '../../src/models/Letter';
import { Position } from '../../src/models/Position';
import { WordGraphNode } from '../../src/models/WordGraphNode';
import { AppState } from '../../src/models/AppState';

// Create a mock for WordGraphNode
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
  
  getLetters(): Letter[] {
    if (!this._letters) {
      this._letters = Array.from(this.word).map(
        (letter, index) => new Letter(this as unknown as WordGraphNode, letter, index)
      );
    }
    return this._letters;
  }
  
  getPositions(): Position[] {
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

describe('Interaction Classes Integration', () => {
  let appState: AppState;
  let wordInteraction: WordInteraction;
  
  beforeEach(() => {
    appState = {
      closeAllMenus: jest.fn(() => {
        // Simulate the behavior of closeAllMenus in the actual application
        if (wordInteraction) {
          wordInteraction.closeAllMenus();
        }
      }),
      openMenu: jest.fn(),
      currentPage: 'wordView',
      history: { hasVisited: () => false },
      wordGraph: { getNode: (word: string) => new MockWordGraphNode(word) as unknown as WordGraphNode },
      isLoading: false,
    } as unknown as AppState;
    
    // Create a new word interaction for testing
    const node = new MockWordGraphNode('test') as unknown as WordGraphNode;
    wordInteraction = new WordInteraction(node, appState, false);
  });
  
  it('should initialize with all menus closed', () => {
    // Check all letter interactions
    for (const letterInteraction of wordInteraction.letterInteractions) {
      expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    }
    
    // Check all position interactions
    for (const positionInteraction of wordInteraction.positionInteractions) {
      expect(positionInteraction.isInsertMenuOpen).toBe(false);
    }
  });
  
  it('should allow opening a letter replace menu', () => {
    // Open the first letter's replace menu
    wordInteraction.letterInteractions[0].toggleReplaceMenu();
    
    expect(wordInteraction.letterInteractions[0].isReplaceMenuOpen).toBe(true);
    
    // Other menus should still be closed
    expect(wordInteraction.letterInteractions[1].isReplaceMenuOpen).toBe(false);
    expect(wordInteraction.letterInteractions[2].isReplaceMenuOpen).toBe(false);
    expect(wordInteraction.letterInteractions[3].isReplaceMenuOpen).toBe(false);
    
    for (const positionInteraction of wordInteraction.positionInteractions) {
      expect(positionInteraction.isInsertMenuOpen).toBe(false);
    }
  });
  
  it('should allow opening a position insert menu', () => {
    // Open the first position's insert menu
    wordInteraction.positionInteractions[0].toggleInsertMenu();
    
    expect(wordInteraction.positionInteractions[0].isInsertMenuOpen).toBe(true);
    
    // Other menus should still be closed
    expect(wordInteraction.positionInteractions[1].isInsertMenuOpen).toBe(false);
    expect(wordInteraction.positionInteractions[2].isInsertMenuOpen).toBe(false);
    expect(wordInteraction.positionInteractions[3].isInsertMenuOpen).toBe(false);
    expect(wordInteraction.positionInteractions[4].isInsertMenuOpen).toBe(false);
    
    for (const letterInteraction of wordInteraction.letterInteractions) {
      expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    }
  });
  
  it('should close all menus when wordInteraction.closeAllMenus is called', () => {
    // Open some menus
    wordInteraction.letterInteractions[0].toggleReplaceMenu();
    wordInteraction.positionInteractions[0].toggleInsertMenu();
    
    // Verify they're open
    expect(wordInteraction.letterInteractions[0].isReplaceMenuOpen).toBe(true);
    expect(wordInteraction.positionInteractions[0].isInsertMenuOpen).toBe(true);
    
    // Close all menus
    wordInteraction.closeAllMenus();
    
    // Verify all menus are closed
    for (const letterInteraction of wordInteraction.letterInteractions) {
      expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    }
    
    for (const positionInteraction of wordInteraction.positionInteractions) {
      expect(positionInteraction.isInsertMenuOpen).toBe(false);
    }
  });
  
  it('should close all menus when appState.closeAllMenus is called', () => {
    // Open some menus
    wordInteraction.letterInteractions[0].toggleReplaceMenu();
    wordInteraction.positionInteractions[0].toggleInsertMenu();
    
    // Verify they're open
    expect(wordInteraction.letterInteractions[0].isReplaceMenuOpen).toBe(true);
    expect(wordInteraction.positionInteractions[0].isInsertMenuOpen).toBe(true);
    
    // Close all menus via appState
    appState.closeAllMenus();
    
    // Verify all menus are closed
    for (const letterInteraction of wordInteraction.letterInteractions) {
      expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    }
    
    for (const positionInteraction of wordInteraction.positionInteractions) {
      expect(positionInteraction.isInsertMenuOpen).toBe(false);
    }
    
    // Verify appState's closeAllMenus was called
    expect(appState.closeAllMenus).toHaveBeenCalled();
  });
  
  it('should recreate interactions when the word changes', () => {
    // Open a menu on the current word
    wordInteraction.letterInteractions[0].toggleReplaceMenu();
    expect(wordInteraction.letterInteractions[0].isReplaceMenuOpen).toBe(true);
    
    // Store references to the current interaction objects
    const oldLetterInteractions = [...wordInteraction.letterInteractions];
    const oldPositionInteractions = [...wordInteraction.positionInteractions];
    
    // Update the word
    const newNode = new MockWordGraphNode('hello') as unknown as WordGraphNode;
    wordInteraction.updateWord(newNode, false);
    
    // Verify the interactions are new objects
    for (let i = 0; i < wordInteraction.letterInteractions.length; i++) {
      expect(wordInteraction.letterInteractions[i]).not.toBe(oldLetterInteractions[i]);
    }
    
    for (let i = 0; i < wordInteraction.positionInteractions.length; i++) {
      if (i < oldPositionInteractions.length) {
        expect(wordInteraction.positionInteractions[i]).not.toBe(oldPositionInteractions[i]);
      }
    }
    
    // Verify all menus are closed in the new word
    for (const letterInteraction of wordInteraction.letterInteractions) {
      expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    }
    
    for (const positionInteraction of wordInteraction.positionInteractions) {
      expect(positionInteraction.isInsertMenuOpen).toBe(false);
    }
  });
});