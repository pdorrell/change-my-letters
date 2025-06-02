import { DataFileFetcherInterface } from '../../src/models/data-file-fetcher-interface';
import path from 'path';
import fs from 'fs/promises';

/**
 * Type for URL route mapping: [urlPattern, filePathPattern]
 */
type RouteMapping = [string, string];

/**
 * Test double for DataFileFetcher that maps URLs to local file paths
 */
export class DataFileFetcherTestDouble implements DataFileFetcherInterface {
  private readonly rootPath: string;
  private readonly routeMappings: RouteMapping[];

  /**
   * Create a new DataFileFetcherTestDouble
   * @param routeMappings Array of URL to file path mappings
   * @param rootPath The root path to resolve files from (default: project root)
   */
  constructor(
    routeMappings: RouteMapping[],
    rootPath: string = 'PROJECT_ROOT_DIR'
  ) {
    this.routeMappings = routeMappings;
    this.rootPath = rootPath;
  }

  /**
   * Maps a URL to a file path relative to the project root
   * @param url The URL to route
   * @returns The file path relative to the project root
   * @throws Error if no mapping is found for the URL
   */
  route(url: string): string {
    // Find a matching route
    const matchedRoute = this.routeMappings.find(([urlPattern]) =>
      url.startsWith(urlPattern) || url === urlPattern
    );

    if (!matchedRoute) {
      throw new Error(`No mapping found for URL: ${url}`);
    }

    const [urlPattern, filePathPattern] = matchedRoute;

    // Replace the URL pattern with the file path pattern
    return url.replace(urlPattern, filePathPattern);
  }

  /**
   * Gets the absolute file path for a given URL
   * @param url The URL to get the absolute path for
   * @returns The absolute file path
   * @throws Error if no mapping is found for the URL
   */
  getAbsolutePath(url: string): string {
    const localPath = this.route(url);
    return path.join(this.rootPath, localPath);
  }

  /**
   * Fetch data by mapping the URL to a local file
   * @param url The URL to map and fetch
   * @returns The content of the mapped file
   * @throws Error if no mapping matches or file cannot be read
   */
  async fetch(url: string): Promise<string> {
    const fullPath = this.getAbsolutePath(url);

    try {
      // Read the file
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file at ${fullPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
