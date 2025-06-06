import { WordGraph } from '@/models/word-graph';

describe('WordGraph', () => {
  it('creates a word graph', () => {
    const wordGraph = new WordGraph();
    expect(wordGraph).toBeDefined();
  });

  it('can add words to the graph', () => {
    const wordGraph = new WordGraph();

    // Manually add words to test
    wordGraph.words.add('cat');
    wordGraph.words.add('bat');

    expect(wordGraph.words.has('cat')).toBe(true);
    expect(wordGraph.words.has('bat')).toBe(true);
    expect(wordGraph.words.has('dog')).toBe(false);
  });

  it('can load a graph from JSON data', () => {
    const wordGraph = new WordGraph();

    // Create simple mock JSON data
    const mockData = {
      words: {
        cat: { replace: 'b' },
        bat: { replace: 'c' }
      }
    };

    // We don't need to verify internal implementation
    // Just make sure it doesn't throw
    expect(() => {
      wordGraph.loadFromJson(mockData);
    }).not.toThrow();
  });

  it('can identify subgraphs in a disconnected graph', () => {
    const wordGraph = new WordGraph();

    // Create a test graph with specific connection patterns
    // Group 1: cat <-> bat (connected by replacing first letter c/b)
    // Group 2: dog <-> cog (connected by replacing first letter d/c)
    // Group 3: fox (isolated word)
    const jsonData = {
      'cat': {
        'delete': '...',      // No deletions
        'insert': '///',     // No insertions (4 positions for 3-letter word)
        'replace': 'b//'      // cat -> bat by replacing 'c' with 'b' at position 0
      },
      'bat': {
        'delete': '...',      // No deletions
        'insert': '///',     // No insertions
        'replace': 'c//'      // bat -> cat by replacing 'b' with 'c' at position 0
      },
      'dog': {
        'delete': '...',      // No deletions
        'insert': '///',     // No insertions
        'replace': 'c//'      // dog -> cog by replacing 'd' with 'c' at position 0
      },
      'cog': {
        'delete': '...',      // No deletions
        'insert': '///',     // No insertions
        'replace': 'd//'      // cog -> dog by replacing 'c' with 'd' at position 0
      },
      'fox': {
        'delete': '...',      // No deletions
        'insert': '///',     // No insertions
        'replace': '//'      // No replacements (3 positions for 3-letter word)
      }
    };

    // Load the graph from JSON data
    wordGraph.loadFromJson(jsonData);
    wordGraph.populateChanges();

    const subgraphs = wordGraph.identifyConnectedSubgraphs();

    // Should have 3 subgraphs (sorted by size, largest first)
    expect(subgraphs.length).toBe(3);

    // The largest subgraphs should have 2 words each
    expect(subgraphs[0].size).toBe(2);
    expect(subgraphs[1].size).toBe(2);

    // The smallest should have 1 word (isolated)
    expect(subgraphs[2].size).toBe(1);

    // Check the content of subgraphs
    const subgraph1 = Array.from(subgraphs[0]).sort();
    const subgraph2 = Array.from(subgraphs[1]).sort();
    const subgraph3 = Array.from(subgraphs[2]);

    // One subgraph should contain cat and bat
    // Another should contain dog and cog
    // The third should contain fox
    const allSubgraphs = [subgraph1, subgraph2];
    expect(allSubgraphs).toContainEqual(['bat', 'cat']);
    expect(allSubgraphs).toContainEqual(['cog', 'dog']);
    expect(subgraph3).toEqual(['fox']);

    // Total words should match the original graph
    const totalWords = subgraphs.reduce((count, graph) => count + graph.size, 0);
    expect(totalWords).toBe(5);
  });

  it('should return correct maxWordLength', () => {
    const wordGraph = new WordGraph();

    // Empty graph should return 0
    expect(wordGraph.maxWordLength).toBe(0);

    // Load a graph with words of different lengths using valid format
    const testData = {
      'cat': { delete: '...', insert: 'a/b/c/d', replace: 'a/b/c' },
      'elephant': { delete: '........', insert: 'a/b/c/d/e/f/g/h/i', replace: 'a/b/c/d/e/f/g/h' },
      'a': { delete: '.', insert: 'b/c', replace: 'b' },
      'hello': { delete: '.....', insert: 'a/b/c/d/e/f', replace: 'a/b/c/d/e' }
    };

    wordGraph.loadFromJson(testData);

    // Should return the length of the longest word ('elephant' = 8)
    expect(wordGraph.maxWordLength).toBe(8);
  });

  it('should roundtrip toJson -> loadFromJson correctly', () => {
    const originalGraph = new WordGraph();

    // Create a graph with some test data
    const testData = {
      'cat': { delete: 'c.t', insert: 'ab/cd/ef/gh', replace: 'bd/ac/sg' },
      'bat': { delete: 'b..', insert: 'xy/zw/uv/rs', replace: 'ca/bt/sg' },
      'hello': { delete: 'h....', insert: 'a/b/c/d/e/f', replace: 'w/x/y/z/q' }
    };

    originalGraph.loadFromJson(testData);

    // Convert to JSON and back
    const json = originalGraph.toJson();
    const recreatedGraph = new WordGraph();
    recreatedGraph.loadFromJson(json);

    // Verify the recreated graph has the same words
    expect(recreatedGraph.words.size).toBe(originalGraph.words.size);
    expect(Array.from(recreatedGraph.words).sort()).toEqual(Array.from(originalGraph.words).sort());

    // Verify individual words have the same properties
    for (const wordStr of originalGraph.words) {
      const originalWord = originalGraph.getWordObj(wordStr);
      const recreatedWord = recreatedGraph.getWordObj(wordStr);

      expect(recreatedWord).toBeDefined();
      expect(recreatedWord!.word).toBe(originalWord!.word);
      expect(recreatedWord!.deletes).toEqual(originalWord!.deletes);
      expect(recreatedWord!.inserts).toEqual(originalWord!.inserts);
      expect(recreatedWord!.replaces).toEqual(originalWord!.replaces);
    }
  });

});
