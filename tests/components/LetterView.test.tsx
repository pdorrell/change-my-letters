import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { LetterView } from '../../src/views/LetterView';
import { Letter } from '../../src/models/Letter';
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

describe('LetterView', () => {
  let wordGraph: any;
  let appState: any;
  let currentWord: WordInteraction;
  let letterInteraction: any;

  beforeEach(() => {
    // Create a mock AppState (this is still mocked because it's complex)
    appState = {
      toggleMenu: jest.fn(),
      closeAllMenus: jest.fn(),
      setNewWord: jest.fn(),
      activeButtonElement: null,
      navigateTo: jest.fn(),
      history: {
        hasVisited: jest.fn().mockReturnValue(false),
        currentIndex: 0,
        canUndo: false,
        canRedo: false,
        words: []
      }
    };

    // Create a mock word interaction
    currentWord = {
      value: 'cat',
      previouslyVisited: false,
      appState: appState
    } as any;

    // Create a mock letter interaction for the first letter 'c'
    letterInteraction = {
      letter: {
        value: 'c',
        position: 0,
        canDelete: true,
        canReplace: true,
        replacements: ['b', 'h', 'r'],
        changes: {
          deleteChange: { result: { word: 'at' } },
          replaceChanges: [
            { letter: 'b', result: { word: 'bat' } },
            { letter: 'h', result: { word: 'hat' } },
            { letter: 'r', result: { word: 'rat' } }
          ]
        }
      },
      wordInteraction: currentWord,
      isReplaceMenuOpen: false
    };

    // Add the letterInteraction to the currentWord for circular reference
    currentWord.letterInteractions = [letterInteraction];
  });

  it('renders a letter with its value', () => {
    const { container } = render(<LetterView letterInteraction={letterInteraction} />);
    expect(container.textContent).toContain('c'); // First letter of 'cat'
  });

  it('shows delete icon when letter can be deleted', () => {
    // Use the first letter of 'cat', which should be deletable to get 'at'
    const { container } = render(<LetterView letterInteraction={letterInteraction} />);

    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    expect(deleteButton).toBeInTheDocument();
  });

  it('shows replace icon when letter has replacements', () => {
    // First letter of 'cat' should be replaceable with 'b', 'h', 'r', etc.
    const { container } = render(<LetterView letterInteraction={letterInteraction} />);

    const replaceButton = container.querySelector('.replace-icon:not(.hidden)');
    expect(replaceButton).toBeInTheDocument();
  });

  it('calls toggleMenu when replace icon is clicked', () => {
    const { container } = render(<LetterView letterInteraction={letterInteraction} />);

    const replaceButton = container.querySelector('.replace-icon:not(.hidden)');
    if (replaceButton) fireEvent.click(replaceButton);

    expect(appState.toggleMenu).toHaveBeenCalledWith(false, expect.any(Function), expect.anything());
  });

  it('calls setNewWord when delete icon is clicked', () => {
    const { container } = render(<LetterView letterInteraction={letterInteraction} />);

    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    if (deleteButton) fireEvent.click(deleteButton);

    // Should call setNewWord with a Word object, but we can only check if it was called
    expect(appState.setNewWord).toHaveBeenCalled();
  });

  it('handles a letter interaction with an open replace menu', () => {
    // Create a letter interaction with an open menu
    letterInteraction.isReplaceMenuOpen = true;

    // Force the letter to have some replace changes for the menu
    if (!letterInteraction.letter.changes || !letterInteraction.letter.changes.replaceChanges) {
      // This is a safety check, but in reality the letter should have replace changes
      throw new Error('Test Letter does not have expected replace changes');
    }

    const { getByTestId } = render(<LetterView letterInteraction={letterInteraction} />);

    // The letter choice menu should be rendered
    expect(getByTestId('letter-choice-menu')).toBeInTheDocument();
  });

  it('calls setNewWord when a letter choice is selected', () => {
    // Open the replace menu
    letterInteraction.isReplaceMenuOpen = true;

    const { getAllByTestId } = render(<LetterView letterInteraction={letterInteraction} />);

    // Get the letter choice options
    const letterOptions = getAllByTestId('letter-choice-option');

    // Should be at least one letter option (like 'b' to change 'cat' to 'bat')
    expect(letterOptions.length).toBeGreaterThan(0);

    // Click the first option
    fireEvent.click(letterOptions[0]);

    // Should call setNewWord with a Word object
    expect(appState.setNewWord).toHaveBeenCalled();
  });
});
