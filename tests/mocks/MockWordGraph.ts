import { WordGraph } from '../../src/models/WordGraph';

/**
 * Creates a mock WordGraph for testing
 */
export function createMockWordGraph(): WordGraph {
  const wordGraph = new WordGraph();
  
  // Add some test words
  const testWords = ['cat', 'bat', 'rat', 'fat', 'dog', 'cot', 'car'];
  
  // Create a mock graph JSON structure
  const graphData: Record<string, Record<string, unknown>> = {};
  
  testWords.forEach(word => {
    graphData[word] = {
      delete: '.'.repeat(word.length),
      replace: Array(word.length).fill('abcdefghijklmnopqrstuvwxyz').join('/'),
      insert: Array(word.length + 1).fill('abcdefghijklmnopqrstuvwxyz').join('/'),
      uppercase: '.'.repeat(word.length),
      lowercase: '.'.repeat(word.length),
    };
  });
  
  // Load the mock data into the graph
  wordGraph.loadFromJson(graphData);
  
  return wordGraph;
}