import { WordGraph } from './WordGraph';
import { WordGraphBuilder } from './WordGraphBuilder';

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

    const builder = new WordGraphBuilder(wordList);
    const jsonGraph = builder.build();
    wordGraph.loadFromJson(jsonGraph);
    return wordGraph;
  }

  /**
   * Load a file from the data directory
   */
  static async loadDataFile(filename: string): Promise<string> {
    try {
      // In webpack dev server, the files will be in the /data directory
      const response = await fetch(`/data/wordlists/${filename}`);
      return await response.text();
    } catch (error) {
      console.error(`Error loading data file ${filename}:`, error);
      return '';
    }
  }

  /**
   * Load the default word list and graph
   */
  static async loadDefaultWordGraph(): Promise<WordGraph> {
    const wordGraph = new WordGraph();

    try {
      // Load the pre-computed graph
      const graphJson = await WordLoader.loadDataFile('default-words-graph.json');

      if (graphJson) {
        WordLoader.loadWordGraphFromJson(graphJson, wordGraph);
        console.log('Loaded default word graph from JSON');
      } else {
        // Fallback to computing from word list
        const wordListText = await WordLoader.loadDataFile('default-words.txt');
        if (wordListText) {
          const wordList = WordLoader.loadWordListFromText(wordListText);
          const builder = new WordGraphBuilder(wordList);
          const jsonGraph = builder.build();
          wordGraph.loadFromJson(jsonGraph);
          console.log('Computed default word graph from word list');
        } else {
          // Ultimate fallback to sample graph
          return WordLoader.createSampleWordGraph();
        }
      }

      return wordGraph;
    } catch (error) {
      console.error('Error loading default word graph:', error);
      return WordLoader.createSampleWordGraph();
    }
  }
}
