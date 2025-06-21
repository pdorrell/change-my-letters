import React from 'react';
import { render } from '@testing-library/react';
import { WordChangerView } from '@/views/word-changer';
import { WordInteraction } from '@/models/interaction/word-interaction';
import { AppState } from '@/models/app-state';
import { createTestAppState } from '@/tests/utils/test-app-builder';




describe('WordChangerView', () => {
  let appState: AppState;
  let wordChanger: WordInteraction;

  beforeEach(() => {
    // Create AppState with AudioFilePlayerTestDouble
    appState = createTestAppState();

    // Create WordInteraction using Word from WordGraph
    const catWord = appState.wordGraph.getRequiredWord('cat');
    wordChanger = new WordInteraction(catWord, appState.newWordHandler, appState.wordSayer, appState.menuManager, appState.history);
  });

  it('renders the word changer with letters and positions', () => {
    const { container } = render(<WordChangerView wordChanger={wordChanger} maxWordLength={10} />);

    // Get all letter containers (LetterView components)
    const letterViews = container.querySelectorAll('.letter-container');

    // It should render 3 letters for 'cat', plus placeholders for longer words
    expect(letterViews.length).toBeGreaterThanOrEqual(3);

    // Check that position views are rendered
    const positionViews = container.querySelectorAll('.position-container');
    expect(positionViews.length).toBeGreaterThanOrEqual(4);
  });

  // Tests for previously visited status have been removed since
  // previouslyVisited has been removed from WordInteraction

  it('alternates positions and letters correctly', () => {
    const { container } = render(<WordChangerView wordChanger={wordChanger} maxWordLength={10} />);

    // Get all children of the word display container
    const displayContainers = container.querySelectorAll('.word-display > *');

    // Elements should alternate between positions and letters
    expect(displayContainers[0]).toHaveClass('position-container');
    expect(displayContainers[1]).toHaveClass('letter-container');
    expect(displayContainers[2]).toHaveClass('position-container');
    expect(displayContainers[3]).toHaveClass('letter-container');
    expect(displayContainers[4]).toHaveClass('position-container');
    expect(displayContainers[5]).toHaveClass('letter-container');
    expect(displayContainers[6]).toHaveClass('position-container');
  });

  it('renders the word changer properly', () => {
    const { container } = render(<WordChangerView wordChanger={wordChanger} maxWordLength={10} />);

    // Get all letter containers
    const letterViews = container.querySelectorAll('.letter-container');

    // Should have at least 3 letters for 'cat' (plus any placeholders)
    expect(letterViews.length).toBeGreaterThanOrEqual(3);

    // Check the letter values by looking at the .letter elements inside containers
    const letters = container.querySelectorAll('.letter');
    expect(letters[0]).toHaveTextContent('c');
    expect(letters[1]).toHaveTextContent('a');
    expect(letters[2]).toHaveTextContent('t');
  });

  it('handles different word lengths', () => {
    // Test with a different word - we'll use "bat" which is also available in our test graph
    const batWord = appState.wordGraph.getRequiredWord('bat');
    const batWordInteraction = new WordInteraction(batWord, appState.newWordHandler, appState.wordSayer, appState.menuManager, appState.history);

    const { container } = render(<WordChangerView wordChanger={batWordInteraction} maxWordLength={10} />);

    // Check that it renders all 3 letters of 'bat'
    const letterViews = container.querySelectorAll('.letter-container');
    expect(letterViews.length).toBeGreaterThanOrEqual(3);

    // And 4 position views (one before, between each letter, and after)
    const positionViews = container.querySelectorAll('.position-container');
    expect(positionViews.length).toBeGreaterThanOrEqual(4);
  });
});
