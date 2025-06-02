/**
 * Script to analyze word graph connectivity and generate a report
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WordGraph } from '../models/word-graph';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data/wordlists');

/**
 * Analyze a specific word graph file or word list file
 */
function analyzeWordGraph(filePath: string): void {
  try {
    console.log(`Analyzing ${filePath} ...`);

    // Create a new WordGraph instance
    const wordGraph = new WordGraph();

    // Check if this is a JSON file or a text file
    if (filePath.endsWith('.json')) {
      // Load pre-generated graph from JSON
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      wordGraph.loadFromJson(jsonData);
      console.log(`Loaded pre-computed graph with ${wordGraph.words.size} words.`);
    } else if (filePath.endsWith('.txt')) {
      // Load and compute from word list
      const wordList = fs.readFileSync(filePath, 'utf-8')
        .split('\n')
        .filter(word => word.trim().length > 0);

      console.log(`Loaded ${wordList.length} words, computing graph...`);
      wordGraph.computeFromWordList(wordList);
    } else {
      console.error(`Unsupported file type: ${filePath}`);
      return;
    }

    // Generate and print the report
    const report = wordGraph.generateSubgraphReport();
    console.log(report);

    // Create a 'reports' subdirectory in the same directory as the input file
    const inputDir = path.dirname(filePath);
    const reportsDir = path.join(inputDir, 'reports');

    // Create the reports directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Get just the filename without extension
    const fileBaseName = path.basename(filePath, path.extname(filePath));

    // Write report to file in the reports subdirectory
    const outputPath = path.join(reportsDir, `${fileBaseName}-report.txt`);
    fs.writeFileSync(outputPath, report, 'utf-8');
    console.log(`Report saved to ${outputPath}`);
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
  }
}

/**
 * Main function
 */
function main(): void {
  // Check if a specific file was provided as argument
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const filePath = path.resolve(args[0]);
    analyzeWordGraph(filePath);
    return;
  }

  // If no specific file, analyze all files in the data directory
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Wordlists directory not found: ${DATA_DIR}`);
    process.exit(1);
  }

  // Find all JSON and TXT files in the directory
  const files = fs.readdirSync(DATA_DIR)
    .filter(file => file.endsWith('.json') || file.endsWith('.txt'))
    .map(file => path.join(DATA_DIR, file));

  if (files.length === 0) {
    console.log('No word list or graph files found.');
    process.exit(0);
  }

  console.log(`Found ${files.length} files to analyze.`);

  // Process each file
  for (const file of files) {
    analyzeWordGraph(file);
  }

  console.log('Analysis complete.');
}

// Run the script
main();
