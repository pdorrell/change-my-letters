import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { AppState } from '../../src/models/AppState';
import { Word } from '../../src/models/Word';

// Create a mock for Word
class MockWord {
  word: string;
  deletes: boolean[];
  inserts: string[];
  replaces: string[];
  uppercase: boolean[];
  lowercase: boolean[];
  _letters: any[] | null = null;
  _positions: any[] | null = null;
  
  constructor(word: string) {
    this.word = word;
    this.deletes = Array(word.length).fill(true);
    this.inserts = Array(word.length + 1).fill('aeiou');
    this.replaces = Array(word.length).fill('bcdfghjklmnpqrstvwxyz');
    this.uppercase = Array(word.length).fill(true);
    this.lowercase = Array(word.length).fill(true);
  }
  
  get letters(): any[] {
    if (!this._letters) {
      this._letters = Array.from(this.word).map(
        (letter, index) => new Object() // mock letter
      );
    }
    return this._letters;
  }
  
  get positions(): any[] {
    if (!this._positions) {
      this._positions = Array(this.word.length + 1)
        .fill(0)
        .map((_, index) => ({ index }) as any);
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
  
  get possibleNextWords(): string[] {
    return ['bat', 'cat', 'dat', 'fat', 'rat', 'mat'];
  }
}

describe('WordInteraction', () => {
  let appState: AppState;
  
  beforeEach(() => {
    appState = {
      currentPage: 'wordView',
      history: { hasVisited: () => false },
      wordGraph: { getNode: (word: string) => new MockWord(word) as unknown as Word },
      isLoading: false,
    } as unknown as AppState;
  });
  
  it('should initialize correctly with a word', () => {
    const wordObj = new MockWord('cat') as unknown as Word;
    const hasBeenVisited = false;
    const currentWord = new WordInteraction(wordObj, appState, hasBeenVisited);

    expect(currentWord.value).toBe('cat');
    expect(currentWord.previouslyVisited).toBe(false);
    expect(currentWord.word).toBe(wordObj);

    // Should have 3 letterInteractions for 'cat'
    expect(currentWord.letterInteractions.length).toBe(3);
    
    // Should have 4 positionInteractions (before, between, and after letters)
    expect(currentWord.positionInteractions.length).toBe(4);
    // We can't directly check the position indexes because we're using mocks
  });

  it('should update word value and related properties', () => {
    const catWord = new MockWord('cat') as unknown as Word;
    const batWord = new MockWord('bat') as unknown as Word;
    const currentWord = new WordInteraction(catWord, appState, false);
    currentWord.updateWord(batWord, false);

    expect(currentWord.value).toBe('bat');
    expect(currentWord.word).toBe(batWord);

    // Should have 3 letterInteractions
    expect(currentWord.letterInteractions.length).toBe(3);
    
    // Should still have 4 positionInteractions
    expect(currentWord.positionInteractions.length).toBe(4);
  });

  it('should access letters and positions via getters', () => {
    const word = new MockWord('cat') as unknown as Word;
    const currentWord = new WordInteraction(word, appState, false);

    // letters and positions are getters that map from interactions
    expect(currentWord.letters.length).toBe(3);
    expect(currentWord.positions.length).toBe(4);
  });

  it('should handle different word lengths when updating', () => {
    const catWord = new MockWord('cat') as unknown as Word;
    const catsWord = new MockWord('cats') as unknown as Word;
    const atWord = new MockWord('at') as unknown as Word;
    
    const currentWord = new WordInteraction(catWord, appState, false);

    // Update to longer word
    currentWord.updateWord(catsWord, false);
    expect(currentWord.letterInteractions.length).toBe(4);
    expect(currentWord.positionInteractions.length).toBe(5);

    // Update to shorter word
    currentWord.updateWord(atWord, false);
    expect(currentWord.letterInteractions.length).toBe(2);
    expect(currentWord.positionInteractions.length).toBe(3);
  });
});