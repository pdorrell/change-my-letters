import { WordGraph } from '../../src/models/WordGraph';
import { Word } from '../../src/models/Word';
import { Letter } from '../../src/models/Letter';
import { DeleteChange, InsertChange, ReplaceChange } from '../../src/models/WordChange';

describe('Word Changes Manual Test', () => {
  let wordGraph: WordGraph;

  beforeEach(() => {
    // Create a simple word graph manually for testing
    wordGraph = new WordGraph();
    
    // Create a simple JSON representation with all the words that need to be interconnected
    const graphJson = {
      "cat": {
        "delete": "cat",
        "replace": "brs/ou/r"
      },
      "bat": {
        "delete": "bat",
        "replace": "chr/ou/r"
      },
      "hat": {
        "delete": "hat",
        "replace": "bcr/ou/r"
      },
      "rat": {
        "delete": "rat",
        "replace": "bch/ou/r"
      },
      "car": {
        "delete": "car",
        "replace": "bhr/ou/t"
      },
      "at": {
        "delete": "at",
        "replace": "bchr/ou"
      },
      "ct": {
        "delete": "ct",
        "replace": "a/u"
      },
      "ca": {
        "delete": "ca",
        "replace": "r/t"
      },
      "sat": {
        "delete": "sat",
        "replace": "c/e/"
      },
      "cot": {
        "delete": "cot",
        "replace": "a//"
      },
      "cut": {
        "delete": "cut",
        "replace": "a//"
      }
    };
    
    // Load the word graph from JSON
    wordGraph.loadFromJson(graphJson);
    
    // Populate the changes
    wordGraph.populateChanges();
  });

  it('should populate the word graph correctly', () => {
    // Check all words exist
    expect(wordGraph.getNode('cat')).toBeTruthy();
    expect(wordGraph.getNode('bat')).toBeTruthy();
    expect(wordGraph.getNode('hat')).toBeTruthy();
    expect(wordGraph.getNode('rat')).toBeTruthy();
    expect(wordGraph.getNode('car')).toBeTruthy();
    expect(wordGraph.getNode('at')).toBeTruthy();
    expect(wordGraph.getNode('ct')).toBeTruthy();
    expect(wordGraph.getNode('ca')).toBeTruthy();
  });
  
  it('should create deleteChanges in Word correctly', () => {
    // Get the cat word
    const catWord = wordGraph.getNode('cat');
    expect(catWord).toBeTruthy();
    
    // Log the changes to debug
    console.log("Word 'cat' changes:", {
      deleteChanges: catWord!.changes.deleteChanges.map(dc => dc ? dc.result.word : null),
      replaceChanges: catWord!.changes.replaceChanges.map(arr => arr.map(rc => rc.letter))
    });
    
    // The first letter in 'cat' should be able to be deleted to form 'at'
    expect(catWord!.changes.deleteChanges[0]).not.toBeNull();
    if (catWord!.changes.deleteChanges[0]) {
      expect(catWord!.changes.deleteChanges[0].result.word).toBe('at');
    }
  });
  
  it('should create letter changes correctly', () => {
    // Manually set up the specific test case for a letter
    
    // Create a mock Word
    const catWord = wordGraph.getNode('cat');
    const atWord = wordGraph.getNode('at');
    expect(catWord).toBeTruthy();
    expect(atWord).toBeTruthy();
    
    // Create a letter
    const letter = new Letter(catWord!, 'c', 0);
    
    // Create mock changes
    const deleteChange = new DeleteChange(atWord!);
    const replaceChanges: ReplaceChange[] = [];
    
    // Set the changes directly on the letter
    letter.setChanges(deleteChange, replaceChanges);
    
    // Validate that the changes were set correctly
    expect(letter.changes.deleteChange).toBe(deleteChange);
    
    // Check again for good measure
    const letterDeleteChange = letter.changes.deleteChange;
    expect(letterDeleteChange).not.toBeNull();
    
    if (letterDeleteChange) {
      // Check that the deleteChange result is 'at'
      const resultWord = letterDeleteChange.result;
      expect(resultWord.word).toBe('at');
      expect(resultWord.word).toBe('at');
    }
    
    // Get the first letter (c)
    const cLetter = catWord!.letters[0];
    
    // Check that replaceChanges for first letter are correctly populated
    expect(cLetter.changes.replaceChanges.length).toBeGreaterThan(0);
    
    // Find the replacement for 'b'
    const batReplacement = cLetter.changes.replaceChanges.find(change => change.letter === 'b');
    expect(batReplacement).toBeTruthy();
    
    if (batReplacement) {
      // Check that the replaceChange result is 'bat'
      const resultWord = batReplacement.result;
      expect(resultWord.word).toBe('bat');
    }
  });
});