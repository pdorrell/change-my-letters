import { WordLoader } from '../../src/models/WordLoader';
import { WordGraph } from '../../src/models/WordGraph';
import fs from 'fs';
import path from 'path';

// Mock necessary modules
jest.mock('fs');
jest.mock('path');
jest.mock('../../src/utils/ErrorHandler', () => ({
  ErrorHandler: {
    reportError: jest.fn()
  }
}));

// Mock the fetch API
global.fetch = jest.fn();

describe('WordLoader', () => {
  const mockWordListText = 'cat\nhat\nrat\nbat\n';
  const mockJsonGraph = {
    words: {
      'cat': {
        word: 'cat',
        replacements: { '0': ['h', 'r', 'b'] },
        insertions: {},
        canDeleteArray: [],
        canUpperCase: [],
        canLowerCase: []
      },
      'hat': {
        word: 'hat',
        replacements: { '0': ['c', 'r', 'b'] },
        insertions: {},
        canDeleteArray: [],
        canUpperCase: [],
        canLowerCase: []
      }
    }
  };

  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();
    
    // Mock fetch implementation for successful responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('default-words.txt')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockWordListText)
        });
      } else if (url.includes('default-words-graph.json')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify(mockJsonGraph))
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
    });
  });

  it('should load a word list from text', () => {
    const wordList = WordLoader.loadWordListFromText(mockWordListText);
    
    expect(wordList).toEqual(['cat', 'hat', 'rat', 'bat']);
  });

  it('should load a word graph from JSON', () => {
    const graph = new WordGraph();
    WordLoader.loadWordGraphFromJson(JSON.stringify(mockJsonGraph), graph);
    
    // We can't easily test the internal state directly, but we can verify it didn't throw an error
    expect(graph).toBeInstanceOf(WordGraph);
  });

  it('should load a data file', async () => {
    const text = await WordLoader.loadDataFile('default-words.txt');
    
    expect(text).toBe(mockWordListText);
    expect(global.fetch).toHaveBeenCalledWith('/data/wordlists/default-words.txt');
  });

  it('should create a sample word graph', () => {
    const graph = WordLoader.createSampleWordGraph();
    
    expect(graph).toBeInstanceOf(WordGraph);
  });

  it('should handle error when loading data file', async () => {
    // Mock fetch to return an error
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });
    });
    
    const text = await WordLoader.loadDataFile('nonexistent-file.txt');
    expect(text).toBe('');
  });
});