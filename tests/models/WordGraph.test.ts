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
 * Normalize the JSON format (e.g., sort arrays) to ensure consistent comparisons
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
        // For arrays (like replace, insert), keep the array ordering
        normalized[word][op] = [...value]; 
      } else {
        // For strings (like delete, uppercase, lowercase), keep as is
        normalized[word][op] = value;
      }
    }
  }
  
  return normalized;
}

describe('WordGraph', () => {
  it('should generate a graph that exactly matches the example JSON format', () => {
    // Load the word list
    const wordListPath = path.resolve(__dirname, '../../examples/example-words.txt');
    const wordList = fs.readFileSync(wordListPath, 'utf-8')
      .split('\n')
      .filter(word => word.trim().length > 0);
    
    // Generate a graph using the WordGraph class
    const wordGraph = new WordGraph();
    wordGraph.computeFromWordList(wordList);
    
    // Convert the graph to the JSON format
    const generatedJsonGraph = convertWordGraphToJsonFormat(wordGraph, wordList);
    
    // Load the expected JSON graph
    const expectedJsonPath = path.resolve(__dirname, '../../examples/example-words-graph.json');
    const expectedJsonGraph = JSON.parse(fs.readFileSync(expectedJsonPath, 'utf-8'));
    
    // Normalize both graphs for comparison
    const normalizedGenerated = normalizeJsonGraph(generatedJsonGraph);
    const normalizedExpected = normalizeJsonGraph(expectedJsonGraph);
    
    // Check if there are any differences
    let hasDifferences = false;
    const allWords = new Set([...Object.keys(normalizedGenerated), ...Object.keys(normalizedExpected)]);
    const differences: Record<string, any> = {};
    
    for (const word of allWords) {
      // Check if word exists in both graphs
      if (!normalizedGenerated[word]) {
        hasDifferences = true;
        differences[word] = { missing: 'in generated graph' };
        continue;
      }
      
      if (!normalizedExpected[word]) {
        hasDifferences = true;
        differences[word] = { missing: 'in expected graph' };
        continue;
      }
      
      // Check operation types
      const genOps = Object.keys(normalizedGenerated[word]);
      const expOps = Object.keys(normalizedExpected[word]);
      
      const allOps = new Set([...genOps, ...expOps]);
      const wordDiffs: Record<string, any> = {};
      
      for (const op of allOps) {
        if (!normalizedGenerated[word][op]) {
          hasDifferences = true;
          wordDiffs[op] = { missing: 'in generated graph' };
          continue;
        }
        
        if (!normalizedExpected[word][op]) {
          hasDifferences = true;
          wordDiffs[op] = { missing: 'in expected graph' };
          continue;
        }
        
        // For arrays, check each element
        if (Array.isArray(normalizedGenerated[word][op])) {
          if (JSON.stringify(normalizedGenerated[word][op]) !== JSON.stringify(normalizedExpected[word][op])) {
            hasDifferences = true;
            wordDiffs[op] = {
              expected: normalizedExpected[word][op],
              generated: normalizedGenerated[word][op]
            };
          }
        } else if (normalizedGenerated[word][op] !== normalizedExpected[word][op]) {
          // For strings, direct comparison
          hasDifferences = true;
          wordDiffs[op] = {
            expected: normalizedExpected[word][op],
            generated: normalizedGenerated[word][op]
          };
        }
      }
      
      if (Object.keys(wordDiffs).length > 0) {
        differences[word] = wordDiffs;
      }
    }
    
    // If there are differences, fail with detailed report
    if (hasDifferences) {
      // Write the generated graph to a file for easier comparison
      fs.writeFileSync(
        path.resolve(__dirname, '../../generated-graph.json'), 
        JSON.stringify(normalizedGenerated, null, 2)
      );
      
      // Fail with detailed differences
      console.error(`Generated graph does not match expected graph. Differences:`, JSON.stringify(differences, null, 2));
      expect(normalizedGenerated).toEqual(normalizedExpected); // This will fail with Jest's diff
    }
    
    // If no differences, the test passes
    expect(hasDifferences).toBe(false);
  });
});