import { PositionInteraction } from '@/models/interaction/position';
import { Position } from '@/models/Position';
import { WordChanger } from '@/models/changer/word-changer';
import { createTestWordChanger } from '@/tests/utils/test-app-builder';
import { createTestWordGraph, testWordLists } from '@/tests/utils/test-word-graph-builder';

describe('PositionInteraction', () => {
  let positionInteraction: PositionInteraction;
  let position: Position;
  let wordChanger: WordChanger;

  beforeEach(() => {
    // Create WordChanger with AudioFilePlayerTestDouble
    wordChanger = createTestWordChanger();

    // Create WordInteraction using Word from WordGraph
    const wordGraph = createTestWordGraph(testWordLists.minimal);
    const catWord = wordGraph.getRequiredWord('cat');

    // Get the first position
    position = catWord.positions[0];

    // Create the position interaction to test
    positionInteraction = new PositionInteraction(position, wordChanger.newWordHandler, wordChanger.menuManager);
  });

  it('should initialize with correct position references', () => {
    expect(positionInteraction.position).toBe(position);
    expect(positionInteraction.isInsertMenuOpen).toBe(false);
  });

  it('should be able to control insert menu state', () => {
    // Initially closed
    expect(positionInteraction.isInsertMenuOpen).toBe(false);

    // Open menu
    positionInteraction.isInsertMenuOpen = true;
    expect(positionInteraction.isInsertMenuOpen).toBe(true);

    // Close menu
    positionInteraction.isInsertMenuOpen = false;
    expect(positionInteraction.isInsertMenuOpen).toBe(false);
  });

  it('should be able to modify the state directly', () => {
    // Verify we can change menu state and it persists
    positionInteraction.isInsertMenuOpen = true;
    expect(positionInteraction.isInsertMenuOpen).toBe(true);

    positionInteraction.isInsertMenuOpen = false;
    expect(positionInteraction.isInsertMenuOpen).toBe(false);
  });
});
