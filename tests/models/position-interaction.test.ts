import { PositionInteraction } from '@/models/interaction/position-interaction';
import { Position } from '@/models/Position';
import { AppState } from '@/models/app-state';
import { createTestAppState } from '@/tests/utils/test-app-builder';

describe('PositionInteraction', () => {
  let positionInteraction: PositionInteraction;
  let position: Position;
  let appState: AppState;

  beforeEach(() => {
    // Create AppState with AudioFilePlayerTestDouble
    appState = createTestAppState();

    // Create WordInteraction using Word from WordGraph
    const catWord = appState.wordGraph.getRequiredWord('cat');

    // Get the first position
    position = catWord.positions[0];

    // Create the position interaction to test
    positionInteraction = new PositionInteraction(position, appState.newWordHandler, appState.menuManager);
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
