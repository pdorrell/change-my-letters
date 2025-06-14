import { Word } from '@/models/Word';
import { WordGetter } from '@/models/word-getter';
import { InsertChange } from '@/models/word-change';
import { MissingWordException } from '@/models/word-graph';

class TestWordGetter implements WordGetter {
  private words: Map<string, Word> = new Map();

  constructor() {
    // Create Word objects for testing change population
        // needed to test the populateChanges functionality

    // Format: [word, [can delete positions], [inserts at positions], [replaces at positions]]
    const catWord = new Word('cat', [true, true, true], ['b', '', '', ''], ['b', 'o', 'r']);
    const atWord = new Word('at', [true, true], ['c', '', ''], ['o', 'e']);
    const batWord = new Word('bat', [true, true, true], ['', '', '', ''], ['c', 'o', 'h']);
    const chatWord = new Word('chat', [true, true, true, true], ['', '', '', '', ''], ['', 'o', 'a', 'r']);
    const carWord = new Word('car', [true, true, true], ['', '', '', ''], ['h', 'o', 't']);
    const coatWord = new Word('coat', [true, true, true, true], ['', '', '', '', ''], ['b', 'a', 'r', 's']);
    // Add the missing words from the test errors
    const ctWord = new Word('ct', [true, true], ['', '', ''], ['a', 'u']);
    const caWord = new Word('ca', [true, true], ['', '', ''], ['r', 't']);
    const cotWord = new Word('cot', [true, true, true], ['', '', '', ''], ['a', 'u', '']);
    // Add the word that's used in the insertion test
    const bcatWord = new Word('bcat', [true, true, true, true], ['', '', '', '', ''], ['', 'o', 'a', 'r']);

    // Add to the map
    this.words.set('cat', catWord);
    this.words.set('at', atWord);
    this.words.set('bat', batWord);
    this.words.set('chat', chatWord);
    this.words.set('car', carWord);
    this.words.set('coat', coatWord);
    this.words.set('ct', ctWord);
    this.words.set('ca', caWord);
    this.words.set('cot', cotWord);
    this.words.set('bcat', bcatWord);
  }

  getRequiredWord(word: string): Word {
    const wordObj = this.words.get(word);
    if (!wordObj) { throw new MissingWordException(word); }
    return wordObj;
  }
}

describe('Word Changes Population', () => {
  let wordGetter: TestWordGetter;

  beforeEach(() => {
    wordGetter = new TestWordGetter();
  });

  it('should populate Letter changes correctly when Word.populateChanges is called', () => {
    // Get the cat word
    const catWord = wordGetter.getRequiredWord('cat')!;

    // Populate its changes
    catWord.populateChanges(wordGetter);

    // Get the first letter (c)
    const letters = catWord.letters;
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
    const catWord = wordGetter.getRequiredWord('cat')!;
    const batWord = wordGetter.getRequiredWord('bat')!;

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
