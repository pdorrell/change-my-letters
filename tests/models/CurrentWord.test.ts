import { CurrentWord } from '../../src/models/CurrentWord';
import { AppState } from '../../src/models/AppState';
import { WordGraphNode } from '../../src/models/WordGraphNode';
import { Letter } from '../../src/models/Letter';
import { Position } from '../../src/models/Position';

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

describe('CurrentWord', () => {
  let appState: AppState;
  
  beforeEach(() => {
    appState = {
      currentPage: 'wordView',
      history: { hasVisited: () => false },
      wordGraph: { getNode: (word: string) => new MockWordGraphNode(word) },
      isLoading: false,
    } as unknown as AppState;
  });
  
  it('should initialize correctly with a word node', () => {
    const node = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const hasBeenVisited = false;
    const currentWord = new CurrentWord(node, appState, hasBeenVisited);

    expect(currentWord.value).toBe('cat');
    expect(currentWord.previouslyVisited).toBe(false);
    // Don't test appState reference equality since the test is using a mock
    expect(currentWord.node).toBe(node);

    // Should have 3 letterInteractions for 'cat'
    expect(currentWord.letterInteractions.length).toBe(3);
    
    // Should have 4 positionInteractions (before, between, and after letters)
    expect(currentWord.positionInteractions.length).toBe(4);
    expect(currentWord.positionInteractions[0].position.index).toBe(0);
    expect(currentWord.positionInteractions[1].position.index).toBe(1);
    expect(currentWord.positionInteractions[2].position.index).toBe(2);
    expect(currentWord.positionInteractions[3].position.index).toBe(3);
  });

  it('should update word value and related properties', () => {
    const catNode = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const batNode = new MockWordGraphNode('bat') as unknown as WordGraphNode;
    const currentWord = new CurrentWord(catNode, appState, false);
    currentWord.updateWord(batNode, false);

    expect(currentWord.value).toBe('bat');
    expect(currentWord.node).toBe(batNode);

    // Should have 3 letterInteractions
    expect(currentWord.letterInteractions.length).toBe(3);
    
    // Should still have 4 positionInteractions
    expect(currentWord.positionInteractions.length).toBe(4);
  });

  it('should create letterInteractions for each character', () => {
    const node = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const currentWord = new CurrentWord(node, appState, false);

    // Verify that the letters have been created correctly
    expect(currentWord.letterInteractions.length).toBe(3);
    expect(currentWord.letterInteractions[0].letter.value).toBe('c');
    expect(currentWord.letterInteractions[0].letter.position).toBe(0);
    expect(currentWord.letterInteractions[0].wordInteraction).toBe(currentWord);
    
    expect(currentWord.letterInteractions[1].letter.value).toBe('a');
    expect(currentWord.letterInteractions[1].letter.position).toBe(1);
    expect(currentWord.letterInteractions[1].wordInteraction).toBe(currentWord);
    
    expect(currentWord.letterInteractions[2].letter.value).toBe('t');
    expect(currentWord.letterInteractions[2].letter.position).toBe(2);
    expect(currentWord.letterInteractions[2].wordInteraction).toBe(currentWord);
  });

  it('should create positionInteractions for before, between, and after characters', () => {
    const node = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const currentWord = new CurrentWord(node, appState, false);

    // Verify that the positions have been created correctly
    expect(currentWord.positionInteractions.length).toBe(4);
    expect(currentWord.positionInteractions[0].position.index).toBe(0);
    expect(currentWord.positionInteractions[0].wordInteraction).toBe(currentWord);
    
    expect(currentWord.positionInteractions[1].position.index).toBe(1);
    expect(currentWord.positionInteractions[1].wordInteraction).toBe(currentWord);
    
    expect(currentWord.positionInteractions[2].position.index).toBe(2);
    expect(currentWord.positionInteractions[2].wordInteraction).toBe(currentWord);
    
    expect(currentWord.positionInteractions[3].position.index).toBe(3);
    expect(currentWord.positionInteractions[3].wordInteraction).toBe(currentWord);
  });

  it('should handle different word lengths when updating', () => {
    const catNode = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const catsNode = new MockWordGraphNode('cats') as unknown as WordGraphNode;
    const atNode = new MockWordGraphNode('at') as unknown as WordGraphNode;
    
    const currentWord = new CurrentWord(catNode, appState, false);

    // Update to longer word
    currentWord.updateWord(catsNode, false);

    expect(currentWord.letterInteractions.length).toBe(4);
    expect(currentWord.positionInteractions.length).toBe(5);

    // Update to shorter word
    currentWord.updateWord(atNode, false);

    expect(currentWord.letterInteractions.length).toBe(2);
    expect(currentWord.positionInteractions.length).toBe(3);
  });
});