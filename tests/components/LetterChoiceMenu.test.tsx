import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { LetterChoiceMenu } from '../../src/views/CurrentWordView';
import { createTestWordGraph, testWordLists } from '../utils/TestWordGraphBuilder';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { createTestAppState } from '../utils/TestAppBuilder';
import { MenuManager } from '../../src/models/MenuManager';
import { WordSelectionByLetter } from '../../src/models/WordSelectionByLetter';
import { AppState } from '../../src/models/AppState';
import { TestChoiceHandler } from '../utils/TestChoiceHandler';

describe('LetterChoiceMenu', () => {
  let appState: AppState;
  let wordInteraction: WordInteraction;
  let menuManager: MenuManager;
  let options: any[]; // Letter change options
  let choiceHandler: TestChoiceHandler<any>;
  let menuRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    // Create AppState with WordSayerTestDouble
    appState = createTestAppState();
    appState.menuManager.activeButtonElement = document.createElement('button');
    // Pre-populate visited words
    appState.previouslyVisitedWords.add('bat');
    appState.previouslyVisitedWords.add('rat');

    // Assign the menuManager for direct use
    menuManager = appState.menuManager;

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

    // Create choice handler
    choiceHandler = new TestChoiceHandler<any>();
    
    // Create menu ref for testing
    menuRef = React.createRef<HTMLDivElement>();
  });


  it('renders letter options correctly', () => {
    // Set previouslyVisited on the result objects
    options[0].result.previouslyVisited = true; // 'bat' was visited
    options[2].result.previouslyVisited = true; // 'rat' was visited

    const wordSelectionByLetter = new WordSelectionByLetter(options, choiceHandler.chooser);

    render(
      <LetterChoiceMenu
        wordSelectionByLetter={wordSelectionByLetter}
        menuManager={menuManager}
        menuRef={menuRef}
      />
    );

    // Should render the letter options - use menuRef to access the real DOM
    const menu = menuRef.current;
    expect(menu).not.toBeNull();
    
    const letterOption1 = menu?.querySelector('.letter-choice-option:nth-child(1)');
    const letterOption2 = menu?.querySelector('.letter-choice-option:nth-child(2)');
    const letterOption3 = menu?.querySelector('.letter-choice-option:nth-child(3)');

    expect(letterOption1?.textContent).toBe('b');
    expect(letterOption2?.textContent).toBe('h');
    expect(letterOption3?.textContent).toBe('r');
  });

  it('marks previously visited options correctly', () => {
    // Set previouslyVisited on the result objects
    options[0].result.previouslyVisited = true; // 'bat' was visited
    options[2].result.previouslyVisited = true; // 'rat' was visited

    const wordSelectionByLetter = new WordSelectionByLetter(options, choiceHandler.chooser);

    render(
      <LetterChoiceMenu
        wordSelectionByLetter={wordSelectionByLetter}
        menuManager={menuManager}
        menuRef={menuRef}
      />
    );

    // Should render the letter options - use menuRef to access the real DOM
    const menu = menuRef.current;
    expect(menu).not.toBeNull();
    
    const letterOption1 = menu?.querySelector('.letter-choice-option:nth-child(1)');
    const letterOption2 = menu?.querySelector('.letter-choice-option:nth-child(2)');
    const letterOption3 = menu?.querySelector('.letter-choice-option:nth-child(3)');

    // First option (b -> bat) should be previously visited
    expect(letterOption1?.classList.contains('previously-visited')).toBe(true);

    // Second option (h -> hat) should not be previously visited
    expect(letterOption2?.classList.contains('previously-visited')).toBe(false);

    // Third option (r -> rat) should be previously visited
    expect(letterOption3?.classList.contains('previously-visited')).toBe(true);
  });

  it('calls onSelect when a letter choice is clicked', () => {
    // Set previouslyVisited on the result objects
    options[0].result.previouslyVisited = true; // 'bat' was visited
    options[2].result.previouslyVisited = true; // 'rat' was visited

    const wordSelectionByLetter = new WordSelectionByLetter(options, choiceHandler.chooser);

    render(
      <LetterChoiceMenu
        wordSelectionByLetter={wordSelectionByLetter}
        menuManager={menuManager}
        menuRef={menuRef}
      />
    );

    // Get the first letter option and click it - use menuRef to access the real DOM
    const menu = menuRef.current;
    expect(menu).not.toBeNull();
    
    const letterOption1 = menu?.querySelector('.letter-choice-option:nth-child(1)');
    if (letterOption1) fireEvent.click(letterOption1);

    // choiceHandler should have received the result of the first option
    expect(choiceHandler.choice).toEqual({ word: 'bat', previouslyVisited: true });
  });
});
