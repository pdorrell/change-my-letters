import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { LetterChoiceMenu } from '../../src/views/CurrentWordView';
import { createTestWordGraph, testWordLists } from '../utils/TestWordGraphBuilder';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { WordSayer } from '../../src/models/WordSayer';

// Mock floating-ui for menus since we don't need real positioning in tests
jest.mock('@floating-ui/react', () => ({
  useFloating: () => ({
    refs: { setFloating: jest.fn() },
    floatingStyles: {},
    context: {},
  }),
  offset: jest.fn(() => ({ name: 'offset' })),
  flip: jest.fn(() => ({ name: 'flip' })),
  shift: jest.fn(() => ({ name: 'shift' })),
  autoUpdate: jest.fn(),
  useDismiss: jest.fn(() => ({ name: 'dismiss' })),
  useRole: jest.fn(() => ({ name: 'role' })),
  useInteractions: jest.fn(() => ({ getFloatingProps: jest.fn() })),
  FloatingPortal: ({ children }: { children: React.ReactNode }) => <div data-testid="letter-choice-menu">{children}</div>,
}));

// Mock WordSayer to avoid audio issues in tests
jest.mock('../../src/models/WordSayer', () => ({
  WordSayer: jest.fn().mockImplementation(() => ({
    preload: jest.fn(),
    say: jest.fn()
  }))
}));

describe('LetterChoiceMenu', () => {
  let wordGraph: any;
  let appState: any;
  let wordInteraction: WordInteraction;
  let options: any[]; // Letter change options
  let onSelect: jest.Mock;
  
  beforeEach(() => {
    // Create a mock AppState
    appState = {
      toggleMenu: jest.fn(),
      closeAllMenus: jest.fn(),
      setNewWord: jest.fn(),
      activeButtonElement: document.createElement('button'),
      navigateTo: jest.fn(),
      history: {
        hasVisited: jest.fn(word => ['bat', 'rat'].includes(word)),
        currentIndex: 0,
        canUndo: false,
        canRedo: false,
        words: []
      }
    };
    
    // Create a mock WordInteraction
    wordInteraction = {
      value: 'cat',
      previouslyVisited: false,
      appState: appState
    } as any;
    
    // Create sample letter change options
    options = [
      { letter: 'b', result: { word: 'bat' } },
      { letter: 'h', result: { word: 'hat' } },
      { letter: 'r', result: { word: 'rat' } }
    ];
    
    // Mock select handler
    onSelect = jest.fn();
  });
  
  it('renders letter options correctly', () => {
    const { container } = render(
      <LetterChoiceMenu 
        options={options} 
        onSelect={onSelect} 
        previouslyVisited={['bat', 'rat']} 
        wordInteraction={wordInteraction} 
      />
    );
    
    // Should render the letter options
    const letterOption1 = container.querySelector('.letter-choice-option:nth-child(1)');
    const letterOption2 = container.querySelector('.letter-choice-option:nth-child(2)');
    const letterOption3 = container.querySelector('.letter-choice-option:nth-child(3)');
    
    expect(letterOption1?.textContent).toBe('b');
    expect(letterOption2?.textContent).toBe('h');
    expect(letterOption3?.textContent).toBe('r');
  });
  
  it('marks previously visited options correctly', () => {
    const { container } = render(
      <LetterChoiceMenu 
        options={options} 
        onSelect={onSelect} 
        previouslyVisited={['bat', 'rat']} 
        wordInteraction={wordInteraction} 
      />
    );
    
    // Get the letter option elements
    const letterOption1 = container.querySelector('.letter-choice-option:nth-child(1)');
    const letterOption2 = container.querySelector('.letter-choice-option:nth-child(2)');
    const letterOption3 = container.querySelector('.letter-choice-option:nth-child(3)');
    
    // First option (b -> bat) should be previously visited
    expect(letterOption1?.classList.contains('previously-visited')).toBe(true);
    
    // Second option (h -> hat) should not be previously visited
    expect(letterOption2?.classList.contains('previously-visited')).toBe(false);
    
    // Third option (r -> rat) should be previously visited
    expect(letterOption3?.classList.contains('previously-visited')).toBe(true);
  });
  
  it('calls onSelect when a letter choice is clicked', () => {
    const { container } = render(
      <LetterChoiceMenu 
        options={options} 
        onSelect={onSelect} 
        previouslyVisited={['bat', 'rat']} 
        wordInteraction={wordInteraction} 
      />
    );
    
    // Get the first letter option and click it
    const letterOption1 = container.querySelector('.letter-choice-option:nth-child(1)');
    if (letterOption1) fireEvent.click(letterOption1);
    
    // onSelect should have been called with the result of the first option
    expect(onSelect).toHaveBeenCalledWith({ word: 'bat' });
  });
});