import { WordGraph } from './WordGraph';
import { WordGraphBuilder } from './WordGraphBuilder';
import { ParseWordGraphJsonException } from './Word';
import { ErrorReport } from '../utils/ErrorReport';
import { DataFileFetcherInterface } from './DataFileFetcherInterface';

/**
 * Utility for loading word lists and example graphs
 */
export class WordLoader {
  /**
   * The fetcher used to load data files
   */
  private readonly dataFileFetcher: DataFileFetcherInterface;
  
  /**
   * Constructor
   * @param dataFileFetcher The fetcher to use for loading data files
   */
  constructor(dataFileFetcher: DataFileFetcherInterface) {
    this.dataFileFetcher = dataFileFetcher;
  }
  /**
   * Load a word list from text
   * Each word should be on a separate line
   */
  loadWordListFromText(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(word => word.length > 0);
  }

  /**
   * Load a pre-computed word graph from JSON text
   */
  loadWordGraphFromJson(json: string, wordGraph: WordGraph): void {
    try {
      const data = JSON.parse(json);
      wordGraph.loadFromJson(data);
    } catch (error) {
      // Create an ErrorReport with a context-specific message and the original error
      if (error instanceof ParseWordGraphJsonException) {
        throw new ErrorReport(`[Word Graph Parser] ${error.message}`, error);
      } else {
        throw new ErrorReport(`Error loading word graph from JSON`, error);
      }
    }
  }

  /**
   * Create a sample word graph for initial testing
   */
  createSampleWordGraph(): WordGraph {
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
      throw new ErrorReport('Error creating sample word graph', error);
    }
  }

  /**
   * Load a file from the data directory
   */
  async loadDataFile(filename: string): Promise<string> {
    try {
      // Use the dataFileFetcher to load the file
      return await this.dataFileFetcher.fetch(`/data/wordlists/${filename}`);
    } catch (error) {
      throw new ErrorReport(`Error loading data file ${filename}`, error);
    }
  }

  /**
   * Load the default word list and graph
   */
  async loadDefaultWordGraph(): Promise<WordGraph> {
    const wordGraph = new WordGraph();

    try {
      // Load the pre-computed graph
      let graphJson;
      try {
        graphJson = await this.loadDataFile('default-words-graph.json');
        
        // Load the JSON graph
        this.loadWordGraphFromJson(graphJson, wordGraph);
        console.log('Loaded default word graph from JSON');
      } catch (graphError) {
        // If loading the graph JSON fails, try building from word list
        try {
          const wordListText = await this.loadDataFile('default-words.txt');
          
          const wordList = this.loadWordListFromText(wordListText);
          const builder = new WordGraphBuilder(wordList);
          const jsonGraph = builder.build();
          
          wordGraph.loadFromJson(jsonGraph);
          console.log('Computed default word graph from word list');
        } catch (wordListError) {
          // If that also fails, try the sample graph
          try {
            return this.createSampleWordGraph();
          } catch (sampleGraphError) {
            // If all methods fail, throw a comprehensive error
            throw new ErrorReport('Failed to load or create any word graph', {
              graphError,
              wordListError,
              sampleGraphError
            });
          }
        }
      }
      
      // Populate the changes with direct object references
      wordGraph.populateChanges();

      return wordGraph;
    } catch (error) {
      // If the error is already an ErrorReport, rethrow it
      if (error instanceof ErrorReport) {
        throw error;
      }
      
      // Otherwise, wrap it in an ErrorReport
      throw new ErrorReport('Error loading default word graph', error);
    }
  }
}