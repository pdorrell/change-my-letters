export const range = (n: number) => Array.from({ length: n }, (_, i) => i);

// Negative feedback words for incorrect selections
const NEGATIVE_WORDS = ['oh dear!', 'oh no!', 'whoops!'];

/**
 * Get a random negative word for incorrect selections
 */
export const getRandomNegativeWord = (): string => {
  const randomIndex = Math.floor(Math.random() * NEGATIVE_WORDS.length);
  return NEGATIVE_WORDS[randomIndex];
};
