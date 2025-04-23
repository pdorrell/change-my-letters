/**
 * Script to generate pre-computed word graph JSON files for all .txt files in the wordlists directory
 */
const fs = require('fs');
const path = require('path');

const WORDLISTS_DIR = path.resolve(__dirname, 'src/data/wordlists');

/**
 * Check if two words differ by exactly one letter
 */
function isOneLetterDifference(word1, word2) {
  // If lengths differ by more than 1, words can't be one letter different
  if (Math.abs(word1.length - word2.length) > 1) {
    return false;
  }
  
  // Handle insertion/deletion case
  if (word1.length !== word2.length) {
    const [shorter, longer] = word1.length < word2.length 
      ? [word1, word2] 
      : [word2, word1];
    
    // Check if longer has one extra letter compared to shorter
    for (let i = 0; i <= shorter.length; i++) {
      const candidate = longer.substring(0, i) + longer.substring(i + 1);
      if (candidate === shorter) {
        return true;
      }
    }
    return false;
  }
  
  // Handle replacement case (same length)
  let differences = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) {
      // Check for case difference (which is considered a one-letter difference)
      if (word1[i].toLowerCase() === word2[i].toLowerCase()) {
        return true; // Case difference counts as one letter difference
      }
      differences++;
    }
    if (differences > 1) {
      return false;
    }
  }
  
  return differences === 1;
}

/**
 * Check if two words differ only at the specified position
 */
