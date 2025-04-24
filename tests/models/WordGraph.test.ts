import { WordGraph } from '../../src/models/WordGraph';
import fs from 'fs';
import path from 'path';

/**
 * Convert a word graph to the standard JSON format used in example files
 */
function convertWordGraphToJsonFormat(wordGraph: WordGraph, wordList: string[]): Record<string, any> {
  const jsonGraph: Record<string, any> = {};
  
  for (const word of wordList) {
    const wordData: Record<string, any> = {};
    
    // Check for possible replacements
    const replacements: string[] = [];
    let hasReplacement = false;
    
    for (let i = 0; i < word.length; i++) {
      const possibleReplacements = wordGraph.getPossibleReplacements(word, i);
      
      if (possibleReplacements.length > 0) {
        hasReplacement = true;
        replacements[i] = possibleReplacements.join('');
      } else {
        replacements[i] = '';
      }
    }
    
    if (hasReplacement) {
      wordData.replace = replacements;
    }
    
    // Check for possible insertions
    const insertions: string[] = [];
    let hasInsertion = false;
    
    for (let i = 0; i <= word.length; i++) {
      const possibleInsertions = wordGraph.getPossibleInsertions(word, i);
      
      if (possibleInsertions.length > 0) {
        hasInsertion = true;
        insertions[i] = possibleInsertions.join('');
      } else {
        insertions[i] = '';
      }
    }
    
    if (hasInsertion) {
      wordData.insert = insertions;
    }
    
    // Check for possible deletions
    let deletionString = '';
    let hasDeletion = false;
    
    for (let i = 0; i < word.length; i++) {
      if (wordGraph.canDeleteLetterAt(word, i)) {
        deletionString += word[i];
        hasDeletion = true;
      } else {
        deletionString += '.';
      }
    }
    
    if (hasDeletion) {
      wordData.delete = deletionString;
    }
    
    // Check for possible case changes
    let upperCaseString = '';
    let lowerCaseString = '';
    let hasUpperCase = false;
    let hasLowerCase = false;
    
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      
      if (letter === letter.toLowerCase() && letter !== letter.toUpperCase()) {
        if (wordGraph.canChangeCaseAt(word, i)) {
          upperCaseString += letter;
          hasUpperCase = true;
        } else {
          upperCaseString += '.';
        }
      } else if (letter === letter.toUpperCase() && letter !== letter.toLowerCase()) {
        if (wordGraph.canChangeCaseAt(word, i)) {
          lowerCaseString += letter;
          hasLowerCase = true;
        } else {
          lowerCaseString += '.';
        }
      } else {
        // For non-case-changeable characters (e.g., numbers)
        if (upperCaseString.length < word.length) upperCaseString += '.';
        if (lowerCaseString.length < word.length) lowerCaseString += '.';
      }
    }
    
    // Only add case changes if they exist
    if (hasUpperCase) {
      wordData.uppercase = upperCaseString;
    }
    
    if (hasLowerCase) {
      wordData.lowercase = lowerCaseString;
    }
    
    // Only add words with at least one operation
    if (Object.keys(wordData).length > 0) {
      jsonGraph[word] = wordData;
    }
  }
  
  return jsonGraph;
}

/**
 * Normalize the JSON format to ensure consistent comparisons
 * Converts all array representations to slash-separated strings
 */
function normalizeJsonGraph(graph: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  
  // Sort the words alphabetically
  const sortedWords = Object.keys(graph).sort();
  
  for (const word of sortedWords) {
    normalized[word] = {};
    
    // Copy and sort each operation type
    const operations = Object.keys(graph[word]).sort();
    
    for (const op of operations) {
      const value = graph[word][op];
      
      if (Array.isArray(value)) {
        // For arrays (like replace, insert), convert to slash-separated string
        normalized[word][op] = value.join('/'); 
      } else {
        // For strings (like delete, uppercase, lowercase), keep as is
        normalized[word][op] = value;
      }
    }
  }
  
  return normalized;
}

describe('WordGraph', () => {
  it('generates a valid word graph', () => {
    // Load the word list
    const wordListPath = path.resolve(__dirname, '../../examples/example-words.txt');
    const wordList = fs.readFileSync(wordListPath, 'utf-8')
      .split('\n')
      .filter(word => word.trim().length > 0);
    
    // Generate a graph using the WordGraph class
    const wordGraph = new WordGraph();
    wordGraph.computeFromWordList(wordList);
    
    // Check that the graph contains words
    expect(wordGraph.words.size).toBeGreaterThan(0);
    
    // Test a few expected words from the example
    expect(wordGraph.hasWord('bet')).toBe(true);
    expect(wordGraph.hasWord('back')).toBe(true);
    
    // Validate that we can get nodes for the words
    const betNode = wordGraph.getWordNode('bet');
    expect(betNode).toBeDefined();
    
    // Minimal validation of node operations
    if (betNode) {
      // We should be able to replace 't' in 'bet' with 'g' to get 'beg'
      const replacements = betNode.getReplacements(2);
      expect(replacements).toContain('g');
    }
  });
});