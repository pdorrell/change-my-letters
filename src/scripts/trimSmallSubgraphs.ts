/**
 * Script to trim small subgraphs from a word list file
 * 
 * Usage: 
 *   npm run trim-small-subgraphs -- <file_path> <max_size>
 * 
 * Example:
 *   npm run trim-small-subgraphs -- ./data/wordlists/my-words.txt 3
 * 
 * This will remove all subgraphs with 3 or fewer words from the word list.
 */
import fs from 'fs';
import path from 'path';
import { WordGraph } from '../models/WordGraph';

function trimSmallSubgraphs(filePath: string, maxSize: number): void {
  console.log(`Processing ${filePath}...`);
  
  // Validate arguments
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File ${filePath} does not exist`);
    process.exit(1);
  }
  
  if (!filePath.endsWith('.txt')) {
    console.error('Error: This script only works with .txt word list files, not graph files');
    process.exit(1);
  }
  
  if (isNaN(maxSize) || maxSize < 1) {
    console.error('Error: Maximum size must be a positive number');
    process.exit(1);
  }
  
  try {
    // Read and parse the word list
    let wordList = fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .filter(word => word.trim().length > 0);
    
    console.log(`Loaded ${wordList.length} words from ${filePath}`);
    
    // Create and compute the word graph
    const wordGraph = new WordGraph();
    wordGraph.computeFromWordList(wordList);
    
    // Identify connected subgraphs
    const subgraphs = wordGraph.identifyConnectedSubgraphs();
    
    console.log(`Found ${subgraphs.length} connected subgraphs`);
    
    // Identify small subgraphs that should be removed
    const smallSubgraphs = subgraphs.filter(subgraph => subgraph.size <= maxSize);
    const wordsToRemove = new Set<string>();
    
    for (const subgraph of smallSubgraphs) {
      for (const word of subgraph) {
        wordsToRemove.add(word);
      }
    }
    
    console.log(`Identified ${smallSubgraphs.length} subgraphs with size <= ${maxSize}`);
    console.log(`Words to remove: ${wordsToRemove.size}`);
    
    if (wordsToRemove.size === 0) {
      console.log('No words to remove. Word list unchanged.');
      return;
    }
    
    // Filter out the words that should be removed
    const filteredWordList = wordList.filter(word => !wordsToRemove.has(word));
    
    // Create a backup of the original file
    const backupPath = `${filePath}.bak`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`Backup created at ${backupPath}`);
    
    // Write the filtered word list back to the original file
    fs.writeFileSync(filePath, filteredWordList.join('\n') + '\n', 'utf-8');
    
    console.log(`Removed ${wordsToRemove.size} words from ${filePath}`);
    console.log(`New word list has ${filteredWordList.length} words`);
    
    // Print the words that were removed for reference
    console.log('\nRemoved words:');
    const removedWordsBySubgraph = smallSubgraphs.map((subgraph, index) => {
      return `Subgraph ${index + 1} (${subgraph.size} words): ${Array.from(subgraph).join(', ')}`;
    });
    console.log(removedWordsBySubgraph.join('\n'));
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

function main(): void {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('Usage: npm run trim-small-subgraphs -- <file_path> <max_size>');
    process.exit(1);
  }
  
  const filePath = path.resolve(args[0]);
  const maxSize = parseInt(args[1], 10);
  
  trimSmallSubgraphs(filePath, maxSize);
}

// Run the script
main();