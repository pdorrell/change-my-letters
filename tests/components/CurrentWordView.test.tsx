import React from 'react';
import { render } from '@testing-library/react';
import { CurrentWordView } from '../../src/views/CurrentWordView';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { AppState } from '../../src/models/AppState';
import { createTestAppState } from '../utils/TestAppBuilder';


// Mock child components for simpler testing
jest.mock('../../src/views/LetterView', () => ({
  LetterView: ({ letterInteraction }: any) => (
    <div data-testid="letter-view" data-letter={letterInteraction.letter?.value} className="letter-container">
      {letterInteraction.letter?.value}
    </div>
  ),
  LetterPlaceholder: () => (
    <div data-testid="letter-view" className="letter-container letter-placeholder">
      <div className="letter hidden">x</div>
    </div>
  )
}));

jest.mock('../../src/views/PositionView', () => ({
  PositionView: ({ positionInteraction }: any) => (
    <div data-testid="position-view" data-position={positionInteraction.position?.index}></div>
  ),
  PositionPlaceholder: () => (
    <div data-testid="position-view" className="position-placeholder"></div>
  )
}));

// Mock the LetterChoiceMenu inside CurrentWordView
jest.mock('../../src/views/CurrentWordView', () => {
  // Preserve the original export
  const original = jest.requireActual('../../src/views/CurrentWordView');

  // Mock only the LetterChoiceMenu
  return {
    ...original,
    CurrentWordView: original.CurrentWordView,
    LetterChoiceMenu: ({ options, previouslyVisited, wordInteraction }: { options: any[], previouslyVisited: string[], wordInteraction?: any }) => (
      <div data-testid="letter-choice-menu">
        {options.map((option, index) => (
          <div 
            key={index} 
            data-testid="letter-choice-option" 
            className={`letter-choice-option ${previouslyVisited.includes(option.result?.word) ? 'previously-visited' : ''}`}
          >
            {option.letter}
          </div>
        ))}
      </div>
    )
  };
});


describe('CurrentWordView', () => {
  let appState: AppState;
  let currentWord: WordInteraction;
  
  beforeEach(() => {
    // Create AppState with WordSayerTestDouble
    appState = createTestAppState();
    
    // Create a real WordInteraction using actual Word from WordGraph
    const catWord = appState.wordGraph.getRequiredWord('cat');
    currentWord = new WordInteraction(catWord, appState, appState.menuManager);
  });
  
  it('renders the current word with letters and positions', () => {
    const { getAllByTestId } = render(<CurrentWordView currentWord={currentWord} />);
    
    // Get all letter views
    const letterViews = getAllByTestId('letter-view');
    
    // It should render 3 letters for 'cat', plus placeholders for longer words
    expect(letterViews.length).toBeGreaterThanOrEqual(3);
    
    // Check that position views are rendered
    const positionViews = getAllByTestId('position-view');
    expect(positionViews.length).toBeGreaterThanOrEqual(4);
  });
  
  // Tests for previously visited status have been removed since 
  // previouslyVisited has been removed from WordInteraction
  
  it('alternates positions and letters correctly', () => {
    const { container } = render(<CurrentWordView currentWord={currentWord} />);
    
    // Get all children of the word display container
    const displayContainers = container.querySelectorAll('.word-display > *');
    
    // Elements should alternate between positions and letters
    expect(displayContainers[0].getAttribute('data-testid')).toBe('position-view');
    expect(displayContainers[1].getAttribute('data-testid')).toBe('letter-view');
    expect(displayContainers[2].getAttribute('data-testid')).toBe('position-view');
    expect(displayContainers[3].getAttribute('data-testid')).toBe('letter-view');
    expect(displayContainers[4].getAttribute('data-testid')).toBe('position-view');
    expect(displayContainers[5].getAttribute('data-testid')).toBe('letter-view');
    expect(displayContainers[6].getAttribute('data-testid')).toBe('position-view');
  });
  
  it('renders the current word properly', () => {
    const { getAllByTestId } = render(<CurrentWordView currentWord={currentWord} />);
    
    // Get all letter views
    const letterViews = getAllByTestId('letter-view');
    
    // Should have at least 3 letters for 'cat' (plus any placeholders)
    expect(letterViews.length).toBeGreaterThanOrEqual(3);
    
    // Check the letter values
    expect(letterViews[0].getAttribute('data-letter')).toBe('c');
    expect(letterViews[1].getAttribute('data-letter')).toBe('a');
    expect(letterViews[2].getAttribute('data-letter')).toBe('t');
  });
  
  it('handles different word lengths', () => {
    // Test with a different word - we'll use "bat" which is also available in our test graph
    const batWord = appState.wordGraph.getRequiredWord('bat');
    const batWordInteraction = new WordInteraction(batWord, appState, appState.menuManager);
    
    const { getAllByTestId } = render(<CurrentWordView currentWord={batWordInteraction} />);
    
    // Check that it renders all 3 letters of 'bat'
    const letterViews = getAllByTestId('letter-view');
    expect(letterViews.length).toBeGreaterThanOrEqual(3);
    
    // And 4 position views (one before, between each letter, and after)
    const positionViews = getAllByTestId('position-view');
    expect(positionViews.length).toBeGreaterThanOrEqual(4);
  });
});