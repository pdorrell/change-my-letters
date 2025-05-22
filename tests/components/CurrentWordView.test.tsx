import React from 'react';
import { render } from '@testing-library/react';
import { CurrentWordView } from '../../src/views/CurrentWordView';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { AppState } from '../../src/models/AppState';
import { createTestWordGraph, testWordLists } from '../utils/TestWordGraphBuilder';
import { createTestAppState } from '../utils/TestAppBuilder';

// Define test-specific interfaces to avoid readonly issue
interface TestLetterInteraction {
  letter: { value: string, position: number, canDelete: boolean, canReplace: boolean };
  wordInteraction: any;
  isReplaceMenuOpen: boolean;
}

interface TestPositionInteraction {
  position: { index: number, canInsert: boolean };
  wordInteraction: any;
  isInsertMenuOpen: boolean;
}

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
  let appState: any;
  let currentWord: WordInteraction;
  
  beforeEach(() => {
    // Create AppState with WordSayerTestDouble
    appState = createTestAppState();
    
    // Mock the letterInteractions and positionInteractions directly
    currentWord = {
      value: 'cat',
      appState: appState,
      
      // Mock letterInteractions with direct values
      letterInteractions: [
        { 
          letter: { value: 'c', position: 0, canDelete: true, canReplace: true },
          wordInteraction: { /* circular reference */ },
          isReplaceMenuOpen: false,
        } as TestLetterInteraction,
        { 
          letter: { value: 'a', position: 1, canDelete: true, canReplace: true },
          wordInteraction: { /* circular reference */ },
          isReplaceMenuOpen: false,
        } as TestLetterInteraction,
        { 
          letter: { value: 't', position: 2, canDelete: true, canReplace: true },
          wordInteraction: { /* circular reference */ },
          isReplaceMenuOpen: false,
        } as TestLetterInteraction
      ],
      
      // Mock positionInteractions with direct values
      positionInteractions: [
        { 
          position: { index: 0, canInsert: true },
          wordInteraction: { /* circular reference */ },
          isInsertMenuOpen: false,
        } as TestPositionInteraction,
        { 
          position: { index: 1, canInsert: true },
          wordInteraction: { /* circular reference */ },
          isInsertMenuOpen: false,
        } as TestPositionInteraction,
        { 
          position: { index: 2, canInsert: true },
          wordInteraction: { /* circular reference */ },
          isInsertMenuOpen: false,
        } as TestPositionInteraction,
        { 
          position: { index: 3, canInsert: true },
          wordInteraction: { /* circular reference */ },
          isInsertMenuOpen: false,
        } as TestPositionInteraction
      ]
    } as unknown as WordInteraction;
    
    // Create with circular references set upfront
    const letterInteractions = [
      { 
        letter: { value: 'c', position: 0, canDelete: true, canReplace: true },
        wordInteraction: null as any,
        menuManager: appState.menuManager,
        isReplaceMenuOpen: false,
      } as TestLetterInteraction,
      { 
        letter: { value: 'a', position: 1, canDelete: true, canReplace: true },
        wordInteraction: null as any,
        menuManager: appState.menuManager,
        isReplaceMenuOpen: false,
      } as TestLetterInteraction,
      { 
        letter: { value: 't', position: 2, canDelete: true, canReplace: true },
        wordInteraction: null as any,
        menuManager: appState.menuManager,
        isReplaceMenuOpen: false,
      } as TestLetterInteraction
    ];
    
    const positionInteractions = [
      { 
        position: { index: 0, canInsert: true },
        wordInteraction: null as any,
        menuManager: appState.menuManager,
        isInsertMenuOpen: false,
      } as TestPositionInteraction,
      { 
        position: { index: 1, canInsert: true },
        wordInteraction: null as any,
        menuManager: appState.menuManager,
        isInsertMenuOpen: false,
      } as TestPositionInteraction,
      { 
        position: { index: 2, canInsert: true },
        wordInteraction: null as any,
        menuManager: appState.menuManager,
        isInsertMenuOpen: false,
      } as TestPositionInteraction,
      { 
        position: { index: 3, canInsert: true },
        wordInteraction: null as any,
        menuManager: appState.menuManager,
        isInsertMenuOpen: false,
      } as TestPositionInteraction
    ];
    
    // Create the object first
    currentWord = {
      value: 'cat',
      appState: appState,
      menuManager: appState.menuManager,
      letterInteractions,
      positionInteractions,
      word: { previouslyVisited: false }
    } as unknown as WordInteraction;
    
    // Now fix circular references
    letterInteractions.forEach(li => (li as any).wordInteraction = currentWord);
    positionInteractions.forEach(pi => (pi as any).wordInteraction = currentWord);
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
    // Not needed anymore - we'll use the longWord created below
    
    // Create with circular references set upfront
    const longLetterInteractions = [
      { letter: { value: 'l', position: 0, canDelete: true, canReplace: true }, wordInteraction: null as any, menuManager: appState.menuManager, isReplaceMenuOpen: false } as TestLetterInteraction,
      { letter: { value: 'o', position: 1, canDelete: true, canReplace: true }, wordInteraction: null as any, menuManager: appState.menuManager, isReplaceMenuOpen: false } as TestLetterInteraction,
      { letter: { value: 'n', position: 2, canDelete: true, canReplace: true }, wordInteraction: null as any, menuManager: appState.menuManager, isReplaceMenuOpen: false } as TestLetterInteraction,
      { letter: { value: 'g', position: 3, canDelete: true, canReplace: true }, wordInteraction: null as any, menuManager: appState.menuManager, isReplaceMenuOpen: false } as TestLetterInteraction,
      { letter: { value: 'e', position: 4, canDelete: true, canReplace: true }, wordInteraction: null as any, menuManager: appState.menuManager, isReplaceMenuOpen: false } as TestLetterInteraction,
      { letter: { value: 'r', position: 5, canDelete: true, canReplace: true }, wordInteraction: null as any, menuManager: appState.menuManager, isReplaceMenuOpen: false } as TestLetterInteraction
    ];
    
    const longPositionInteractions = [
      { position: { index: 0, canInsert: true }, wordInteraction: null as any, menuManager: appState.menuManager, isInsertMenuOpen: false } as TestPositionInteraction,
      { position: { index: 1, canInsert: true }, wordInteraction: null as any, menuManager: appState.menuManager, isInsertMenuOpen: false } as TestPositionInteraction,
      { position: { index: 2, canInsert: true }, wordInteraction: null as any, menuManager: appState.menuManager, isInsertMenuOpen: false } as TestPositionInteraction,
      { position: { index: 3, canInsert: true }, wordInteraction: null as any, menuManager: appState.menuManager, isInsertMenuOpen: false } as TestPositionInteraction,
      { position: { index: 4, canInsert: true }, wordInteraction: null as any, menuManager: appState.menuManager, isInsertMenuOpen: false } as TestPositionInteraction,
      { position: { index: 5, canInsert: true }, wordInteraction: null as any, menuManager: appState.menuManager, isInsertMenuOpen: false } as TestPositionInteraction,
      { position: { index: 6, canInsert: true }, wordInteraction: null as any, menuManager: appState.menuManager, isInsertMenuOpen: false } as TestPositionInteraction
    ];
    
    // Create the object first
    const longWord = {
      value: 'longer',
      appState: appState,
      menuManager: appState.menuManager,
      letterInteractions: longLetterInteractions,
      positionInteractions: longPositionInteractions,
      word: { previouslyVisited: false }
    } as unknown as WordInteraction;
    
    // Now fix circular references
    longLetterInteractions.forEach(li => (li as any).wordInteraction = longWord);
    longPositionInteractions.forEach(pi => (pi as any).wordInteraction = longWord);
    
    const { getAllByTestId } = render(<CurrentWordView currentWord={longWord} />);
    
    // Check that it renders all 6 letters of 'longer'
    const letterViews = getAllByTestId('letter-view');
    expect(letterViews.length).toBeGreaterThanOrEqual(6);
    
    // And 7 position views (one before, between each letter, and after)
    const positionViews = getAllByTestId('position-view');
    expect(positionViews.length).toBeGreaterThanOrEqual(7);
  });
});