import { PositionInteraction } from '../../src/models/interaction/PositionInteraction';
import { Position } from '../../src/models/Position';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { AppState } from '../../src/models/AppState';
import { createTestAppState } from '../utils/TestAppBuilder';

describe('PositionInteraction', () => {
  let positionInteraction: PositionInteraction;
  let position: Position;
  let wordInteraction: WordInteraction;
  let appState: AppState;
  
  beforeEach(() => {
    // Create AppState with WordSayerTestDouble
    appState = createTestAppState();
    
    // Create WordInteraction using Word from WordGraph
    const catWord = appState.wordGraph.getRequiredWord('cat');
    wordInteraction = new WordInteraction(catWord, appState, appState.menuManager);
    
    // Get the first position
    position = catWord.positions[0];
    
    // Create the position interaction to test
    positionInteraction = new PositionInteraction(position, wordInteraction, appState.menuManager);
  });
  
  it('should initialize with correct position and word interaction references', () => {
    expect(positionInteraction.position).toBe(position);
    expect(positionInteraction.wordInteraction).toBe(wordInteraction);
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