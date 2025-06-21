export const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/**
 * Create a shuffled copy of an array using Fisher-Yates shuffle algorithm
 * @param array The array to shuffle
 * @returns A new array with the same elements in random order
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
