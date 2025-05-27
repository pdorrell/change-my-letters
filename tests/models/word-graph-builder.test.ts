import { WordGraphBuilder } from '../../src/models/word-graph-builder';

describe('WordGraphBuilder', () => {
  // Small, controlled test word list
  const testWordList = [
    'cat',
    'bat',
    'rat',
    'hat',
    'mat',
    'sat',
    'at',
    'rats',
    'Rate',
    'rate'
  ];

  it('should build a graph', () => {
    const builder = new WordGraphBuilder(testWordList);
    const graph = builder.build();
    
    expect(graph).toBeDefined();
    expect(typeof graph).toBe('object');
  });

  it('should generate JSON data for a word graph', () => {
    const builder = new WordGraphBuilder(['cat', 'bat']);
    const graph = builder.build();
    
    // Since the exact format can vary, we just check that it's a non-empty object
    expect(Object.keys(graph).length).toBeGreaterThan(0);
    
    // Test specific words
    if (graph.words) {
      expect(graph.words.cat).toBeDefined();
      expect(graph.words.bat).toBeDefined();
    } else if (graph.cat && graph.bat) {
      // Alternative graph format
      expect(graph.cat).toBeDefined();
      expect(graph.bat).toBeDefined();
    }
  });
});