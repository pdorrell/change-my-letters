import { WordGraph } from '@/models/word-graph';
import { WordGraphBuilder } from '@/models/word-graph-builder';
import { ParseWordGraphJsonException } from '@/models/Word';
import { DataFileFetcherInterface } from '@/lib/data-fetching/data-file-fetcher-interface';

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
      // Create an Error with a context-specific message and the original error
      if (error instanceof ParseWordGraphJsonException) {
        throw new Error(`[Word Graph Parser] ${error.message}`);
      } else {
        throw new Error(`Error loading word graph from JSON: ${error}`);
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
      throw new Error(`Error creating sample word graph: ${error}`);
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
      throw new Error(`Error loading data file ${filename}: ${error}`);
    }
  }

  /**
   * Check if an error is due to a file not being found (404, network error, etc.)
   * vs the file existing but containing invalid data
   */
  private isFileNotFoundError(error: unknown): boolean {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      // Check for common file not found indicators
      return errorMessage.includes('not found') ||
             errorMessage.includes('404') ||
             errorMessage.includes('failed to fetch') ||
             errorMessage.includes('network error') ||
             errorMessage.includes('error loading data file');
    }
    return false;
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
      } catch (graphError) {
        // If loading the graph JSON fails, try building from word list
        try {
          const wordListText = await this.loadDataFile('default-words.txt');

          const wordList = this.loadWordListFromText(wordListText);
          const builder = new WordGraphBuilder(wordList);
          const jsonGraph = builder.build();

          wordGraph.loadFromJson(jsonGraph);
        } catch (wordListError) {
          // Check if both errors are due to missing files (network/404 errors)
          // vs malformed data (parsing errors). Only fall back for missing files.
          const isGraphFileMissing = this.isFileNotFoundError(graphError);
          const isWordListFileMissing = this.isFileNotFoundError(wordListError);

          if (isGraphFileMissing && isWordListFileMissing) {
            // Both files are missing - fall back to sample graph
            try {
              return this.createSampleWordGraph();
            } catch (sampleGraphError) {
              throw new Error(`Failed to load or create any word graph. Graph error: ${graphError}, Word list error: ${wordListError}, Sample graph error: ${sampleGraphError}`);
            }
          } else {
            // At least one file exists but has malformed data - fail without fallback
            throw new Error(`Failed to load word graph - data sources contain invalid data. Graph error: ${graphError}, Word list error: ${wordListError}`);
          }
        }
      }

      // Populate the changes with direct object references
      wordGraph.populateChanges();

      return wordGraph;
    } catch (error) {
      // Wrap any error in a standardized Error
      throw new Error(`Error loading default word graph: ${error}`);
    }
  }
}
