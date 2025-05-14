import { CurrentWord } from '../../src/models/CurrentWord';
import { AppState } from '../../src/models/AppState';

describe('CurrentWord', () => {
  let appState: AppState;
  
  beforeEach(() => {
    appState = new AppState();
  });
  
  it('should initialize correctly with a word', () => {
    const word = 'cat';
    const currentWord = new CurrentWord(word, appState);

    expect(currentWord.value).toBe('cat');
    expect(currentWord.previouslyVisited).toBe(false);
    expect(currentWord.appState).toBe(appState);

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
    const currentWord = new CurrentWord('cat', appState);
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
    const currentWord = new CurrentWord('cat', appState);

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
    const currentWord = new CurrentWord('cat', appState);

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
    const currentWord = new CurrentWord('cat', appState);

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