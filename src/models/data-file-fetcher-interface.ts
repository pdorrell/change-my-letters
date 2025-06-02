/**
 * Interface for fetching data files from URLs
 */
export interface DataFileFetcherInterface {
  /**
   * Fetch data from a URL
   * @param url The URL to fetch
   * @returns A promise that resolves to the text content of the file
   */
  fetch(url: string): Promise<string>;
}
