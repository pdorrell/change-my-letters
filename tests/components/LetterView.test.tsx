import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { LetterView } from '../../src/views/LetterView';
import { Letter } from '../../src/models/Letter';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { AppState } from '../../src/models/AppState';
import { WordGraphNode } from '../../src/models/WordGraphNode';
import { Position } from '../../src/models/Position';

// Mock MobX's observer
jest.mock('mobx-react-lite', () => ({
  observer: (component: React.FC) => component,
}));

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

// Mock WordGraphNode for testing
class MockWordGraphNode {
  word: string;
  deletes: boolean[];
  inserts: string[];
  replaces: string[];
  _letters: Letter[] | null = null;
  _positions: Position[] | null = null;
  
  constructor(word: string) {
    this.word = word;
    this.deletes = Array(word.length).fill(true);
    this.inserts = Array(word.length + 1).fill('aeiou');
    this.replaces = Array(word.length).fill('bcdfghjklmnpqrstvwxyz');
  }
  
  get letters(): Letter[] {
    if (!this._letters) {
      this._letters = Array.from(this.word).map(
        (letter, index) => new Letter(this as unknown as WordGraphNode, letter, index)
      );
    }
    return this._letters;
  }
  
  get positions(): Position[] {
    if (!this._positions) {
      this._positions = Array(this.word.length + 1)
        .fill(0)
        .map((_, index) => new Position(this as unknown as WordGraphNode, index));
    }
    return this._positions;
  }
  
  canDelete(position: number): boolean {
    return this.deletes[position];
  }
  
  getInsertions(position: number): string {
    return this.inserts[position];
  }
  
  getReplacements(position: number): string {
    return this.replaces[position];
  }
  
  getPossibleInsertions(position: number): string[] {
    return this.inserts[position]?.split('') || [];
  }
  
  getPossibleReplacements(position: number): string[] {
    return this.replaces[position]?.split('') || [];
  }
  
  // Case-related methods have been removed
  
  get possibleNextWords(): string[] {
    return ['bat', 'cat', 'dat', 'fat', 'rat', 'test'];
  }
}

