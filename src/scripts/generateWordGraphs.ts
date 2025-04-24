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

/**
 * Process a single word list file
 */
function processWordListFile(filePath: string): void {
  try {
    const pathDir = path.dirname(filePath);
    const fileName = path.basename(filePath, '.txt');
    const jsonOutputPath = path.join(pathDir, `${fileName}-graph.json`);

    console.log(`Processing ${filePath} ...`);

    // Read and parse the word list
    const wordList = fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .filter(word => word.trim().length > 0);

    console.log(`Loaded ${wordList.length} words.`);

    // Generate the word graph directly using the new builder pattern
    const wordGraph = new WordGraph();
    const jsonGraph = wordGraph.generateWordGraph(wordList);

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
