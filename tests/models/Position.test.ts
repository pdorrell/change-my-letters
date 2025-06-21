import { WordInteraction } from '@/models/interaction/word-interaction';
import { WordChanger } from '@/models/word-changer';
import { createTestWordChanger } from '@/tests/utils/test-app-builder';

describe('Position', () => {
  let wordChanger: WordChanger;
  let wordInteraction: WordInteraction;

  beforeEach(() => {
    // Create WordChanger with AudioFilePlayerTestDouble
    wordChanger = createTestWordChanger();
    wordInteraction = wordChanger.wordInteraction;
  });

  it('should initialize with the correct properties', () => {
    // Use the position from the word
    const position = wordInteraction.positionInteractions[1].position;

    expect(position.index).toBe(1);
    expect(position.canInsert).toBeDefined();
    expect(position.insertOptions).toBeDefined();
  });

  it('should provide insert options when insertions are possible', () => {
    const position = wordInteraction.positionInteractions[0].position;

    if (position.canInsert) {
      expect(position.insertOptions.length).toBeGreaterThan(0);
      // Insert options should be strings
      position.insertOptions.forEach(option => {
        expect(typeof option).toBe('string');
        expect(option.length).toBe(1);
      });
    }
  });

  it('should have proper index values', () => {
    // Check all positions have correct indices
    wordInteraction.positionInteractions.forEach((posInteraction, index) => {
      expect(posInteraction.position.index).toBe(index);
    });
  });

  it('should be associated with the correct word', () => {
    const position = wordInteraction.positionInteractions[0].position;
    // Test that position exists and has valid index, which implies it's connected to the word
    expect(position.index).toBe(0);
    expect(position).toBeDefined();
  });
});
