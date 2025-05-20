import { DataFileFetcherTestDouble } from '../test_doubles/DataFileFetcherTestDouble';
import fs from 'fs/promises';
import path from 'path';

// Mock fs.readFile
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

describe('DataFileFetcherTestDouble', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should map URLs to local files based on route mappings', async () => {
    // Mock fs.readFile to return test content
    (fs.readFile as jest.Mock).mockResolvedValue('test file content');
    
    const routeMappings: [string, string][] = [
      ['/assets/', 'deploy/assets/'],
      ['/data/', 'tests/data/'],
    ];
    
    const fetcher = new DataFileFetcherTestDouble(routeMappings);
    
    // Test asset mapping
    const assetContent = await fetcher.fetch('/assets/image.png');
    expect(assetContent).toBe('test file content');
    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('deploy/assets/image.png')),
      'utf-8'
    );
    
    // Test data mapping
    const dataContent = await fetcher.fetch('/data/file.json');
    expect(dataContent).toBe('test file content');
    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('tests/data/file.json')),
      'utf-8'
    );
  });
  
  it('should support exact URL to file path mappings', async () => {
    // Mock fs.readFile to return test content
    (fs.readFile as jest.Mock).mockResolvedValue('specific test content');
    
    const specificMappings: [string, string][] = [
      ['/data/wordlists/default-words.txt', 'tests/data/wordlists/default-words-for-some-test.txt'],
    ];
    
    const fetcher = new DataFileFetcherTestDouble(specificMappings);
    
    const content = await fetcher.fetch('/data/wordlists/default-words.txt');
    expect(content).toBe('specific test content');
    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('tests/data/wordlists/default-words-for-some-test.txt')),
      'utf-8'
    );
  });
  
  it('should throw an error if no mapping is found', async () => {
    const routeMappings: [string, string][] = [
      ['/assets/', 'deploy/assets/'],
    ];
    
    const fetcher = new DataFileFetcherTestDouble(routeMappings);
    
    await expect(fetcher.fetch('/unknown/path.txt')).rejects.toThrow('No mapping found for URL: /unknown/path.txt');
  });
  
  it('should throw an error if file reading fails', async () => {
    // Mock fs.readFile to throw an error
    (fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));
    
    const routeMappings: [string, string][] = [
      ['/data/', 'tests/data/'],
    ];
    
    const fetcher = new DataFileFetcherTestDouble(routeMappings);
    
    await expect(fetcher.fetch('/data/missing.txt')).rejects.toThrow('Failed to read file');
  });
});