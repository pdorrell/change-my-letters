import { WordLoader } from '../../src/models/WordLoader';
import { DataFileFetcherTestDouble } from '../test_doubles/DataFileFetcherTestDouble';
import { WordGraph } from '../../src/models/WordGraph';

describe('WordLoader', () => {
  const expectedWordListText = 'cat\nhat\nrat\nbat';
  const expectedJsonGraph = {
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

  // Set up a test double for the data file fetcher using real test files
  const routeMappings: [string, string][] = [
    ['/data/wordlists/default-words-graph.json', '/tests/data/word_loader_test/wordlists/default-words-graph.json'],
    ['/data/wordlists/default-words.txt', '/tests/data/word_loader_test/wordlists/default-words.txt'],
  ];

  let dataFileFetcher: DataFileFetcherTestDouble;
  let wordLoader: WordLoader;

  beforeEach(() => {
    dataFileFetcher = new DataFileFetcherTestDouble(routeMappings);
    wordLoader = new WordLoader(dataFileFetcher);
  });

  it('should load a word list from text', () => {
    const wordList = wordLoader.loadWordListFromText(expectedWordListText);

    expect(wordList).toEqual(['cat', 'hat', 'rat', 'bat']);
  });

  it('should load a word graph from JSON', () => {
    const graph = new WordGraph();
    wordLoader.loadWordGraphFromJson(JSON.stringify(expectedJsonGraph), graph);

    // We can verify that the graph has the words we expect
    expect(graph.hasWord('cat')).toBe(true);
    expect(graph.hasWord('hat')).toBe(true);
  });

  it('should load a data file', async () => {
    const text = await wordLoader.loadDataFile('default-words.txt');

    expect(text).toBe(expectedWordListText);
  });

  it('should create a sample word graph', () => {
    const graph = wordLoader.createSampleWordGraph();

    // Verify that we get a non-empty graph
    expect(graph).toBeInstanceOf(WordGraph);
    expect(graph.words.size).toBeGreaterThan(0);
  });

  it('should throw Error when loading data file fails', async () => {
    await expect(wordLoader.loadDataFile('nonexistent-file.txt')).rejects.toThrow(Error);
    await expect(wordLoader.loadDataFile('nonexistent-file.txt')).rejects.toThrow('Error loading data file nonexistent-file.txt');
  });

  it('should load default word graph', async () => {
    const graph = await wordLoader.loadDefaultWordGraph();

    expect(graph).toBeInstanceOf(WordGraph);
    expect(graph.hasWord('cat')).toBe(true);
    expect(graph.hasWord('hat')).toBe(true);
    expect(graph.hasWord('rat')).toBe(true);
    expect(graph.hasWord('bat')).toBe(true);
    expect(graph.words.size).toBe(4);
  });
});
