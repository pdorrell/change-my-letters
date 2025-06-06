/**
 * Script to generate pre-computed word graph JSON files for .txt files
 * Can be run with:
 * - No args: processes all .txt files in the default wordlists directory
 * - A directory path: processes all .txt files in that directory
 * - A file path: processes just that file
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WordGraph } from '@/models/word-graph';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DATA_DIR = path.resolve(__dirname, '../data/wordlists');

/**
 * Process a single word list file
 */
function processWordListFile(filePath: string): void {
  try {
    if (!filePath.endsWith('.txt')) {
      console.log(`Skipping ${filePath} (not a .txt file)`);
      return;
    }

    const pathDir = path.dirname(filePath);
    const fileName = path.basename(filePath, '.txt');
    const jsonOutputPath = path.join(pathDir, `${fileName}-graph.json`);

    console.log(`Processing ${filePath} ...`);

    // Read and parse the word list
    const wordList = fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .filter(word => word.trim().length > 0);

    console.log(`Loaded ${wordList.length} words.`);

    // Generate the word graph using the model's computeFromWordList method
    const wordGraph = new WordGraph();
    wordGraph.computeFromWordList(wordList);
    const jsonGraph = wordGraph.toJson();

    fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonGraph, null, 2), 'utf-8');

    console.log(`Generated graph saved to ${jsonOutputPath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Process all word list files in a directory
 */
function processDirectory(directoryPath: string): void {
  // Ensure the directory exists
  if (!fs.existsSync(directoryPath)) {
    console.error(`Directory not found: ${directoryPath}`);
    process.exit(1);
  }

  // Check if it's actually a directory
  const stats = fs.statSync(directoryPath);
  if (!stats.isDirectory()) {
    console.error(`Path is not a directory: ${directoryPath}`);
    process.exit(1);
  }

  // Find all .txt files in the directory
  const files = fs.readdirSync(directoryPath)
    .filter(file => file.endsWith('.txt'))
    .map(file => path.join(directoryPath, file));

  if (files.length === 0) {
    console.log(`No .txt word list files found in ${directoryPath}.`);
    return;
  }

  console.log(`Found ${files.length} word list file(s) in ${directoryPath}.`);

  // Process each file
  for (const file of files) {
    processWordListFile(file);
  }

  console.log('All word lists processed successfully.');
}

/**
 * Main function to process files based on command-line argument
 */
function main(): void {
  // Get command-line argument if provided
  const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_DATA_DIR;

  // Check if the path exists
  if (!fs.existsSync(inputPath)) {
    console.error(`Path not found: ${inputPath}`);
    process.exit(1);
  }

  // Check if it's a directory or a file
  const stats = fs.statSync(inputPath);

  if (stats.isDirectory()) {
    console.log(`Processing directory: ${inputPath}`);
    processDirectory(inputPath);
  } else if (stats.isFile()) {
    console.log(`Processing single file: ${inputPath}`);
    processWordListFile(inputPath);
  } else {
    console.error(`Path is neither a file nor a directory: ${inputPath}`);
    process.exit(1);
  }
}

// Run the script
main();
