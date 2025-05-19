import { Letter } from '../../src/models/Letter';
import { DeleteChange, ReplaceChange } from '../../src/models/WordChange';
import { Word } from '../../src/models/Word';

describe('Letter Changes', () => {
  /**
   * This test directly validates that Letter.setChanges works as expected
   */
  it('should correctly set and get changes on a Letter', () => {
    // Create a mock Word
    const word = new Word('cat', [], [], []);
    
    // Create a letter
    const letter = new Letter(word, 'c', 0);
    
    // Create mock Word objects for results
    const atWord = new Word('at', [], [], []);
    const batWord = new Word('bat', [], [], []);
    const hatWord = new Word('hat', [], [], []);
    
    // Create mock changes
    const deleteChange = new DeleteChange(atWord);
    const replaceChanges = [
      new ReplaceChange(batWord, 'b'),
      new ReplaceChange(hatWord, 'h')
    ];
    
    // Set the changes on the letter
    letter.setChanges(deleteChange, replaceChanges);
    
    // Validate that the changes were set correctly
    expect(letter.changes.deleteChange).toBe(deleteChange);
    expect(letter.changes.replaceChanges).toEqual(replaceChanges);
    
    // Validate that the changes reference the correct words
    expect(letter.changes.deleteChange!.result).toBe(atWord);
    expect(letter.changes.replaceChanges[0].result).toBe(batWord);
    expect(letter.changes.replaceChanges[1].result).toBe(hatWord);
    expect(letter.changes.replaceChanges[0].letter).toBe('b');
    expect(letter.changes.replaceChanges[1].letter).toBe('h');
  });
});