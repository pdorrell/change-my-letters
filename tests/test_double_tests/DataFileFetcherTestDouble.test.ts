import { DataFileFetcherTestDouble } from '../test_doubles/DataFileFetcherTestDouble';
import path from 'path';

describe('DataFileFetcherTestDouble', () => {
  // Define test route mappings
  const routeMappings: [string, string][] = [
    ['/assets/', 'deploy/assets/'],
    ['/data/', 'tests/data/'],
    ['/api/test', 'tests/data/test-files/'],
    ['/exact-test-file.txt', 'tests/data/test-files/test-content.txt']
  ];
  
  // Create fetcher instance for tests
  const fetcher = new DataFileFetcherTestDouble(routeMappings);
  
  describe('route method', () => {
    it('should correctly map URLs to relative file paths', () => {
      // Test prefix mapping
      expect(fetcher.route('/assets/images/logo.png')).toBe('deploy/assets/images/logo.png');
      expect(fetcher.route('/data/config.json')).toBe('tests/data/config.json');
      
      // Test exact file mapping
      expect(fetcher.route('/exact-test-file.txt')).toBe('tests/data/test-files/test-content.txt');
    });
    
    it('should throw an error if no mapping is found', () => {
      expect(() => fetcher.route('/unknown/path.txt')).toThrow('No mapping found for URL: /unknown/path.txt');
    });
  });
  
  describe('getAbsolutePath method', () => {
    it('should return full absolute paths', () => {
      const rootPath = 'PROJECT_ROOT_DIR';
      
      // Test asset path
      const assetPath = fetcher.getAbsolutePath('/assets/images/logo.png');
      expect(assetPath).toBe(path.join(rootPath, 'deploy/assets/images/logo.png'));
      
      // Test data path
      const dataPath = fetcher.getAbsolutePath('/data/config.json');
      expect(dataPath).toBe(path.join(rootPath, 'tests/data/config.json'));
    });
  });
  
  describe('fetch method', () => {
    it('should read and return the content of an actual file', async () => {
      // Test reading the test content file we created
      const content = await fetcher.fetch('/api/test/test-content.txt');
      
      // Verify the content matches what we wrote to the file
      expect(content).toContain('This is a test file for DataFileFetcherTestDouble');
      expect(content).toContain('It contains some text content that can be verified in tests');
    });
    
    it('should also work with exact file mappings', async () => {
      // Test reading via the exact file mapping
      const content = await fetcher.fetch('/exact-test-file.txt');
      
      // Verify it's the same content
      expect(content).toContain('This is a test file for DataFileFetcherTestDouble');
    });
    
    it('should throw an error if no mapping is found', async () => {
      await expect(fetcher.fetch('/unknown/path.txt'))
        .rejects
        .toThrow('No mapping found for URL: /unknown/path.txt');
    });
    
    it('should throw an error if file does not exist', async () => {
      await expect(fetcher.fetch('/api/test/non-existent-file.txt'))
        .rejects
        .toThrow('Failed to read file at');
    });
  });
});