function differAtPosition(word1, word2, position) {
  if (word1.length !== word2.length || position >= word1.length) {
    return false;
  }
  
  for (let i = 0; i < word1.length; i++) {
    if (i === position) {
      // Must differ at the specified position
      if (word1[i] === word2[i]) {
        return false;
      }
    } else {
      // Must be the same at all other positions
      if (word1[i] !== word2[i]) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Generate a word graph from a list of words using efficient algorithm
 */
function generateWordGraph(wordList) {
  // Create adjacency list
  const adjacencyList = new Map();
  const words = new Set(wordList);
  
  // Maps for storing intermediate results
  const connections = new Map();
  const dottedWordsMap = new Map();
  const lowerCaseMap = new Map();
  
  // Initialize adjacency list
  for (const word of wordList) {
    adjacencyList.set(word, []);
    
    // Initialize connections for this word
    if (!connections.has(word)) {
      connections.set(word, []);
    }
    
    // Process deletions and insertions
    processDeleteInsertOperations(word, words, connections);
    
    // Process replacements
    processReplaceOperations(word, dottedWordsMap);
    
    // Process case changes
    processCaseOperations(word, lowerCaseMap);
  }
  
  // Connect words based on replacements
  connectWordsByReplacements(dottedWordsMap, connections);
  
  // Connect words based on case changes
  connectWordsByCaseChanges(lowerCaseMap, words, connections);
  
  // Set the final adjacency list
  for (const [word, wordConnections] of connections.entries()) {
    // Filter to ensure only words in our word list are included
    const validConnections = wordConnections.filter(connection => words.has(connection));
    adjacencyList.set(word, validConnections);
  }
  
  return { adjacencyList, words };
}

/**
 * Process delete and insert operations for a word
 */
function processDeleteInsertOperations(word, words, connections) {
  // Check all possible deletions
  for (let i = 0; i < word.length; i++) {
    const deletion = word.substring(0, i) + word.substring(i + 1);
    
    // If the deletion is a valid word, add connections
    if (words.has(deletion)) {
      // Add deletion connection
      addConnection(connections, word, deletion);
      
      // Add insert connection (reverse of deletion)
      addConnection(connections, deletion, word);
    }
  }
}

/**
 * Process replacement operations for a word
 */
function processReplaceOperations(word, dottedWordsMap) {
  // Check all possible replacements
  for (let i = 0; i < word.length; i++) {
    // Create a "dotted word" with a dot at position i
    const dottedWord = word.substring(0, i) + '.' + word.substring(i + 1);
    
    // Add this word to the dotted word map
    if (!dottedWordsMap.has(dottedWord)) {
      dottedWordsMap.set(dottedWord, []);
    }
    dottedWordsMap.get(dottedWord).push(word);
  }
}

/**
 * Process case change operations for a word
 */
function processCaseOperations(word, lowerCaseMap) {
  // Check if this word has any uppercase or lowercase letters
  const lowerCased = word.toLowerCase();
  
  // Skip if the word is already all lowercase
  if (lowerCased === word) {
    return;
  }
  
  // Add this word to the lowercase map
  if (!lowerCaseMap.has(lowerCased)) {
    lowerCaseMap.set(lowerCased, []);
  }
  lowerCaseMap.get(lowerCased).push(word);
}

/**
 * Connect words by replacements based on dotted words map
 */
function connectWordsByReplacements(dottedWordsMap, connections) {
  // For each dotted word pattern
  for (const [, words] of dottedWordsMap.entries()) {
    // If there are multiple words with this pattern, they are connected
    if (words.length > 1) {
      // Connect all pairs of words with this pattern
      for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
          // Add bidirectional connections
          addConnection(connections, words[i], words[j]);
          addConnection(connections, words[j], words[i]);
        }
      }
    }
  }
}

/**
 * Connect words by case changes based on lowercase map
 */
function connectWordsByCaseChanges(lowerCaseMap, words, connections) {
  // For each lowercase word
  for (const [lowerCased, upperCaseVariants] of lowerCaseMap.entries()) {
    // If the lowercase version is also in our word list
    if (words.has(lowerCased)) {
      // Connect the lowercase word to all its uppercase variants
      for (const upperVariant of upperCaseVariants) {
        addConnection(connections, lowerCased, upperVariant);
        addConnection(connections, upperVariant, lowerCased);
      }
    }
    
    // Also connect uppercase variants that differ by one letter case
    if (upperCaseVariants.length > 1) {
      for (let i = 0; i < upperCaseVariants.length; i++) {
        for (let j = i + 1; j < upperCaseVariants.length; j++) {
          // Only connect if they differ by exactly one case
          if (differsOnlyByOneCase(upperCaseVariants[i], upperCaseVariants[j])) {
            addConnection(connections, upperCaseVariants[i], upperCaseVariants[j]);
            addConnection(connections, upperCaseVariants[j], upperCaseVariants[i]);
          }
        }
      }
    }
  }
}

/**
 * Check if two words differ only by one letter's case
 */
function differsOnlyByOneCase(word1, word2) {
  if (word1.length !== word2.length) {
    return false;
  }
  
  let differences = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) {
      // If they differ by more than just case, return false
      if (word1[i].toLowerCase() !== word2[i].toLowerCase()) {
        return false;
      }
      differences++;
    }
    
    if (differences > 1) {
      return false;
    }
  }
  
  return differences === 1;
}

/**
 * Add a connection between two words
 */
function addConnection(connections, from, to) {
  if (!connections.has(from)) {
    connections.set(from, []);
  }
  
  const existingConnections = connections.get(from);
  if (!existingConnections.includes(to)) {
    existingConnections.push(to);
  }
}

/**
 * Compute possible letter replacements for a position in a word
 */
function getPossibleReplacements(word, position, adjacencyList) {
  if (position < 0 || position >= word.length) {
    return [];
  }
  
  const connectedWords = adjacencyList.get(word) || [];
  const replacements = new Set();
  
  for (const connectedWord of connectedWords) {
    // Only consider words of the same length where the difference
    // is at the specified position
    if (connectedWord.length === word.length &&
        differAtPosition(word, connectedWord, position)) {
      replacements.add(connectedWord[position]);
    }
  }
  
  return Array.from(replacements);
}

/**
 * Compute possible insertions at a position in a word
 */
