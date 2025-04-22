import { WordGraph } from './WordGraph';

/**
 * Utility for loading word lists and example graphs
 */
export class WordLoader {
  /**
   * Load a word list from text
   * Each word should be on a separate line
   */
  static loadWordListFromText(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(word => word.length > 0);
  }
  
  /**
   * Load a pre-computed word graph from JSON text
   */
  static loadWordGraphFromJson(json: string, wordGraph: WordGraph): void {
    try {
      const data = JSON.parse(json);
      wordGraph.loadFromJson(data);
    } catch (error) {
      console.error('Error loading word graph from JSON:', error);
    }
  }
  
  /**
   * Create a sample word graph for initial testing
   */
  static createSampleWordGraph(): WordGraph {
    const wordGraph = new WordGraph();
    const wordList = [
      'cat', 'bat', 'hat', 'mat', 'rat',
      'car', 'bar', 'far',
      'can', 'ban', 'fan', 'ran',
      'cot', 'dot', 'hot', 'lot', 'rot',
      'cut', 'but', 'hut', 'nut', 'rut',
      'dog', 'fog', 'hog', 'log', 'bog',
      'dig', 'fig', 'pig', 'rig', 'big'
    ];
    
    wordGraph.computeFromWordList(wordList);
    return wordGraph;
  }
  
  /**
   * Load an example file from the examples directory
   */
  static async loadExampleFile(filename: string): Promise<string> {
    try {
      const response = await fetch(`./examples/${filename}`);
      return await response.text();
    } catch (error) {
      console.error(`Error loading example file ${filename}:`, error);
      return '';
    }
  }
}