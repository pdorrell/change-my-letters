// This is a shim to help with the transition from CurrentWord to WordInteraction
// Eventually all imports of CurrentWord should be replaced with WordInteraction directly
import { WordInteraction } from './interaction/WordInteraction';
import { AppState } from './AppState';
import { WordGraphNode } from './WordGraphNode';

/**
 * Shim class that wraps WordInteraction to maintain backward compatibility
 */
export class CurrentWord extends WordInteraction {
  // Add the old properties as getters
  get letters() {
    return this.letterInteractions.map(interaction => interaction.letter);
  }

  get positions() {
    return this.positionInteractions.map(interaction => interaction.position);
  }

  constructor(nodeOrWord: WordGraphNode | string, appState: AppState, hasBeenVisited: boolean = false) {
    if (typeof nodeOrWord === 'string') {
      // If a string was passed, get the node from the wordGraph
      const node = appState.wordGraph.getNode(nodeOrWord);
      if (!node) {
        throw new Error(`Word "${nodeOrWord}" doesn't exist in the word graph`);
      }
      super(node, appState, hasBeenVisited);
    } else {
      // If a node was passed, use it directly
      super(nodeOrWord, appState, hasBeenVisited);
    }

    // No need to call makeObservable here since it's called in the parent class
  }
}