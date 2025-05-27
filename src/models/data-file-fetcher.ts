import { DataFileFetcherInterface } from './data-file-fetcher-interface';

/**
 * Implementation of DataFileFetcherInterface that uses the global fetch API
 */
export class DataFileFetcher implements DataFileFetcherInterface {
  /**
   * Fetch data from a URL using the global fetch API
   * @param url The URL to fetch
   * @returns A promise that resolves to the text content of the file
   * @throws An error if the fetch fails or the response is not OK
   */
  async fetch(url: string): Promise<string> {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  }
}