import { CurrentWord } from '../../src/models/CurrentWord';
import { Letter } from '../../src/models/Letter';
import { Position } from '../../src/models/Position';

// Mock Letter and Position classes
jest.mock('../../src/models/Letter', () => ({
  Letter: jest.fn().mockImplementation((value, position) => ({
    value,
    position
  }))
}));

jest.mock('../../src/models/Position', () => ({
  Position: jest.fn().mockImplementation((index) => ({
    index
  }))
}));

describe('CurrentWord', () => {
  it('should initialize correctly with a word', () => {
    const word = 'cat';
    const currentWord = new CurrentWord(word);
    
    expect(currentWord.value).toBe('cat');
    expect(currentWord.previouslyVisited).toBe(false);
    
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
    const currentWord = new CurrentWord('cat');
    currentWord.updateWord('bat');
    
    expect(currentWord.value).toBe('bat');
    
    // Should have 3 letters for 'bat'
    expect(currentWord.letters.length).toBe(3);
    expect(currentWord.letters[0].value).toBe('b');
    expect(currentWord.letters[1].value).toBe('a');
    expect(currentWord.letters[2].value).toBe('t');
    
    // Should still have 4 positions
    expect(currentWord.positions.length).toBe(4);
  });

  it('should create Letter objects for each character', () => {
    const currentWord = new CurrentWord('cat');
    
    expect(Letter).toHaveBeenCalledWith('c', 0);
    expect(Letter).toHaveBeenCalledWith('a', 1);
    expect(Letter).toHaveBeenCalledWith('t', 2);
  });

  it('should create Position objects for before, between, and after characters', () => {
    const currentWord = new CurrentWord('cat');
    
    expect(Position).toHaveBeenCalledWith(0); // Before 'c'
    expect(Position).toHaveBeenCalledWith(1); // Between 'c' and 'a'
    expect(Position).toHaveBeenCalledWith(2); // Between 'a' and 't'
    expect(Position).toHaveBeenCalledWith(3); // After 't'
  });

  it('should handle different word lengths when updating', () => {
    const currentWord = new CurrentWord('cat');
    
    // Update to longer word
    currentWord.updateWord('cats');
    
    expect(currentWord.letters.length).toBe(4);
    expect(currentWord.positions.length).toBe(5);
    
    // Update to shorter word
    currentWord.updateWord('at');
    
    expect(currentWord.letters.length).toBe(2);
    expect(currentWord.positions.length).toBe(3);
  });
});