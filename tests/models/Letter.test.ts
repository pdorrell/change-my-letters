import { WordInteraction } from '@/models/interaction/word';
import { WordChanger } from '@/models/changer/word-changer';
import { createTestWordChanger } from '@/tests/utils/test-app-builder';

describe('Letter', () => {
  let wordChanger: WordChanger;
  let wordInteraction: WordInteraction;

  beforeEach(() => {
    // Create WordChanger with AudioFilePlayerTestDouble
    wordChanger = createTestWordChanger();
    wordInteraction = wordChanger.wordInteraction;
  });

  it('should initialize with the correct properties', () => {
    // Use the first letter from the word
    const letter = wordInteraction.letterInteractions[0].letter;

    expect(letter.value).toBe('c');
    expect(letter.position).toBe(0);
    expect(letter.canDelete).toBeDefined();
    expect(letter.canReplace).toBeDefined();
  });

  it('should provide replacement options when replacements are possible', () => {
    const letter = wordInteraction.letterInteractions[0].letter;

    if (letter.canReplace) {
      expect(letter.replacements.length).toBeGreaterThan(0);
      // Replace options should be strings
      letter.replacements.forEach(option => {
        expect(typeof option).toBe('string');
        expect(option.length).toBe(1);
      });
    }
  });

  it('should have correct position values for all letters', () => {
    // Check all letters have correct positions
    wordInteraction.letterInteractions.forEach((letterInteraction, index) => {
      expect(letterInteraction.letter.position).toBe(index);
    });
  });

  it('should have changes property', () => {
    const letter = wordInteraction.letterInteractions[0].letter;
    expect(letter.changes).toBeDefined();
    expect(letter.changes.deleteChange).toBeDefined();
    expect(letter.changes.replaceChanges).toBeDefined();
  });
});
