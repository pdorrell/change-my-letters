/**
 * Script to generate pre-computed word graph JSON files for all .txt files in the wordlists directory
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WordGraph } from './WordGraph';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data/wordlists');
const OUTPUT_DIR = path.resolve(__dirname, '../../test/output');

/**
 * Converts a word graph to a simplified JSON format for storage
 */
function convertWordGraphToJson(wordGraph: WordGraph): Record<string, any> {
  const jsonGraph: Record<string, any> = {};
  
  // Get all words in the graph
  const words = Array.from(wordGraph.words);
  
  for (const word of words) {
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
        lowerCaseString += '.';
      } else if (letter === letter.toUpperCase() && letter !== letter.toLowerCase()) {
        if (wordGraph.canChangeCaseAt(word, i)) {
          lowerCaseString += letter;
          hasLowerCase = true;
        } else {
          lowerCaseString += '.';
        }
        upperCaseString += '.';
      } else {
        upperCaseString += '.';
        lowerCaseString += '.';
      }
    }
    
    if (hasUpperCase) {
      wordData.uppercase = upperCaseString;
    }
    
    if (hasLowerCase) {
      wordData.lowercase = lowerCaseString;
    }
    
    // Only add words that have at least one operation
    if (Object.keys(wordData).length > 0) {
      jsonGraph[word] = wordData;
    }
  }
  
  return jsonGraph;
}

/**
 * Process a single word list file
 */
function processWordListFile(filePath: string): void {
  try {
    const fileName = path.basename(filePath, '.txt');
    const jsonOutputPath = path.join(OUTPUT_DIR, `${fileName}.json`);
    
    console.log(`Processing ${filePath}...`);
    
    // Read and parse the word list
    const wordList = fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .filter(word => word.trim().length > 0);
    
    console.log(`Loaded ${wordList.length} words.`);
    
    // Generate the word graph
    const wordGraph = new WordGraph();
    wordGraph.computeFromWordList(wordList);
    
    // Convert to JSON format and save
    const jsonGraph = convertWordGraphToJson(wordGraph);
    fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonGraph, null, 2), 'utf-8');
    
    console.log(`Generated graph saved to ${jsonOutputPath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Main function to process all word list files
 */
function main(): void {
  // Ensure the output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
  
  // Ensure the data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Wordlists directory not found: ${DATA_DIR}`);
    process.exit(1);
  }
  
  // Find all .txt files in the directory
  const files = fs.readdirSync(DATA_DIR)
    .filter(file => file.endsWith('.txt'))
    .map(file => path.join(DATA_DIR, file));
  
  if (files.length === 0) {
    console.log('No .txt word list files found.');
    process.exit(0);
  }
  
  console.log(`Found ${files.length} word list files.`);
  
  // Process each file
  for (const file of files) {
    processWordListFile(file);
  }
  
  console.log('All word lists processed successfully.');
}

// Run the script
main();