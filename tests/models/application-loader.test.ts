import { ApplicationLoader } from '@/models/application-loader';
import { DataFileFetcherTestDouble } from '@/tests/test_doubles/data-file-fetcher-test-double';
import { AudioFilePlayerTestDouble } from '@/tests/test_doubles/audio-file-player-test-double';

describe('ApplicationLoader', () => {
  let dataFileFetcher: DataFileFetcherTestDouble;
  let audioFilePlayer: AudioFilePlayerTestDouble;

  beforeEach(() => {
    // Set up the data fetcher test double to serve test files
    const routeMappings: [string, string][] = [
      ['/data/wordlists/default-words-graph.json', '/tests/data/word_loader_test/wordlists/default-words-graph.json'],
    ];

    dataFileFetcher = new DataFileFetcherTestDouble(routeMappings);
    audioFilePlayer = new AudioFilePlayerTestDouble('/assets/words/amazon_polly');
  });

  it('should load the application with test data files', async () => {
    const loader = new ApplicationLoader(audioFilePlayer, dataFileFetcher);

    // Wait for the loading to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // Verify that the app state was created successfully
    expect(loader.appState).not.toBeNull();
    expect(loader.isLoading).toBe(false);
    expect(loader.hasError).toBe(false);
    expect(loader.errorMessage).toBe('');

    // Verify that the data was loaded from test files
    expect(loader.appState?.wordGraph).toBeDefined();
    expect(loader.appState?.wordGraph.words.size).toBeGreaterThan(0);

    // Verify that we can get a word from the loaded graph
    const catWord = loader.appState?.wordGraph.getNode('cat');
    expect(catWord).toBeDefined();
    expect(catWord?.word).toBe('cat');

    // Verify that the audio file player test double was used
    expect(loader.appState?.audioFilePlayer).toBe(audioFilePlayer);
  });

  it('should fall back to sample graph when data files are missing', async () => {
    // Create a data fetcher that maps to non-existent files for both JSON and TXT
    const badRouteMappings: [string, string][] = [
      ['/data/wordlists/default-words-graph.json', '/tests/data/nonexistent.json'],
      ['/data/wordlists/default-words.txt', '/tests/data/nonexistent.txt'],
    ];

    const badDataFileFetcher = new DataFileFetcherTestDouble(badRouteMappings);
    const loader = new ApplicationLoader(audioFilePlayer, badDataFileFetcher);

    // Wait for the loading to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // The WordLoader should fall back to sample graph, so app should still load
    expect(loader.appState).not.toBeNull();
    expect(loader.isLoading).toBe(false);
    expect(loader.hasError).toBe(false);

    // Should have created a sample word graph with words like 'cat', 'bat', etc.
    expect(loader.appState?.wordGraph.words.size).toBeGreaterThan(0);
    const catWord = loader.appState?.wordGraph.getNode('cat');
    expect(catWord).toBeDefined();
  });

  it('should handle malformed JSON data by falling back to sample graph', async () => {
    // Mock console.error since the grid finder may log errors with insufficient words
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Create a data fetcher that serves malformed data for both JSON and TXT files
    const badRouteMappings: [string, string][] = [
      ['/data/wordlists/default-words-graph.json', '/tests/data/test-files/test-content.txt'],
      ['/data/wordlists/default-words.txt', '/tests/data/test-files/test-content.txt'],
    ];

    const badDataFileFetcher = new DataFileFetcherTestDouble(badRouteMappings);
    const loader = new ApplicationLoader(audioFilePlayer, badDataFileFetcher);

    // Wait for the loading to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // The WordLoader should fall back to sample graph when JSON parsing fails
    expect(loader.appState).not.toBeNull();
    expect(loader.isLoading).toBe(false);
    expect(loader.hasError).toBe(false);

    // Should have created a sample word graph
    expect(loader.appState?.wordGraph.words.size).toBeGreaterThan(0);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should initialize with correct loading state', () => {
    const loader = new ApplicationLoader(audioFilePlayer, dataFileFetcher);

    // Initially should be loading
    expect(loader.isLoading).toBe(true);
    expect(loader.hasError).toBe(false);
    expect(loader.appState).toBeNull();
    expect(loader.errorMessage).toBe('');
  });
});
