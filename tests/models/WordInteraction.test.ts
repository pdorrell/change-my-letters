import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { LetterInteraction } from '../../src/models/interaction/LetterInteraction';
import { PositionInteraction } from '../../src/models/interaction/PositionInteraction';
import { Letter } from '../../src/models/Letter';
import { Position } from '../../src/models/Position';
import { Word } from '../../src/models/Word';
import { AppState } from '../../src/models/AppState';
import { WordSayerTestDouble } from '../test_doubles/WordSayerTestDouble';

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
  
  get possibleNextWords(): string[] {
    return ['bat', 'cat', 'dat', 'fat', 'rat', 'mat'];
  }
}

describe('WordInteraction', () => {
  let appState: AppState;
  
  beforeEach(() => {
    const wordSayerTestDouble = new WordSayerTestDouble();
    appState = {
      currentPage: 'wordView',
      history: { hasVisited: () => false },
      wordGraph: { getNode: (word: string) => new MockWord(word) as unknown as Word },
      isLoading: false,
      wordSayer: wordSayerTestDouble,
    } as unknown as AppState;
  });
  
  it('should initialize correctly with a word', () => {
    const wordObj = new MockWord('cat') as unknown as Word;
    const hasBeenVisited = false;
    const wordInteraction = new WordInteraction(wordObj, appState, hasBeenVisited);

    expect(wordInteraction.value).toBe('cat');
    expect(wordInteraction.previouslyVisited).toBe(false);
    expect(wordInteraction.word).toBe(wordObj);

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
    const catWord = new MockWord('cat') as unknown as Word;
    const batWord = new MockWord('bat') as unknown as Word;
    const wordInteraction = new WordInteraction(catWord, appState, false);
    wordInteraction.updateWord(batWord, false);

    expect(wordInteraction.value).toBe('bat');
    expect(wordInteraction.word).toBe(batWord);

    // Should still have 3 letterInteractions
    expect(wordInteraction.letterInteractions.length).toBe(3);
    
    // Should still have 4 positionInteractions
    expect(wordInteraction.positionInteractions.length).toBe(4);
  });

  it('should create letterInteractions for each character', () => {
    const wordObj = new MockWord('cat') as unknown as Word;
    const wordInteraction = new WordInteraction(wordObj, appState, false);

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
    const wordObj = new MockWord('cat') as unknown as Word;
    const wordInteraction = new WordInteraction(wordObj, appState, false);

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
    const catWord = new MockWord('cat') as unknown as Word;
    const catsWord = new MockWord('cats') as unknown as Word;
    const atWord = new MockWord('at') as unknown as Word;
    
    const wordInteraction = new WordInteraction(catWord, appState, false);

    // Update to longer word
    wordInteraction.updateWord(catsWord, false);

    expect(wordInteraction.letterInteractions.length).toBe(4);
    expect(wordInteraction.positionInteractions.length).toBe(5);

    // Update to shorter word
    wordInteraction.updateWord(atWord, false);

    expect(wordInteraction.letterInteractions.length).toBe(2);
    expect(wordInteraction.positionInteractions.length).toBe(3);
  });

  it('should close all menus', () => {
    const wordObj = new MockWord('cat') as unknown as Word;
    const wordInteraction = new WordInteraction(wordObj, appState, false);
    
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

  it('should have a computed value property that returns the word string', () => {
    const wordObj = new MockWord('hello') as unknown as Word;
    const wordInteraction = new WordInteraction(wordObj, appState, false);
    
    expect(wordInteraction.value).toBe('hello');
    
    // Update the word and check that value updates
    const newWord = new MockWord('world') as unknown as Word;
    wordInteraction.updateWord(newWord, false);
    
    expect(wordInteraction.value).toBe('world');
  });
  
  it('should update previouslyVisited when word changes', () => {
    const wordObj = new MockWord('cat') as unknown as Word;
    const wordInteraction = new WordInteraction(wordObj, appState, false);
    
    expect(wordInteraction.previouslyVisited).toBe(false);
    
    wordInteraction.updateWord(wordObj, true);
    
    expect(wordInteraction.previouslyVisited).toBe(true);
  });

  it('should initialize with a string and get the word from the graph', () => {
    const wordInteraction = new WordInteraction('cat', appState, false);
    
    expect(wordInteraction.value).toBe('cat');
    expect(wordInteraction.letterInteractions.length).toBe(3);
    expect(wordInteraction.positionInteractions.length).toBe(4);
  });
  
  it('should call the wordSayer.say method with the current word', () => {
    const wordObj = new MockWord('cat') as unknown as Word;
    const wordInteraction = new WordInteraction(wordObj, appState, false);
    
    // Call the say method
    wordInteraction.say();
    
    // Verify that the test double's say method was called with 'cat'
    expect((appState.wordSayer as WordSayerTestDouble).playedWords).toEqual(['cat']);
  });
});