describe('LetterView', () => {
  let appState: AppState;
  let currentWord: WordInteraction;
  let letter: Letter;
  
  beforeEach(() => {
    // Create mock AppState
    appState = {
      openMenu: jest.fn(),
      closeAllMenus: jest.fn(),
      setNewWord: jest.fn(),
      navigateTo: jest.fn(),
      history: { hasVisited: () => false },
    } as unknown as AppState;
    
    // Create a WordInteraction with our mocked AppState
    const node = new MockWordGraphNode('test') as unknown as WordGraphNode;
    currentWord = new WordInteraction(node, appState, false);
    
    // Get a Letter from the currentWord
    letter = currentWord.letters[0];
  });

  it('renders a letter with its value', () => {
    const letterInteraction = currentWord.letterInteractions[0];
    const { getByText } = render(<LetterView letterInteraction={letterInteraction} />);
    expect(getByText('t')).toBeInTheDocument();
  });
  
  it('shows delete icon when letter can be deleted', () => {
    // Mock a letter directly to avoid the computed property issue
    const mockLetter = {
      value: 't',
      position: 0,
      canDelete: true,
      canReplace: true,
      replacements: ['a', 'b', 'c'],
      changes: {
        deleteChange: { result: { word: 'est' } },
        replaceChanges: [
          { letter: 'a', result: { word: 'aest' } },
          { letter: 'b', result: { word: 'best' } },
          { letter: 'c', result: { word: 'cest' } }
        ]
      }
    };
    
    // Create a mock letter interaction
    const mockLetterInteraction = {
      letter: mockLetter,
      wordInteraction: currentWord,
      isReplaceMenuOpen: false,
      toggleReplaceMenu: jest.fn()
    };
    
    const { container } = render(<LetterView letterInteraction={mockLetterInteraction as any} />);
    
    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    expect(deleteButton).toBeInTheDocument();
  });
  
  it('hides delete icon when letter cannot be deleted', () => {
    // Mock a letter directly to avoid the computed property issue
    const mockLetter = {
      value: 't',
      position: 0,
      canDelete: false,
      canReplace: true,
      replacements: ['a', 'b', 'c'],
      changes: {
        deleteChange: null,
        replaceChanges: [
          { letter: 'a', result: { word: 'aest' } },
          { letter: 'b', result: { word: 'best' } },
          { letter: 'c', result: { word: 'cest' } }
        ]
      }
    };
    
    // Create a mock letter interaction
    const mockLetterInteraction = {
      letter: mockLetter,
      wordInteraction: currentWord,
      isReplaceMenuOpen: false,
      toggleReplaceMenu: jest.fn()
    };
    
    const { container } = render(<LetterView letterInteraction={mockLetterInteraction as any} />);
    
    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    expect(deleteButton).not.toBeInTheDocument();
  });
  
  it('shows replace icon when letter has replacements', () => {
    // Mock a letter directly to avoid the computed property issue
    const mockLetter = {
      value: 't',
      position: 0,
      canDelete: true,
      canReplace: true,
      replacements: ['a', 'b', 'c'],
      changes: {
        deleteChange: { result: { word: 'est' } },
        replaceChanges: [
          { letter: 'a', result: { word: 'aest' } },
          { letter: 'b', result: { word: 'best' } },
          { letter: 'c', result: { word: 'cest' } }
        ]
      }
    };
    
    // Create a mock letter interaction
    const mockLetterInteraction = {
      letter: mockLetter,
      wordInteraction: currentWord,
      isReplaceMenuOpen: false,
      toggleReplaceMenu: jest.fn()
    };
    
    const { container } = render(<LetterView letterInteraction={mockLetterInteraction as any} />);
    
    const replaceButton = container.querySelector('.replace-icon:not(.hidden)');
    expect(replaceButton).toBeInTheDocument();
  });
  
  it('shows letter choice menu when replace menu is open', () => {
    // Mock a letter directly to avoid the computed property issue
    const mockLetter = {
      value: 't',
      position: 0,
      canDelete: true,
      canReplace: true,
      replacements: ['a', 'b', 'c'],
      changes: {
        deleteChange: { result: { word: 'est' } },
        replaceChanges: [
          { letter: 'a', result: { word: 'aest' } },
          { letter: 'b', result: { word: 'best' } },
          { letter: 'c', result: { word: 'cest' } }
        ]
      }
    };
    
    // Create a mock letter interaction with open menu
    const mockLetterInteraction = {
      letter: mockLetter,
      wordInteraction: currentWord,
      isReplaceMenuOpen: true,
      toggleReplaceMenu: jest.fn()
    };
    
    const { getByTestId } = render(<LetterView letterInteraction={mockLetterInteraction as any} />);
    
    expect(getByTestId('letter-choice-menu')).toBeInTheDocument();
  });
  
  it('calls setNewWord when delete icon is clicked', () => {
    // Mock a letter with canDelete = true
    const mockLetter = {
      value: 't',
      position: 0,
      canDelete: true,
      canReplace: true,
      replacements: ['a', 'b', 'c'],
      changes: {
        deleteChange: { result: { word: 'est' } },
        replaceChanges: [
          { letter: 'a', result: { word: 'aest' } },
          { letter: 'b', result: { word: 'best' } },
          { letter: 'c', result: { word: 'cest' } }
        ]
      }
    };
    
    // Create a mock letter interaction
    const mockLetterInteraction = {
      letter: mockLetter,
      wordInteraction: currentWord,
      isReplaceMenuOpen: false,
      toggleReplaceMenu: jest.fn()
    };
    
    const { container } = render(<LetterView letterInteraction={mockLetterInteraction as any} />);
    
    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    if (deleteButton) fireEvent.click(deleteButton);
    
    expect(appState.setNewWord).toHaveBeenCalledWith({ word: 'est' });
  });
  
  it('calls openMenu when replace icon is clicked', () => {
    // Mock a letter with canReplace = true
    const mockLetter = {
      value: 't',
      position: 0,
      canDelete: true,
      canReplace: true,
      replacements: ['a', 'b', 'c']
    };
    
    // Create a mock letter interaction
    const mockLetterInteraction = {
      letter: mockLetter,
      wordInteraction: currentWord,
      isReplaceMenuOpen: false,
      toggleReplaceMenu: jest.fn()
    };
    
    const { container } = render(<LetterView letterInteraction={mockLetterInteraction as any} />);
    
    const replaceButton = container.querySelector('.replace-icon:not(.hidden)');
    if (replaceButton) fireEvent.click(replaceButton);
    
    expect(appState.openMenu).toHaveBeenCalledWith('replace', 0, expect.anything());
  });
  
  // Case-related tests have been removed
  
  it('calls setNewWord when a letter choice is selected', () => {
    // Mock a letter with replacements
    const mockLetter = {
      value: 't',
      position: 0,
      canDelete: true,
      canReplace: true,
      replacements: ['b', 'c', 'd'],
      changes: {
        deleteChange: { result: { word: 'est' } },
        replaceChanges: [
          { letter: 'b', result: { word: 'best' } },
          { letter: 'c', result: { word: 'cest' } },
          { letter: 'd', result: { word: 'dest' } }
        ]
      }
    };
    
    // Create a mock letter interaction with open menu
    const mockLetterInteraction = {
      letter: mockLetter,
      wordInteraction: currentWord,
      isReplaceMenuOpen: true,
      toggleReplaceMenu: jest.fn()
    };
    
    const { getAllByTestId } = render(<LetterView letterInteraction={mockLetterInteraction as any} />);
    
    const letterOptions = getAllByTestId('letter-choice-option');
    fireEvent.click(letterOptions[0]);
    
    expect(appState.setNewWord).toHaveBeenCalledWith({ word: 'best' });
    // closeAllMenus is now called within setNewWord
  });
});