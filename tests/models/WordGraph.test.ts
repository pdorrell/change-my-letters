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
    
    // Create a simple test graph with two disconnected components
    // Group 1: cat, bat (connected)
    // Group 2: dog, log (connected)
    // These groups are not connected to each other
    
    // Add words
    wordGraph.words.add('cat');
    wordGraph.words.add('bat');
    wordGraph.words.add('dog');
    wordGraph.words.add('log');
    
    // Mock getConnectedWords to return connections
    wordGraph.getConnectedWords = jest.fn((word) => {
      if (word === 'cat') return ['bat'];
      if (word === 'bat') return ['cat'];
      if (word === 'dog') return ['log'];
      if (word === 'log') return ['dog'];
      return [];
    });
    
    const subgraphs = wordGraph.identifyConnectedSubgraphs();
    
    // Should have 2 subgraphs
    expect(subgraphs.length).toBe(2);
    
    // Each should have 2 words
    expect(subgraphs[0].size).toBe(2);
    expect(subgraphs[1].size).toBe(2);
    
    // Total words should match the original graph
    const totalWords = subgraphs.reduce((count, graph) => count + graph.size, 0);
    expect(totalWords).toBe(4);
  });
  
  it('generates a report for connected subgraphs', () => {
    const wordGraph = new WordGraph();
    
    // Add some words
    wordGraph.words.add('cat');
    wordGraph.words.add('bat');
    wordGraph.words.add('dog');
    
    // Mock identifyConnectedSubgraphs
    const mockSubgraphs = [
      new Set(['cat', 'bat']),
      new Set(['dog'])
    ];
    wordGraph.identifyConnectedSubgraphs = jest.fn().mockReturnValue(mockSubgraphs);
    
    const report = wordGraph.generateSubgraphReport();
    
    expect(report).toContain('Word Graph Connectivity Report');
    expect(report).toContain('Total words: 3');
    expect(report).toContain('Connected subgraphs: 2');
  });
});