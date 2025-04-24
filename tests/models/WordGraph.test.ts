import { WordGraph } from '../../src/models/WordGraph';
import fs from 'fs';
import path from 'path';

describe('WordGraph', () => {
  it('generates a valid word graph with toJson/fromJson support', () => {
    // Load the word list
    const wordListPath = path.resolve(__dirname, '../../examples/example-words.txt');
    const wordList = fs.readFileSync(wordListPath, 'utf-8')
      .split('\n')
      .filter(word => word.trim().length > 0);
    
    // Generate a graph using the WordGraph class
    const wordGraph = new WordGraph();
    wordGraph.computeFromWordList(wordList);
    
    // Check that the graph contains words
    expect(wordGraph.words.size).toBeGreaterThan(0);
    
    // Test a few expected words from the example
    expect(wordGraph.hasWord('bet')).toBe(true);
    expect(wordGraph.hasWord('back')).toBe(true);
    
    // Validate that we can get nodes for the words
    const betNode = wordGraph.getWordNode('bet');
    expect(betNode).toBeDefined();
    
    // Minimal validation of node operations
    if (betNode) {
      // We should be able to replace 't' in 'bet' with 'g' to get 'beg'
      const replacements = betNode.getReplacements(2);
      expect(replacements).toContain('g');
    }
    
    // Test toJson method by converting to JSON and back
    const jsonGraph = wordGraph.toJson();
    expect(jsonGraph).toBeDefined();
    expect(Object.keys(jsonGraph).length).toBeGreaterThan(0);
    
    // Create a new graph from the JSON
    const newGraph = new WordGraph();
    newGraph.loadFromJson(jsonGraph);
    
    // Check that the graph was restored properly
    expect(newGraph.words.size).toBe(wordGraph.words.size);
    expect(newGraph.hasWord('bet')).toBe(true);
    
    // Check that the node data was preserved
    const newBetNode = newGraph.getWordNode('bet');
    expect(newBetNode).toBeDefined();
    
    if (newBetNode) {
      const newReplacements = newBetNode.getReplacements(2);
      expect(newReplacements).toContain('g');
    }
    
    // Test the subgraph identification and reporting
    const subgraphs = wordGraph.identifyConnectedSubgraphs();
    expect(subgraphs.length).toBeGreaterThan(0);
    
    // The total size of all subgraphs should equal the number of words
    const totalSize = subgraphs.reduce((sum, graph) => sum + graph.size, 0);
    expect(totalSize).toBe(wordGraph.words.size);
    
    // Test the report generation
    const report = wordGraph.generateSubgraphReport();
    expect(report).toContain('Word Graph Connectivity Report');
    expect(report).toContain(`Total words: ${wordGraph.words.size}`);
    expect(report).toContain(`Connected subgraphs: ${subgraphs.length}`);
    
    // The first subgraph should be the largest
    const largestSubgraph = subgraphs[0];
    expect(report).toContain(`Subgraph 1: ${largestSubgraph.size} words`);
  });
});