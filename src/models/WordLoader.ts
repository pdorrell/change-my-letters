import { WordGraph } from './WordGraph';
import { WordGraphBuilder } from './WordGraphBuilder';
import { ParseWordGraphJsonException } from './Word';
import { ErrorHandler } from '../utils/ErrorHandler';

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
      // Explicitly capture and display the error
      if (error instanceof ParseWordGraphJsonException) {
        ErrorHandler.reportError(error, 'Word Graph Parser');
      } else {
        ErrorHandler.reportError(`Error loading word graph from JSON: ${error}`, 'Word Loader');
      }
      throw error; // Re-throw to be handled by the caller
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
    
    try {
      wordGraph.loadFromJson(jsonGraph);
      
      // Populate the changes with direct object references
      wordGraph.populateChanges();
      
      return wordGraph;
    } catch (error) {
      // Even the sample graph could theoretically have an error
      ErrorHandler.reportError(`Error creating sample word graph: ${error}`, 'Word Loader');
      
      // Return an empty graph in this case
      return new WordGraph();
    }
  }

  /**
   * Load a file from the data directory
   */
  static async loadDataFile(filename: string): Promise<string> {
    try {
      // In webpack dev server, the files will be in the /data directory
      const response = await fetch(`/data/wordlists/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      ErrorHandler.reportError(`Error loading data file ${filename}: ${error}`, 'Word Loader');
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
        // Load the JSON graph - no fallback, if this fails we let the exception propagate
        WordLoader.loadWordGraphFromJson(graphJson, wordGraph);
        console.log('Loaded default word graph from JSON');
      } else {
        // Only if the JSON file wasn't found, try building from word list
        const wordListText = await WordLoader.loadDataFile('default-words.txt');
        if (wordListText) {
          const wordList = WordLoader.loadWordListFromText(wordListText);
          const builder = new WordGraphBuilder(wordList);
          const jsonGraph = builder.build();
          wordGraph.loadFromJson(jsonGraph);
          console.log('Computed default word graph from word list');
        } else {
          // If neither file exists, use sample graph
          return WordLoader.createSampleWordGraph();
        }
      }
      
      // Populate the changes with direct object references
      wordGraph.populateChanges();

      return wordGraph;
    } catch (error) {
      // Display error to the user
      ErrorHandler.reportError(`Error loading default word graph: ${error}`, 'Word Loader');
      
      // Re-throw the error to prevent fallback - as requested
      throw error;
    }
  }
}