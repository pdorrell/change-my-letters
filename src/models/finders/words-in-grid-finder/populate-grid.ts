import { DifficultyType, PopulatedGrid, PlacedWord } from './types';

const GRID_SIZE = 10;
const WORDS_TO_FIND_COUNT = 10;

interface WordValidation {
  isValid: boolean;
  reason?: string;
}

export function selectWordsForGrid(words: string[]): string[] {
  const maxAttempts = 10;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = attemptWordSelection(words);
    
    if (result.success) {
      return result.words;
    }
    
    if (attempt === maxAttempts) {
      throw new Error(`Failed to select words after ${maxAttempts} attempts - this indicates a bug in the selection algorithm`);
    }
    
    if (attempt > 1) {
      console.warn(`Word selection attempt ${attempt} failed, retrying...`);
    }
  }
  
  throw new Error('Unexpected error in word selection');
}

function attemptWordSelection(words: string[]): { success: boolean; words: string[] } {
  const selectedWords: string[] = [];
  const usedLetters = new Set<string>();
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  
  // Keep track of which words we've tried
  const attemptedIndices = new Set<number>();
  
  while (selectedWords.length < WORDS_TO_FIND_COUNT) {
    // If we've tried all words, we failed
    if (attemptedIndices.size >= words.length) {
      return { success: false, words: [] };
    }
    
    // Pick a random starting index
    let startIndex = Math.floor(Math.random() * words.length);
    
    // Search forward from this index for a valid word
    let currentIndex = startIndex;
    let foundValidWord = false;
    
    while (attemptedIndices.size < words.length) {
      if (attemptedIndices.has(currentIndex)) {
        currentIndex = (currentIndex + 1) % words.length;
        continue;
      }
      
      attemptedIndices.add(currentIndex);
      const candidateWord = words[currentIndex];
      
      const validation = validateWordForGrid(candidateWord, selectedWords, usedLetters, alphabet);
      
      if (validation.isValid) {
        selectedWords.push(candidateWord);
        // Add letters to used set
        candidateWord.toLowerCase().split('').forEach(letter => usedLetters.add(letter));
        foundValidWord = true;
        break;
      }
      
      currentIndex = (currentIndex + 1) % words.length;
    }
    
    if (!foundValidWord) {
      return { success: false, words: [] };
    }
  }
  
  return { success: true, words: selectedWords };
}

function validateWordForGrid(
  word: string,
  selectedWords: string[],
  usedLetters: Set<string>,
  alphabet: string
): WordValidation {
  // Check minimum length
  if (word.length < 3) {
    return { isValid: false, reason: 'Word too short' };
  }
  
  // Check if already selected
  if (selectedWords.includes(word)) {
    return { isValid: false, reason: 'Already selected' };
  }
  
  // Check for substring/superstring conflicts
  const wordLower = word.toLowerCase();
  for (const selectedWord of selectedWords) {
    const selectedLower = selectedWord.toLowerCase();
    if (wordLower.includes(selectedLower) || selectedLower.includes(wordLower)) {
      return { isValid: false, reason: 'Substring conflict' };
    }
  }
  
  // Check if adding this word would use all letters
  const newUsedLetters = new Set(usedLetters);
  wordLower.split('').forEach(letter => newUsedLetters.add(letter));
  
  if (newUsedLetters.size >= alphabet.length) {
    return { isValid: false, reason: 'Would use all letters' };
  }
  
  return { isValid: true };
}

export function populateGrid(
  words: string[],
  difficulty: DifficultyType,
  forwardsOnly: boolean
): PopulatedGrid {
  const grid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
  const placedWords: PlacedWord[] = [];
  
  // Place words in the grid
  for (const word of words) {
    const placement = findWordPlacement(word, grid, forwardsOnly);
    if (!placement) {
      throw new Error(`Could not place word "${word}" in grid`);
    }
    
    placeWordInGrid(grid, word, placement);
    placedWords.push(placement);
  }
  
  // Fill remaining cells with random letters
  fillRemainingCells(grid, words, difficulty);
  
  // Fix any false placements
  fixFalsePlacements(grid, placedWords, words, forwardsOnly);
  
  return { grid, placedWords };
}

function findWordPlacement(
  word: string,
  grid: string[][],
  forwardsOnly: boolean
): PlacedWord | null {
  const validPlacements: PlacedWord[] = [];
  
  // Try all possible positions
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col <= GRID_SIZE - word.length; col++) {
      // Try forward direction
      if (canPlaceWord(grid, word, row, col, 1)) {
        validPlacements.push({
          word,
          startRow: row,
          startCol: col,
          direction: 1
        });
      }
      
      // Try backward direction (if allowed)
      if (!forwardsOnly && canPlaceWord(grid, word, row, col, -1)) {
        validPlacements.push({
          word,
          startRow: row,
          startCol: col + word.length - 1,
          direction: -1
        });
      }
    }
  }
  
  if (validPlacements.length === 0) {
    return null;
  }
  
  // Choose random placement
  const randomIndex = Math.floor(Math.random() * validPlacements.length);
  return validPlacements[randomIndex];
}