function getPossibleInsertions(word, position, adjacencyList) {
  if (position < 0 || position > word.length) {
    return [];
  }
  
  const connectedWords = adjacencyList.get(word) || [];
  const insertions = new Set();
  
  for (const connectedWord of connectedWords) {
    // Only consider words that are one character longer
    if (connectedWord.length === word.length + 1) {
      const prefix = word.substring(0, position);
      const suffix = word.substring(position);
      
      // Check if this connected word is the result of inserting
      // a character at the specified position
      if (connectedWord.startsWith(prefix) && 
          connectedWord.endsWith(suffix) && 
          connectedWord.length === prefix.length + suffix.length + 1) {
        insertions.add(connectedWord[position]);
      }
    }
  }
  
  return Array.from(insertions);
}

/**
 * Check if deleting a letter at a position results in a valid word
 */
function canDeleteLetterAt(word, position, words) {
  if (position < 0 || position >= word.length) {
    return false;
  }
  
  const newWord = word.substring(0, position) + word.substring(position + 1);
  return words.has(newWord);
}

/**
 * Check if changing case at a position results in a valid word
 */
function canChangeCaseAt(word, position, words) {
  if (position < 0 || position >= word.length) {
    return false;
  }
  
  const letter = word[position];
  const newLetter = letter === letter.toLowerCase() 
    ? letter.toUpperCase() 
    : letter.toLowerCase();
  
  if (letter === newLetter) {
    return false; // No case difference
  }
  
  const newWord = word.substring(0, position) + newLetter + word.substring(position + 1);
  return words.has(newWord);
}

/**
 * Generate a formatted JSON graph file from a word list
 */
function generateGraphJson(wordList) {
  const { adjacencyList, words } = generateWordGraph(wordList);
  const jsonGraph = {};
  
  for (const word of wordList) {
    const wordData = {};
    
    // Check for possible replacements
    const replacements = [];
    let hasReplacement = false;
    
    for (let i = 0; i < word.length; i++) {
      const possibleReplacements = getPossibleReplacements(word, i, adjacencyList);
      
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
    const insertions = [];
    let hasInsertion = false;
    
    for (let i = 0; i <= word.length; i++) {
      const possibleInsertions = getPossibleInsertions(word, i, adjacencyList);
      
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
      if (canDeleteLetterAt(word, i, words)) {
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
        if (canChangeCaseAt(word, i, words)) {
          upperCaseString += letter;
          hasUpperCase = true;
        } else {
          upperCaseString += '.';
        }
        lowerCaseString += '.';
      } else if (letter === letter.toUpperCase() && letter !== letter.toLowerCase()) {
        if (canChangeCaseAt(word, i, words)) {
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
 * Process a word list file
 */
function processWordListFile(filePath) {
  const fileName = path.basename(filePath, '.txt');
  const jsonOutputPath = path.join(WORDLISTS_DIR, `${fileName}.json`);
  
  console.log(`Processing ${filePath}...`);
  
  try {
    // Read and parse the word list
    const content = fs.readFileSync(filePath, 'utf-8');
    const wordList = content
      .split('\n')
      .map(line => line.trim())
      .filter(word => word.length > 0);
    
    console.log(`Loaded ${wordList.length} words.`);
    
    // Generate the graph
    const jsonGraph = generateGraphJson(wordList);
    
    // Save the JSON
    fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonGraph, null, 2), 'utf-8');
    
    console.log(`Generated graph saved to ${jsonOutputPath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Main function
 */
function main() {
  // Ensure the directory exists
  if (!fs.existsSync(WORDLISTS_DIR)) {
    console.error(`Wordlists directory not found: ${WORDLISTS_DIR}`);
    process.exit(1);
  }
  
  // Find all .txt files in the directory
  const files = fs.readdirSync(WORDLISTS_DIR)
    .filter(file => file.endsWith('.txt'))
    .map(file => path.join(WORDLISTS_DIR, file));
  
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