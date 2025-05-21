import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { PositionView } from '../../src/views/PositionView';
import { Position } from '../../src/models/Position';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { AppState } from '../../src/models/AppState';
import { createTestWordGraph, testWordLists } from '../utils/TestWordGraphBuilder';
import { WordSayer } from '../../src/models/WordSayer';

// Mock the LetterChoiceMenu component only (not the model classes)
jest.mock('../../src/views/CurrentWordView', () => ({
  LetterChoiceMenu: ({ options, onSelect }: { options: any[], onSelect: (word: any) => void }) => (
    <div data-testid="letter-choice-menu">
      {options.map((option, index) => (
        <div key={index} data-testid="letter-choice-option" onClick={() => onSelect(option.result)}>
          {option.letter}
        </div>
      ))}
    </div>
  ),
}));

// Mock WordSayer to avoid audio issues in tests
jest.mock('../../src/models/WordSayer', () => ({
  WordSayer: jest.fn().mockImplementation(() => ({
    preload: jest.fn(),
    say: jest.fn()
  }))
}));

describe('PositionView', () => {
  let wordGraph: any;
  let appState: any;
  let currentWord: WordInteraction;
  let positionInteraction: any;
  
  beforeEach(() => {
    // Create a mock AppState (this is still mocked because it's complex)
    appState = {
      setNewWord: jest.fn(),
      menuManager: {
        activeButtonElement: null,
        toggleMenu: jest.fn(),
        closeMenus: jest.fn()
      },
      navigateTo: jest.fn(),
      history: {
        hasVisited: jest.fn().mockReturnValue(false),
        currentIndex: 0,
        canUndo: false,
        canRedo: false,
        words: [],
        previouslyVisitedWords: new Set()
      }
    };
    
    // Create a mock word interaction
    currentWord = {
      value: 'cat',
      previouslyVisited: false,
      appState: appState
    } as any;
    
    // Create a mock position interaction
    positionInteraction = {
      position: {
        index: 0,
        canInsert: true,
        insertOptions: ['b', 'h', 'r'],
        changes: {
          insertChanges: [
            { letter: 'b', result: { word: 'bcat' } },
            { letter: 'h', result: { word: 'hcat' } },
            { letter: 'r', result: { word: 'rcat' } }
          ]
        }
      },
      wordInteraction: currentWord,
      menuManager: appState.menuManager,
      isInsertMenuOpen: false,
      setNewWord: jest.fn().mockImplementation((word) => {
        appState.setNewWord(word);
      }),
      insertAction: {
        enabled: true,
        do_action: jest.fn().mockImplementation(() => {
          appState.menuManager.toggleMenu(false, jest.fn(), null);
        })
      },
      insertButtonRef: React.createRef()
    };
    
    // Add the positionInteraction to the currentWord for circular reference
    currentWord.positionInteractions = [positionInteraction];
  });

  it('renders with insert icon when insertion is possible', () => {
    // In our test graph, we should be able to insert letters before 'cat'
    const { container } = render(<PositionView positionInteraction={positionInteraction} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    expect(insertButton).toBeInTheDocument();
  });
  
  it('calls toggleMenu when insert icon is clicked', () => {
    const { container } = render(<PositionView positionInteraction={positionInteraction} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    if (insertButton) fireEvent.click(insertButton);
    
    expect(positionInteraction.menuManager.toggleMenu).toHaveBeenCalledWith(false, expect.any(Function), null);
  });
  
  it('shows letter choice menu when insert menu is open', () => {
    // Set the insert menu to open
    positionInteraction.isInsertMenuOpen = true;
    
    const { getByTestId } = render(<PositionView positionInteraction={positionInteraction} />);
    
    expect(getByTestId('letter-choice-menu')).toBeInTheDocument();
  });
  
  it('calls setNewWord when a letter choice is selected', () => {
    // Set the insert menu to open
    positionInteraction.isInsertMenuOpen = true;
    
    const { getAllByTestId } = render(<PositionView positionInteraction={positionInteraction} />);
    
    // Get the letter choice options
    const letterOptions = getAllByTestId('letter-choice-option');
    
    // Should be at least one letter option
    expect(letterOptions.length).toBeGreaterThan(0);
    
    // Click the first option
    fireEvent.click(letterOptions[0]);
    
    // Should call setNewWord with a Word object
    expect(appState.setNewWord).toHaveBeenCalled();
  });
  
  it('handles positions that cannot insert letters', () => {
    // Create a position that cannot insert letters
    const cannotInsertPosition = {
      ...positionInteraction.position,
      canInsert: false,
      insertOptions: []
    };
    
    const mockPositionInteraction = {
      position: cannotInsertPosition,
      wordInteraction: currentWord,
      menuManager: appState.menuManager,
      isInsertMenuOpen: false,
      setNewWord: jest.fn().mockImplementation((word) => {
        appState.setNewWord(word);
      }),
      insertAction: {
        enabled: false,
        do_action: jest.fn()
      },
      insertButtonRef: React.createRef()
    };
    
    const { container } = render(<PositionView positionInteraction={mockPositionInteraction as any} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    expect(insertButton).not.toBeInTheDocument();
  });
});