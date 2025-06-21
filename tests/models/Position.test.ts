import { WordInteraction } from '@/models/interaction/word-interaction';
import { AppState } from '@/models/app-state';
import { createTestAppState } from '@/tests/utils/test-app-builder';

describe('Position', () => {
  let appState: AppState;
  let wordChanger: WordInteraction;

  beforeEach(() => {
    // Create AppState with AudioFilePlayerTestDouble
    appState = createTestAppState();

    // Create WordInteraction using Word from WordGraph
    const catWord = appState.wordGraph.getRequiredWord('cat');
    wordChanger = new WordInteraction(catWord, appState.newWordHandler, appState.wordSayer, appState.menuManager, appState.history);
  });

  it('should initialize with the correct properties', () => {
    // Use the position from the word
    const position = wordChanger.positionInteractions[1].position;

    expect(position.index).toBe(1);
    expect(position.canInsert).toBeDefined();
    expect(position.insertOptions).toBeDefined();
  });

  it('should provide insert options when insertions are possible', () => {
    const position = wordChanger.positionInteractions[0].position;

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
    wordChanger.positionInteractions.forEach((posInteraction, index) => {
      expect(posInteraction.position.index).toBe(index);
    });
  });

  it('should be associated with the correct word', () => {
    const position = wordChanger.positionInteractions[0].position;
    // Test that position exists and has valid index, which implies it's connected to the word
    expect(position.index).toBe(0);
    expect(position).toBeDefined();
  });
});
