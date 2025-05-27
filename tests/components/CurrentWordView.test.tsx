import React from 'react';
import { render } from '@testing-library/react';
import { CurrentWordView } from '../../src/views/CurrentWord';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { AppState } from '../../src/models/AppState';
import { createTestAppState } from '../utils/TestAppBuilder';




describe('CurrentWordView', () => {
  let appState: AppState;
  let currentWord: WordInteraction;
  
  beforeEach(() => {
    // Create AppState with WordSayerTestDouble
    appState = createTestAppState();
    
    // Create WordInteraction using Word from WordGraph
    const catWord = appState.wordGraph.getRequiredWord('cat');
    currentWord = new WordInteraction(catWord, appState.newWordHandler, appState.wordSayer, appState.menuManager, appState.history);
  });
  
  it('renders the current word with letters and positions', () => {
    const { container } = render(<CurrentWordView currentWord={currentWord} maxWordLength={10} />);
    
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
    const { container } = render(<CurrentWordView currentWord={currentWord} maxWordLength={10} />);
    
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
  
  it('renders the current word properly', () => {
    const { container } = render(<CurrentWordView currentWord={currentWord} maxWordLength={10} />);
    
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
    
    const { container } = render(<CurrentWordView currentWord={batWordInteraction} maxWordLength={10} />);
    
    // Check that it renders all 3 letters of 'bat'
    const letterViews = container.querySelectorAll('.letter-container');
    expect(letterViews.length).toBeGreaterThanOrEqual(3);
    
    // And 4 position views (one before, between each letter, and after)
    const positionViews = container.querySelectorAll('.position-container');
    expect(positionViews.length).toBeGreaterThanOrEqual(4);
  });
});