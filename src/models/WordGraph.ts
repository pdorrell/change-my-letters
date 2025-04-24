import { makeAutoObservable } from 'mobx';
import { WordGraphNode } from './WordGraphNode';
import { WordGraphBuilder } from './WordGraphBuilder';

/**
 * Represents a graph of words where each word is mapped to a WordGraphNode
 * that contains all possible operations (delete, insert, replace, case change)
 */
export class WordGraph {
  // A map from words to WordGraphNode objects
  private wordNodes: Map<string, WordGraphNode> = new Map();

  // All words in the graph
  words: Set<string> = new Set();

  constructor() {
    makeAutoObservable(this);
  }
  
  /**
   * Identifies all connected subgraphs in the word graph
   * @returns An array of connected subgraphs, each containing a set of connected words
   */
  identifyConnectedSubgraphs(): Array<Set<string>> {
    const subgraphs: Array<Set<string>> = [];
    const visited = new Set<string>();
    
    // For each word not yet visited, find its connected component
    for (const word of this.words) {
      if (!visited.has(word)) {
        const subgraph = new Set<string>();
        this.depthFirstSearch(word, visited, subgraph);
        subgraphs.push(subgraph);
      }
    }
    
    // Sort subgraphs by size (largest first)
    return subgraphs.sort((a, b) => b.size - a.size);
  }
  
  /**
   * Generates a text report of the connected subgraphs in the word graph
   * Lists subgraphs in descending order of size, showing up to 10 sample words for each
   * @returns String containing the report
   */
  generateSubgraphReport(): string {
    const subgraphs = this.identifyConnectedSubgraphs();
    let report = `Word Graph Connectivity Report\n`;
    report += `===========================\n\n`;
    report += `Total words: ${this.words.size}\n`;
    report += `Connected subgraphs: ${subgraphs.length}\n\n`;
    
    for (let i = 0; i < subgraphs.length; i++) {
      const subgraph = subgraphs[i];
      const subgraphWords = Array.from(subgraph);
      
      report += `Subgraph ${i + 1}: ${subgraph.size} words\n`;
      
      // Show up to 10 sample words from this subgraph
      const samplesToShow = Math.min(10, subgraph.size);
      const samples = subgraphWords.slice(0, samplesToShow);
      
      report += `Sample words: ${samples.join(', ')}`;
      
      if (samplesToShow < subgraph.size) {
        report += ` (and ${subgraph.size - samplesToShow} more)`;
      }
      
      report += `\n\n`;
    }
    
    // Add statistics about isolated words if there are many small subgraphs
    const isolatedWords = subgraphs.filter(g => g.size === 1);
    if (isolatedWords.length > 0) {
      report += `Isolated words: ${isolatedWords.length}\n`;
      
      if (isolatedWords.length <= 20) {
        report += `Words: ${isolatedWords.map(g => Array.from(g)[0]).join(', ')}\n`;
      } else {
        report += `First 20: ${isolatedWords.slice(0, 20).map(g => Array.from(g)[0]).join(', ')}, ...\n`;
      }
    }
    
    return report;
  }
  
