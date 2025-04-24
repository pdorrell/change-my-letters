import { makeAutoObservable } from 'mobx';
import { WordGraphNode } from './WordGraphNode';

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
