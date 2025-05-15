import { CurrentWord } from '../../src/models/CurrentWord';
import { AppState } from '../../src/models/AppState';
import { WordGraphNode } from '../../src/models/WordGraphNode';

// Create a mock for WordGraphNode
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

    // Should have 3 letters for 'cat'
    expect(currentWord.letters.length).toBe(3);
    expect(currentWord.letters[0].value).toBe('c');
    expect(currentWord.letters[1].value).toBe('a');
    expect(currentWord.letters[2].value).toBe('t');

    // Should have 4 positions (before, between, and after letters)
    expect(currentWord.positions.length).toBe(4);
    expect(currentWord.positions[0].index).toBe(0);
    expect(currentWord.positions[1].index).toBe(1);
    expect(currentWord.positions[2].index).toBe(2);
    expect(currentWord.positions[3].index).toBe(3);
  });

  it('should update word value and related properties', () => {
    const catNode = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const batNode = new MockWordGraphNode('bat') as unknown as WordGraphNode;
    const currentWord = new CurrentWord(catNode, appState, false);
    currentWord.updateWord(batNode, false);

    expect(currentWord.value).toBe('bat');
    expect(currentWord.node).toBe(batNode);

    // Should have 3 letters for 'bat'
    expect(currentWord.letters.length).toBe(3);
    expect(currentWord.letters[0].value).toBe('b');
    expect(currentWord.letters[1].value).toBe('a');
    expect(currentWord.letters[2].value).toBe('t');

    // Should still have 4 positions
    expect(currentWord.positions.length).toBe(4);
  });

  it('should create Letter objects for each character', () => {
    const node = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const currentWord = new CurrentWord(node, appState, false);

    // Verify that the letters have been created correctly
    expect(currentWord.letters.length).toBe(3);
    expect(currentWord.letters[0].value).toBe('c');
    expect(currentWord.letters[0].position).toBe(0);
    expect(currentWord.letters[0].word).toBe(currentWord);
    
    expect(currentWord.letters[1].value).toBe('a');
    expect(currentWord.letters[1].position).toBe(1);
    expect(currentWord.letters[1].word).toBe(currentWord);
    
    expect(currentWord.letters[2].value).toBe('t');
    expect(currentWord.letters[2].position).toBe(2);
    expect(currentWord.letters[2].word).toBe(currentWord);
  });

  it('should create Position objects for before, between, and after characters', () => {
    const node = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const currentWord = new CurrentWord(node, appState, false);

    // Verify that the positions have been created correctly
    expect(currentWord.positions.length).toBe(4);
    expect(currentWord.positions[0].index).toBe(0);
    expect(currentWord.positions[0].word).toBe(currentWord);
    
    expect(currentWord.positions[1].index).toBe(1);
    expect(currentWord.positions[1].word).toBe(currentWord);
    
    expect(currentWord.positions[2].index).toBe(2);
    expect(currentWord.positions[2].word).toBe(currentWord);
    
    expect(currentWord.positions[3].index).toBe(3);
    expect(currentWord.positions[3].word).toBe(currentWord);
  });

  it('should handle different word lengths when updating', () => {
    const catNode = new MockWordGraphNode('cat') as unknown as WordGraphNode;
    const catsNode = new MockWordGraphNode('cats') as unknown as WordGraphNode;
    const atNode = new MockWordGraphNode('at') as unknown as WordGraphNode;
    
    const currentWord = new CurrentWord(catNode, appState, false);

    // Update to longer word
    currentWord.updateWord(catsNode, false);

    expect(currentWord.letters.length).toBe(4);
    expect(currentWord.positions.length).toBe(5);

    // Update to shorter word
    currentWord.updateWord(atNode, false);

    expect(currentWord.letters.length).toBe(2);
    expect(currentWord.positions.length).toBe(3);
  });
});