  /**
   * Performs a depth-first search from a starting word to find all connected words
   * @param word The starting word
   * @param visited Set of already visited words
   * @param component Set to collect words in this connected component
   */
  private depthFirstSearch(word: string, visited: Set<string>, component: Set<string>): void {
    visited.add(word);
    component.add(word);
    
    // Find all words that can be reached from this word
    const neighbors = this.getConnectedWords(word);
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.depthFirstSearch(neighbor, visited, component);
      }
    }
  }
  
  /**
   * Get all words connected to the given word (by any single-letter operation)
   */
  getConnectedWords(word: string): string[] {
    const connected: Set<string> = new Set();
    const node = this.getWordNode(word);
    
    if (!node) {
      return [];
    }
    
    // Check for deletions
    for (let i = 0; i < word.length; i++) {
      if (node.canDelete(i)) {
        const newWord = word.substring(0, i) + word.substring(i + 1);
        if (this.hasWord(newWord)) {
          connected.add(newWord);
        }
      }
    }
    
    // Check for insertions
    for (let i = 0; i <= word.length; i++) {
      const insertions = node.getInsertions(i);
      if (insertions) {
        for (const letter of insertions) {
          const newWord = word.substring(0, i) + letter + word.substring(i);
          if (this.hasWord(newWord)) {
            connected.add(newWord);
          }
        }
      }
    }
    
    // Check for replacements
    for (let i = 0; i < word.length; i++) {
      const replacements = node.getReplacements(i);
      if (replacements) {
        for (const letter of replacements) {
          const newWord = word.substring(0, i) + letter + word.substring(i + 1);
          if (this.hasWord(newWord)) {
            connected.add(newWord);
          }
        }
      }
    }
    
    // Check for case changes
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      
      // Check uppercase
      if (node.canUppercase(i) && letter === letter.toLowerCase()) {
        const newWord = word.substring(0, i) + letter.toUpperCase() + word.substring(i + 1);
        if (this.hasWord(newWord)) {
          connected.add(newWord);
        }
      }
      
      // Check lowercase
      if (node.canLowercase(i) && letter === letter.toUpperCase()) {
        const newWord = word.substring(0, i) + letter.toLowerCase() + word.substring(i + 1);
        if (this.hasWord(newWord)) {
          connected.add(newWord);
        }
      }
    }
    
    return Array.from(connected);
  }
  
  /**
   * Compute the word graph from a list of words
   */
  computeFromWordList(wordList: string[]): void {
    this.wordNodes.clear();
    this.words.clear();
    
    // Add all words to the set
    for (const word of wordList) {
      this.words.add(word);
    }
    
    // Generate the graph using the builder
    const builder = new WordGraphBuilder(wordList);
    const jsonGraph = builder.build();
    
    // Load the generated graph
    this.loadFromJson(jsonGraph);
  }
  
  /**
   * Convert the graph to its JSON representation
   */
  toJson(): Record<string, any> {
    const jsonGraph: Record<string, any> = {};
    
    // Convert each WordGraphNode to its JSON representation
    for (const [word, node] of this.wordNodes.entries()) {
      jsonGraph[word] = node.toJson();
    }
    
    // Ensure all words are included in the graph, even if they have no connections
    for (const word of this.words) {
      if (!jsonGraph[word]) {
        jsonGraph[word] = {};
      }
    }
    
    return jsonGraph;
  }

  /**
   * Load a pre-computed word graph from JSON
   */
  loadFromJson(jsonData: Record<string, any>): void {
    this.wordNodes.clear();
    this.words.clear();

    for (const [word, nodeData] of Object.entries(jsonData)) {
      this.words.add(word);
      const node = WordGraphNode.fromJson(word, nodeData);
      this.wordNodes.set(word, node);
    }
  }

  /**
   * Get the word graph node for a specific word
   */
  getWordNode(word: string): WordGraphNode | undefined {
    return this.wordNodes.get(word);
  }

  /**
   * Check if the graph contains a specific word
   */
  hasWord(word: string): boolean {
    return this.words.has(word);
  }

  /**
   * Get possible letter replacements for a position in a word
   */
  getPossibleReplacements(word: string, position: number): string[] {
    const node = this.getWordNode(word);
    if (!node) return [];

    const replacements = node.getReplacements(position);
    return replacements ? replacements.split('') : [];
  }

  /**
   * Get possible letters that can be inserted at a position in a word
   */
  getPossibleInsertions(word: string, position: number): string[] {
    const node = this.getWordNode(word);
    if (!node) return [];

    const insertions = node.getInsertions(position);
    return insertions ? insertions.split('') : [];
  }

  /**
   * Check if deleting a letter at the specified position results in a valid word
   */
  canDeleteLetterAt(word: string, position: number): boolean {
    const node = this.getWordNode(word);
    if (!node) return false;

    return node.canDelete(position);
  }

  /**
   * Check if changing case of a letter results in a valid word
   */
  canChangeCaseAt(word: string, position: number): boolean {
    const node = this.getWordNode(word);
    if (!node) return false;

    const letter = word[position];
    return letter === letter.toLowerCase()
      ? node.canUppercase(position)
      : node.canLowercase(position);
  }
}
