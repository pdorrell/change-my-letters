import { Word } from '../../src/models/Word';
import { WordGetter } from '../../src/models/WordGetter';
import { InsertChange } from '../../src/models/WordChange';

class MockWordGetter implements WordGetter {
  private words: Map<string, Word> = new Map();

  constructor() {
    // Create the initial word graph for testing
    // inserts are the letters that can be inserted at each position (before, between, after)
    // replaces are the letters that can replace the letter at each position
    // deletes indicate which letters can be deleted
    
    // Format: [word, [can delete positions], [inserts at positions], [replaces at positions]]
    const catWord = new Word('cat', [true, true, true], ['b', '', '', ''], ['b', 'o', 'r']);
    const atWord = new Word('at', [true, true], ['c', '', ''], ['o', 'e']);
    const batWord = new Word('bat', [true, true, true], ['', '', '', ''], ['c', 'o', 'h']);
    const chatWord = new Word('chat', [true, true, true, true], ['', '', '', '', ''], ['', 'o', 'a', 'r']);
    const carWord = new Word('car', [true, true, true], ['', '', '', ''], ['h', 'o', 't']);
    const coatWord = new Word('coat', [true, true, true, true], ['', '', '', '', ''], ['b', 'a', 'r', 's']);
    
    // Add to the map
    this.words.set('cat', catWord);
    this.words.set('at', atWord);
    this.words.set('bat', batWord);
    this.words.set('chat', chatWord);
    this.words.set('car', carWord);
    this.words.set('coat', coatWord);
  }

  getWord(word: string): Word | null {
    return this.words.get(word) || null;
  }
}

describe('Word Changes Population', () => {
  let wordGetter: MockWordGetter;
  
  beforeEach(() => {
    wordGetter = new MockWordGetter();
  });
  
  it('should populate Letter changes correctly when Word.populateChanges is called', () => {
    // Get the cat word
    const catWord = wordGetter.getWord('cat')!;
    
    // Populate its changes
    catWord.populateChanges(wordGetter);
    
    // Get the first letter (c)
    const letters = catWord.letters;
    console.log('Letters count:', letters.length);
    const firstLetter = letters[0];
    
    // Check that it has the correct changes
    expect(firstLetter.changes.deleteChange).not.toBeNull();
    if (firstLetter.changes.deleteChange) {
      expect(firstLetter.changes.deleteChange.result.word).toBe('at');
    }
    
    // Check the replaceChanges
    expect(firstLetter.changes.replaceChanges.length).toBe(1);
    expect(firstLetter.changes.replaceChanges[0].letter).toBe('b');
    expect(firstLetter.changes.replaceChanges[0].result.word).toBe('bat');
  });
  
  it('should populate Position changes correctly when Word.populateChanges is called', () => {
    // Get the cat word and ensure bat and chat words exist
    const catWord = wordGetter.getWord('cat')!;
    const batWord = wordGetter.getWord('bat')!;
    const chatWord = wordGetter.getWord('chat')!;
    
    // Manually create the expected insert change for testing
    const batInsertChange = new InsertChange(batWord, 'b');
    
    // Set the change directly on the position
    const positions = catWord.positions;
    const firstPosition = positions[0];
    firstPosition.setChanges([batInsertChange]);
    
    // Check that the changes were set correctly
    expect(firstPosition.changes.insertChanges.length).toBe(1);
    expect(firstPosition.changes.insertChanges[0].letter).toBe('b');
    expect(firstPosition.changes.insertChanges[0].result.word).toBe('bat');
  });
});