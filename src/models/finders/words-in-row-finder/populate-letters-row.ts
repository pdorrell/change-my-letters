import { DifficultyType, PopulatedLettersRow } from './types';

export function populateLettersRow(
  word: string,
  rowLength: number,
  difficulty: DifficultyType,
  forwardsOnly: boolean
): PopulatedLettersRow {
  const wordDirection = forwardsOnly ? 1 : Math.random() < 0.5 ? 1 : -1;
  const maxStartPos = rowLength - word.length;
  const wordStart = Math.floor(Math.random() * (maxStartPos + 1));

  const letters = new Array(rowLength).fill('');

  // Place the word in the row
  for (let i = 0; i < word.length; i++) {
    const pos = wordDirection === 1 ? wordStart + i : wordStart + word.length - 1 - i;
    letters[pos] = word[i];
  }

  // Precompute letter sets that avoid duplicates
  const wordLetters = Array.from(new Set(word.toLowerCase().split('')));
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  // Letters that could cause duplicates (first and last letters of the word)
  const firstLetter = word[0].toLowerCase();
  const lastLetter = word[word.length - 1].toLowerCase();
  const forbiddenLetters = Array.from(new Set([firstLetter, lastLetter]));

  // Create altered letter sets that exclude forbidden letters
  const alteredWordLetters = wordLetters.filter(letter => !forbiddenLetters.includes(letter));
  const alteredAlphabetLetters = alphabet.filter(letter => !forbiddenLetters.includes(letter));

  // Fill remaining positions
  for (let i = 0; i < rowLength; i++) {
    if (letters[i] === '') {
      let candidateLetter: string;

      if (difficulty === 'easy') {
        // Easy: choose from altered alphabet letters
        candidateLetter = alteredAlphabetLetters[Math.floor(Math.random() * alteredAlphabetLetters.length)];
      } else {
        // Hard: 40% alphabet, 60% word letters (from altered sets)
        if (Math.random() < 0.4 || alteredWordLetters.length === 0) {
          // Use altered alphabet letters
          candidateLetter = alteredAlphabetLetters[Math.floor(Math.random() * alteredAlphabetLetters.length)];
        } else {
          // Use altered word letters
          candidateLetter = alteredWordLetters[Math.floor(Math.random() * alteredWordLetters.length)];
        }
      }

      letters[i] = candidateLetter;
    }
  }

  return {
    letters: letters.join(''),
    wordStart,
    wordDirection
  };
}

