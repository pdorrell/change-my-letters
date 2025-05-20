import { WordLoader } from '../../src/models/WordLoader';
import { DataFileFetcherTestDouble } from '../test_doubles/DataFileFetcherTestDouble';
import { WordGraph } from '../../src/models/WordGraph';

// Mock the ErrorHandler
jest.mock('../../src/utils/ErrorHandler', () => ({
  ErrorHandler: {
    reportError: jest.fn()
  }
}));

describe('WordLoader', () => {
  const mockWordListText = 'cat\nhat\nrat\nbat\n';
  const mockJsonGraph = {
    cat: {
      delete: 'c.t',
      insert: 'a/b/c/d',
      replace: 'b/a/t',
    },
    hat: {
      delete: 'h.t',
      insert: 'a/b/c/d',
      replace: 'c/a/t',
    },
    bat: {
      delete: 'b.t',
      insert: 'a/b/c/d',
      replace: 'c/a/t',
    },
    at: {
      insert: 'a/b/c',
      replace: 'c/t',
    },
    ca: {
      insert: 'a/b/c',
      replace: 'c/t',
      delete: '.a'
    },
    ct: {
      insert: 'a/b/c',
      replace: 'c/a',
      delete: 'c.'
    }
  };

  // Set up a test double for the data file fetcher
  const routeMappings: [string, string][] = [
    ['/data/wordlists/default-words-graph.json', '/tests/data/wordlists/default-words-graph.json'],
    ['/data/wordlists/default-words.txt', '/tests/data/wordlists/default-words.txt'],
  ];
  
  let dataFileFetcher: DataFileFetcherTestDouble;
  let wordLoader: WordLoader;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    dataFileFetcher = new DataFileFetcherTestDouble(routeMappings);
    wordLoader = new WordLoader(dataFileFetcher);
    
    // Mock the fetch method
    jest.spyOn(dataFileFetcher, 'fetch').mockImplementation(async (url: string) => {
      if (url.includes('default-words.txt')) {
        return mockWordListText;
      } else if (url.includes('default-words-graph.json')) {
        return JSON.stringify(mockJsonGraph);
      }
      throw new Error(`File not found: ${url}`);
    });
  });

  it('should load a word list from text', () => {
    const wordList = wordLoader.loadWordListFromText(mockWordListText);
    
    expect(wordList).toEqual(['cat', 'hat', 'rat', 'bat']);
  });

  it('should load a word graph from JSON', () => {
    const graph = new WordGraph();
    wordLoader.loadWordGraphFromJson(JSON.stringify(mockJsonGraph), graph);
    
    // We can verify that the graph has the words we expect
    expect(graph.hasWord('cat')).toBe(true);
    expect(graph.hasWord('hat')).toBe(true);
  });

  it('should load a data file', async () => {
    const text = await wordLoader.loadDataFile('default-words.txt');
    
    expect(text).toBe(mockWordListText);
    expect(dataFileFetcher.fetch).toHaveBeenCalledWith('/data/wordlists/default-words.txt');
  });

  it('should create a sample word graph', () => {
    const graph = wordLoader.createSampleWordGraph();
    
    // Verify that we get a non-empty graph
    expect(graph).toBeInstanceOf(WordGraph);
    expect(graph.words.size).toBeGreaterThan(0);
  });

  it('should handle error when loading data file', async () => {
    // Mock fetch to throw an error
    jest.spyOn(dataFileFetcher, 'fetch').mockRejectedValueOnce(new Error('File not found'));
    
    const text = await wordLoader.loadDataFile('nonexistent-file.txt');
    expect(text).toBe('');
  });
  
  it('should load default word graph', async () => {
    // Mock populateChanges to prevent errors with references
    const originalPopulateChanges = WordGraph.prototype.populateChanges;
    WordGraph.prototype.populateChanges = jest.fn();
    
    try {
      const graph = await wordLoader.loadDefaultWordGraph();
      
      expect(graph).toBeInstanceOf(WordGraph);
      expect(dataFileFetcher.fetch).toHaveBeenCalledWith('/data/wordlists/default-words-graph.json');
    } finally {
      // Restore original method
      WordGraph.prototype.populateChanges = originalPopulateChanges;
    }
  });
});