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

describe('WordInteraction', () => {
  let appState: AppState;
  
  beforeEach(() => {
    appState = {
      currentPage: 'wordView',
      history: { hasVisited: () => false },
      wordGraph: { getNode: (word: string) => new MockWordGraphNode(word) as unknown as WordGraphNode },
      isLoading: false,
    } as unknown as AppState;
  });
  
  it('should initialize correctly with a word node', () => {
    const node = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const hasBeenVisited = false;
    const wordInteraction = new WordInteraction(node, appState, hasBeenVisited);

    expect(wordInteraction.value).toBe('cat');
    expect(wordInteraction.previouslyVisited).toBe(false);
    expect(wordInteraction.node).toBe(node);

    // Should have letterInteractions for each letter in 'cat'
    expect(wordInteraction.letterInteractions.length).toBe(3);
    
    // Should have positionInteractions for before, between, and after all letters
    expect(wordInteraction.positionInteractions.length).toBe(4);
    expect(wordInteraction.positionInteractions[0].position.index).toBe(0);
    expect(wordInteraction.positionInteractions[1].position.index).toBe(1);
    expect(wordInteraction.positionInteractions[2].position.index).toBe(2);
    expect(wordInteraction.positionInteractions[3].position.index).toBe(3);
  });

  it('should update word value and related properties', () => {
    const catNode = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const batNode = new MockWordGraphNode('bat') as unknown as WordGraphNode;
    const wordInteraction = new WordInteraction(catNode, appState, false);
    wordInteraction.updateWord(batNode, false);

    expect(wordInteraction.value).toBe('bat');
    expect(wordInteraction.node).toBe(batNode);

    // Should still have 3 letterInteractions
    expect(wordInteraction.letterInteractions.length).toBe(3);
    
    // Should still have 4 positionInteractions
    expect(wordInteraction.positionInteractions.length).toBe(4);
  });

  it('should create letterInteractions for each character', () => {
    const node = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const wordInteraction = new WordInteraction(node, appState, false);

    // Verify that the letterInteractions have been created correctly
    expect(wordInteraction.letterInteractions.length).toBe(3);
    expect(wordInteraction.letterInteractions[0].letter.value).toBe('c');
    expect(wordInteraction.letterInteractions[0].letter.position).toBe(0);
    
    expect(wordInteraction.letterInteractions[1].letter.value).toBe('a');
    expect(wordInteraction.letterInteractions[1].letter.position).toBe(1);
    
    expect(wordInteraction.letterInteractions[2].letter.value).toBe('t');
    expect(wordInteraction.letterInteractions[2].letter.position).toBe(2);
    
    // Verify that each letterInteraction has a reference to the wordInteraction
    for (const interaction of wordInteraction.letterInteractions) {
      expect(interaction.wordInteraction).toBe(wordInteraction);
    }
  });

  it('should create positionInteractions for before, between, and after characters', () => {
    const node = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const wordInteraction = new WordInteraction(node, appState, false);

    // Verify that the positionInteractions have been created correctly
    expect(wordInteraction.positionInteractions.length).toBe(4);
    expect(wordInteraction.positionInteractions[0].position.index).toBe(0);
    expect(wordInteraction.positionInteractions[1].position.index).toBe(1);
    expect(wordInteraction.positionInteractions[2].position.index).toBe(2);
    expect(wordInteraction.positionInteractions[3].position.index).toBe(3);
    
    // Verify that each positionInteraction has a reference to the wordInteraction
    for (const interaction of wordInteraction.positionInteractions) {
      expect(interaction.wordInteraction).toBe(wordInteraction);
    }
  });

  it('should handle different word lengths when updating', () => {
    const catNode = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const catsNode = new MockWordGraphNode('cats') as unknown as WordGraphNode;
    const atNode = new MockWordGraphNode('at') as unknown as WordGraphNode;
    
    const wordInteraction = new WordInteraction(catNode, appState, false);

    // Update to longer word
    wordInteraction.updateWord(catsNode, false);

    expect(wordInteraction.letterInteractions.length).toBe(4);
    expect(wordInteraction.positionInteractions.length).toBe(5);

    // Update to shorter word
    wordInteraction.updateWord(atNode, false);

    expect(wordInteraction.letterInteractions.length).toBe(2);
    expect(wordInteraction.positionInteractions.length).toBe(3);
  });

  it('should close all menus', () => {
    const node = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const wordInteraction = new WordInteraction(node, appState, false);
    
    // Open some menus
    wordInteraction.letterInteractions[0].isReplaceMenuOpen = true;
    wordInteraction.positionInteractions[0].isInsertMenuOpen = true;
    
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

  it('should have a computed value property that returns the node word', () => {
    const node = new MockWordGraphNode('hello') as unknown as WordGraphNode;
    const wordInteraction = new WordInteraction(node, appState, false);
    
    expect(wordInteraction.value).toBe('hello');
    
    // Update the node and check that value updates
    const newNode = new MockWordGraphNode('world') as unknown as WordGraphNode;
    wordInteraction.updateWord(newNode, false);
    
    expect(wordInteraction.value).toBe('world');
  });
  
  it('should update previouslyVisited when word changes', () => {
    const node = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const wordInteraction = new WordInteraction(node, appState, false);
    
    expect(wordInteraction.previouslyVisited).toBe(false);
    
    wordInteraction.updateWord(node, true);
    
    expect(wordInteraction.previouslyVisited).toBe(true);
  });
});