import { CurrentWord } from '../../src/models/CurrentWord';
import { Letter } from '../../src/models/Letter';
import { Position } from '../../src/models/Position';
import { AppState } from '../../src/models/AppState';

// Mock the AppState
const mockAppState = {};

// Mock Letter and Position classes
jest.mock('../../src/models/Letter', () => ({
  Letter: jest.fn().mockImplementation((value, position, word) => ({
    value,
    position,
    word
  }))
}));

jest.mock('../../src/models/Position', () => ({
  Position: jest.fn().mockImplementation((index, word) => ({
    index,
    word
  }))
}));

describe('CurrentWord', () => {
  it('should initialize correctly with a word', () => {
    const word = 'cat';
    const currentWord = new CurrentWord(word, mockAppState);

    expect(currentWord.value).toBe('cat');
    expect(currentWord.previouslyVisited).toBe(false);
    expect(currentWord.appState).toBe(mockAppState);

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
    const currentWord = new CurrentWord('cat', mockAppState);
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
    const currentWord = new CurrentWord('cat', mockAppState);

    // Check if the Letter constructor was called with correct arguments
    // The first calls will be with the word parameter as an instance of CurrentWord
    expect(Letter).toHaveBeenCalledWith('c', 0, expect.anything());
    expect(Letter).toHaveBeenCalledWith('a', 1, expect.anything());
    expect(Letter).toHaveBeenCalledWith('t', 2, expect.anything());
  });

  it('should create Position objects for before, between, and after characters', () => {
    const currentWord = new CurrentWord('cat', mockAppState);

    // Check if the Position constructor was called with correct arguments
    // The first calls will be with the word parameter as an instance of CurrentWord
    expect(Position).toHaveBeenCalledWith(0, expect.anything()); // Before 'c'
    expect(Position).toHaveBeenCalledWith(1, expect.anything()); // Between 'c' and 'a'
    expect(Position).toHaveBeenCalledWith(2, expect.anything()); // Between 'a' and 't'
    expect(Position).toHaveBeenCalledWith(3, expect.anything()); // After 't'
  });

  it('should handle different word lengths when updating', () => {
    const currentWord = new CurrentWord('cat', mockAppState);

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