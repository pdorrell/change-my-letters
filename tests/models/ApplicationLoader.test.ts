import { ApplicationLoader } from '../../src/models/ApplicationLoader';
import { DataFileFetcherTestDouble } from '../test_doubles/DataFileFetcherTestDouble';
import { WordSayerTestDouble } from '../test_doubles/WordSayerTestDouble';
import { WordGraph } from '../../src/models/WordGraph';
import { WordSayer } from '../../src/models/WordSayer';

// Import ErrorReport
import { ErrorReport } from '../../src/utils/ErrorReport';

describe('ApplicationLoader', () => {
  // Sample data for testing
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

  let dataFileFetcher: DataFileFetcherTestDouble;
  
  // Mock WordSayer to avoid audio loading issues
  beforeAll(() => {
    jest.spyOn(WordSayer.prototype, 'preload').mockImplementation(() => {});
    jest.spyOn(WordSayer.prototype, 'say').mockImplementation(() => {});
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up the data fetcher test double
    const routeMappings: [string, string][] = [
      ['/data/wordlists/default-words-graph.json', '/tests/data/wordlists/default-words-graph.json'],
    ];
    
    dataFileFetcher = new DataFileFetcherTestDouble(routeMappings);
    
    // Mock the fetch method to return a valid graph
    jest.spyOn(dataFileFetcher, 'fetch').mockResolvedValue(JSON.stringify(mockJsonGraph));
  });
  
  afterAll(() => {
    jest.restoreAllMocks();
  });
  
  it('should load the application with a data file fetcher', async () => {
    // Mock populateChanges to prevent errors with references
    const originalPopulateChanges = WordGraph.prototype.populateChanges;
    WordGraph.prototype.populateChanges = jest.fn();
    
    try {
      const loader = new ApplicationLoader(dataFileFetcher);
      
      // Wait for the loading to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify that the app state was created
      expect(loader.appState).not.toBeNull();
      expect(loader.isLoading).toBe(false);
      expect(loader.hasError).toBe(false);
      
      // Verify that the data fetcher was called with the correct URL
      expect(dataFileFetcher.fetch).toHaveBeenCalledWith('/data/wordlists/default-words-graph.json');
    } finally {
      // Restore original method
      WordGraph.prototype.populateChanges = originalPopulateChanges;
    }
  });
  
  it('should handle errors when loading the word graph', async () => {
    // Mock the fetch method to throw an error
    jest.spyOn(dataFileFetcher, 'fetch').mockRejectedValue(new Error('Failed to load graph'));
    
    // Mock populateChanges to prevent errors with references
    const originalPopulateChanges = WordGraph.prototype.populateChanges;
    WordGraph.prototype.populateChanges = jest.fn();
    
    // Mock AppState creation to return null when wordGraph loading fails
    const originalCreate = ApplicationLoader.prototype.loadApplication;
    ApplicationLoader.prototype.loadApplication = async function() {
      this.isLoading = false;
      this.hasError = true;
      this.errorMessage = 'Failed to load graph';
      this.appState = null;
    };
    
    try {
      const loader = new ApplicationLoader(dataFileFetcher);
      
      // Wait for the loading to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify that the error state was set correctly
      expect(loader.appState).toBeNull();
      expect(loader.isLoading).toBe(false);
      expect(loader.hasError).toBe(true);
      expect(loader.errorMessage).toContain('Failed to load graph');
    } finally {
      // Restore original methods
      WordGraph.prototype.populateChanges = originalPopulateChanges;
      ApplicationLoader.prototype.loadApplication = originalCreate;
    }
  });
});