function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  startCol: number,
  direction: 1 | -1
): boolean {
  // Check if word fits in the row
  if (direction === 1 && startCol + word.length > GRID_SIZE) {
    return false;
  }
  if (direction === -1 && startCol - word.length + 1 < 0) {
    return false;
  }
  
  // Check for conflicts with existing words
  for (let i = 0; i < word.length; i++) {
    const col = direction === 1 ? startCol + i : startCol - i;
    if (grid[row][col] !== '') {
      return false;
    }
  }
  
  // Check for adjacent words (must have at least one space)
  const leftCol = direction === 1 ? startCol - 1 : startCol - word.length;
  const rightCol = direction === 1 ? startCol + word.length : startCol + 1;
  
  if (leftCol >= 0 && grid[row][leftCol] !== '') {
    return false;
  }
  if (rightCol < GRID_SIZE && grid[row][rightCol] !== '') {
    return false;
  }
  
  return true;
}

function placeWordInGrid(
  grid: string[][],
  word: string,
  placement: PlacedWord
): void {
  const { startRow, startCol, direction } = placement;
  
  for (let i = 0; i < word.length; i++) {
    const col = direction === 1 ? startCol + i : startCol - i;
    grid[startRow][col] = word[i];
  }
}

function fillRemainingCells(
  grid: string[][],
  words: string[],
  difficulty: DifficultyType
): void {
  const allLetters = 'abcdefghijklmnopqrstuvwxyz';
  const wordLetters = words.join('').toLowerCase();
  
  const letterSource = difficulty === 'easy' ? allLetters : wordLetters;
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === '') {
        const randomIndex = Math.floor(Math.random() * letterSource.length);
        grid[row][col] = letterSource[randomIndex];
      }
    }
  }
}

function fixFalsePlacements(
  grid: string[][],
  placedWords: PlacedWord[],
  words: string[],
  forwardsOnly: boolean
): void {
  const usedLetters = new Set(words.join('').toLowerCase().split(''));
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const unusedLetters = alphabet.split('').filter(letter => !usedLetters.has(letter));
  
  if (unusedLetters.length === 0) {
    return; // No unused letters available for fixing
  }
  
  // Find false placements
  for (const word of words) {
    const falsePlacements = findFalsePlacementsOfWord(grid, word, placedWords, forwardsOnly);
    
    for (const falsePlacement of falsePlacements) {
      fixFalsePlacement(grid, falsePlacement, unusedLetters);
    }
  }
}

function findFalsePlacementsOfWord(
  grid: string[][],
  word: string,
  placedWords: PlacedWord[],
  forwardsOnly: boolean
): Array<{ row: number; startCol: number; direction: 1 | -1 }> {
  const falsePlacements: Array<{ row: number; startCol: number; direction: 1 | -1 }> = [];
  const actualPlacements = placedWords.filter(p => p.word === word);
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col <= GRID_SIZE - word.length; col++) {
      // Check forward direction
      if (matchesWordAtPosition(grid, word, row, col, 1)) {
        const isActualPlacement = actualPlacements.some(p => 
          p.startRow === row && p.startCol === col && p.direction === 1
        );
        
        if (!isActualPlacement) {
          falsePlacements.push({ row, startCol: col, direction: 1 });
        }
      }
      
      // Check backward direction (if not forwards only)
      if (!forwardsOnly && matchesWordAtPosition(grid, word, row, col, -1)) {
        const isActualPlacement = actualPlacements.some(p => 
          p.startRow === row && p.startCol === col + word.length - 1 && p.direction === -1
        );
        
        if (!isActualPlacement) {
          falsePlacements.push({ row, startCol: col + word.length - 1, direction: -1 });
        }
      }
    }
  }
  
  return falsePlacements;
}

function matchesWordAtPosition(
  grid: string[][],
  word: string,
  row: number,
  startCol: number,
  direction: 1 | -1
): boolean {
  for (let i = 0; i < word.length; i++) {
    const col = direction === 1 ? startCol + i : startCol - i;
    if (col < 0 || col >= GRID_SIZE || grid[row][col].toLowerCase() !== word[i].toLowerCase()) {
      return false;
    }
  }
  return true;
}

function fixFalsePlacement(
  grid: string[][],
  placement: { row: number; startCol: number; direction: 1 | -1 },
  unusedLetters: string[]
): void {
  const { row, startCol, direction } = placement;
  
  // Find the first position that's not part of an actual word placement
  // For now, we'll just replace the first letter with a random unused letter
  const col = direction === 1 ? startCol : startCol;
  const randomLetter = unusedLetters[Math.floor(Math.random() * unusedLetters.length)];
  grid[row][col] = randomLetter;
}