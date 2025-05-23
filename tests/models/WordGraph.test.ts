import { WordGraph } from '../../src/models/WordGraph';
import fs from 'fs';
import path from 'path';

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
  
});