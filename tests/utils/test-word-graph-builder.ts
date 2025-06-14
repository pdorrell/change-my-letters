import { WordGraph } from '@/models/word-graph';
import { WordGraphBuilder } from '@/models/word-graph-builder';

// Add a simple test to make Jest recognize this as a module with tests
describe('TestWordGraphBuilder', () => {
  it('exists and can be imported', () => {
    expect(createTestWordGraph).toBeDefined();
  });
});

/**
 * Simple word lists for testing
 */
export const testWordLists = {
  /**
   * A simple list of three-letter words with various transformations
   */
  threeLetterWords: [
    'cat', 'bat', 'hat', 'rat', 'sat', 'mat', 'pat',
    'car', 'bar', 'far', 'tar',
    'can', 'ban', 'fan', 'man', 'pan', 'ran', 'tan',
    'cot', 'dot', 'hot', 'lot', 'not', 'pot', 'rot',
    'cut', 'but', 'hut', 'nut', 'rut'
  ],

  /**
   * A list of four-letter words
   */
  fourLetterWords: [
    'test', 'best', 'rest', 'nest', 'pest', 'vest', 'west',
    'tent', 'bent', 'dent', 'lent', 'rent', 'sent', 'vent',
    'team', 'beam', 'seam', 'ream'
  ],

  /**
   * A mixed list of 3-4 letter words
   */
  mixedWords: [
    'cat', 'bat', 'hat', 'rat',
    'test', 'best', 'rest', 'nest',
    'car', 'bar', 'far',
    'team', 'beam', 'seam',
    'cut', 'but', 'hut'
  ],

  /**
   * A very small list for focused tests
   */
  minimal: [
    'cat', 'bat', 'hat', 'rat',
    'car', 'can'
  ]
};

/**
 * Create a word graph for testing purposes
 */
export function createTestWordGraph(words: string[] = testWordLists.minimal): WordGraph {
  // For tests, use the pre-defined sample graph JSON if we're asking for the minimal set
  // Otherwise, build a new one with the provided words
  const wordGraph = new WordGraph();

  if (words === testWordLists.minimal ||
      (words.length === testWordLists.minimal.length &&
       words.every(w => testWordLists.minimal.includes(w)))) {
    wordGraph.loadFromJson(sampleWordGraphJson);
  } else {
    const builder = new WordGraphBuilder(words);
    const jsonGraph = builder.build();
    wordGraph.loadFromJson(jsonGraph);
  }

  // Note: We don't call populateChanges() for test graphs because the sample data
  // contains references to words that aren't in the test word list (like 'bcat' from inserting 'b' into 'cat')
  // Tests that need populated changes should use createWordGraphFromJson() instead

  return wordGraph;
}

/**
 * Create a test word graph with a specific pre-computed graph structure
 */
export function createWordGraphFromJson(jsonData: Record<string, Record<string, unknown>>): WordGraph {
  const wordGraph = new WordGraph();
  wordGraph.loadFromJson(jsonData);
  wordGraph.populateChanges();
  return wordGraph;
}

/**
 * Sample JSON word graph for testing
 */
export const sampleWordGraphJson = {
  'cat': {
    'delete': 'c.t',
    'insert': 'b/a/t/r',
    'replace': 'b/a/r'
  },
  'bat': {
    'delete': 'b.t',
    'insert': 'c/a/t/r',
    'replace': 'c/a/r'
  },
  'hat': {
    'delete': 'h.t',
    'insert': 'c/a/t/r',
    'replace': 'c/a/r'
  },
  'rat': {
    'delete': 'r.t',
    'insert': 'c/a/t/r',
    'replace': 'c/a/r'
  },
  'car': {
    'delete': 'c.r',
    'insert': 'c/a/t/r',
    'replace': 'b/a/t'
  },
  'can': {
    'delete': 'c.n',
    'insert': 'c/a/t/r',
    'replace': 'c/a/r'
  },
  'at': {
    'delete': '..',
    'insert': 'c/b/h',
    'replace': 'c/r'
  },
  'ar': {
    'delete': '..',
    'insert': 'c/b/f',
    'replace': 'c/t'
  },
  'ca': {
    'delete': '..',
    'insert': 't/n/r',
    'replace': 'a/r'
  }
};
