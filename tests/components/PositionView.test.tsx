import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { PositionView } from '../../src/views/PositionView';
import { Position } from '../../src/models/Position';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { AppState } from '../../src/models/AppState';
import { WordGraphNode } from '../../src/models/WordGraphNode';
import { Letter } from '../../src/models/Letter';

// Mock MobX's observer
jest.mock('mobx-react-lite', () => ({
  observer: (component: React.FC) => component,
}));

// Mock the LetterChoiceMenu component only (not the model classes)
jest.mock('../../src/views/CurrentWordView', () => ({
  LetterChoiceMenu: ({ options, onSelect }: { options: string[], onSelect: (letter: string) => void }) => (
    <div data-testid="letter-choice-menu">
      {options.map((letter, index) => (
        <div key={index} data-testid="letter-choice-option" onClick={() => onSelect(letter)}>
          {letter}
        </div>
      ))}
    </div>
  ),
}));

// Mock WordGraphNode for testing
class MockWordGraphNode implements Partial<WordGraphNode> {
  word: string;
  _letters: Letter[] | null = null;
  _positions: Position[] | null = null;
  deletes: boolean[];
  inserts: string[];
  replaces: string[];
  uppercase: boolean[];
  lowercase: boolean[];
  
  constructor(word: string) {
    this.word = word;
    this.deletes = Array(word.length).fill(true);
    this.inserts = Array(word.length + 1).fill('aeiou');
    this.replaces = Array(word.length).fill('bcdfg');
    this.uppercase = Array(word.length).fill(false);
    this.lowercase = Array(word.length).fill(false);
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
  
  getPossibleInsertions(position: number): string[] {
    return ['a', 'e', 'i', 'o', 'u'];
  }
  
  getPossibleReplacements(position: number): string[] {
    return ['b', 'c', 'd', 'f', 'g'];
  }
  
  canDelete(position: number): boolean {
    return true;
  }
  
  canChangeCaseAt(position: number): boolean {
    return false;
  }
  
  getInsertions(position: number): string {
    return 'aeiou';
  }
  
  getReplacements(position: number): string {
    return 'bcdfg';
  }
  
  canUppercase(position: number): boolean {
    return false;
  }
  
  canLowercase(position: number): boolean {
    return false;
  }
  
  get possibleNextWords(): string[] {
    return ['bat', 'cat', 'dat', 'fat', 'rat', 'test'];
  }
}

describe('PositionView', () => {
  let appState: AppState;
  let currentWord: WordInteraction;
  let position: Position;
  
  beforeEach(() => {
    // Create mock AppState with spies for the methods we want to test
    appState = {
      openMenu: jest.fn(),
      closeAllMenus: jest.fn(),
      insertLetter: jest.fn(),
    } as unknown as AppState;
    
    // Create a mock WordGraphNode for our tests
    const node = new MockWordGraphNode('test') as unknown as WordGraphNode;
    
    // Create a WordInteraction with our mock WordGraphNode and AppState
    currentWord = new WordInteraction(node, appState, false);
    
    // Get the position from the currentWord
    position = currentWord.positions[0];
  });

  it('renders without insert icon when insertion is not possible', () => {
    // Create a custom mock position and positionInteraction
    const mockPosition = {
      index: 0,
      canInsert: false,
      insertOptions: []
    };
    
    const mockPositionInteraction = {
      position: mockPosition,
      wordInteraction: currentWord,
      isInsertMenuOpen: false,
      toggleInsertMenu: jest.fn()
    };
    
    const { container } = render(<PositionView positionInteraction={mockPositionInteraction as any} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    expect(insertButton).not.toBeInTheDocument();
  });
  
  it('shows insert icon when insertion is possible', () => {
    // Create a custom mock position and positionInteraction
    const mockPosition = {
      index: 0,
      canInsert: true,
      insertOptions: ['a', 'e', 'i', 'o', 'u']
    };
    
    const mockPositionInteraction = {
      position: mockPosition,
      wordInteraction: currentWord,
      isInsertMenuOpen: false,
      toggleInsertMenu: jest.fn()
    };
    
    const { container } = render(<PositionView positionInteraction={mockPositionInteraction as any} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    expect(insertButton).toBeInTheDocument();
  });
  
  it('shows letter choice menu when insert menu is open', () => {
    // Create a custom mock position and positionInteraction with open menu
    const mockPosition = {
      index: 0,
      canInsert: true,
      insertOptions: ['a', 'e', 'i', 'o', 'u']
    };
    
    const mockPositionInteraction = {
      position: mockPosition,
      wordInteraction: currentWord,
      isInsertMenuOpen: true,
      toggleInsertMenu: jest.fn()
    };
    
    const { getByTestId } = render(<PositionView positionInteraction={mockPositionInteraction as any} />);
    
    expect(getByTestId('letter-choice-menu')).toBeInTheDocument();
  });
  
  it('calls openMenu when insert icon is clicked', () => {
    // Create a custom mock position and positionInteraction
    const mockPosition = {
      index: 0,
      canInsert: true,
      insertOptions: ['a', 'e', 'i', 'o', 'u']
    };
    
    const mockPositionInteraction = {
      position: mockPosition,
      wordInteraction: currentWord,
      isInsertMenuOpen: false,
      toggleInsertMenu: jest.fn()
    };
    
    const { container } = render(<PositionView positionInteraction={mockPositionInteraction as any} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    if (insertButton) fireEvent.click(insertButton);
    
    expect(appState.openMenu).toHaveBeenCalledWith('insert', 0, expect.anything());
  });
  
  it('calls insertLetter when a letter choice is selected', () => {
    // Create a custom mock position and positionInteraction with open menu
    const mockPosition = {
      index: 0,
      canInsert: true,
      insertOptions: ['a', 'e', 'i', 'o', 'u']
    };
    
    const mockPositionInteraction = {
      position: mockPosition,
      wordInteraction: currentWord,
      isInsertMenuOpen: true,
      toggleInsertMenu: jest.fn()
    };
    
    const { getAllByTestId } = render(<PositionView positionInteraction={mockPositionInteraction as any} />);
    
    const letterOptions = getAllByTestId('letter-choice-option');
    fireEvent.click(letterOptions[0]);
    
    expect(appState.insertLetter).toHaveBeenCalledWith(0, 'a');
    expect(appState.closeAllMenus).toHaveBeenCalled();
  });
});