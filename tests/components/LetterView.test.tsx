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
class MockWordGraphNode {
  word: string;
  deletes: boolean[];
  inserts: string[];
  replaces: string[];
  uppercase: boolean[];
  lowercase: boolean[];
  _letters: Letter[] | null = null;
  _positions: Position[] | null = null;
  
  constructor(word: string) {
    this.word = word;
    this.deletes = Array(word.length).fill(true);
    this.inserts = Array(word.length + 1).fill('aeiou');
    this.replaces = Array(word.length).fill('bcdfghjklmnpqrstvwxyz');
    this.uppercase = Array(word.length).fill(true);
    this.lowercase = Array(word.length).fill(true);
  }
  
  getLetters(): Letter[] {
    if (!this._letters) {
      this._letters = Array.from(this.word).map(
        (letter, index) => new Letter(this as unknown as WordGraphNode, letter, index)
      );
    }
    return this._letters;
  }
  
  getPositions(): Position[] {
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
  
  canUppercase(position: number): boolean {
    return this.uppercase[position];
  }
  
  canLowercase(position: number): boolean {
    return this.lowercase[position];
  }
  
  canChangeCaseAt(position: number): boolean {
    return this.uppercase[position] || this.lowercase[position];
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
      deleteLetter: jest.fn(),
      changeLetterCase: jest.fn(),
      replaceLetter: jest.fn(),
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
    const letterInteraction = currentWord.letterInteractions[0];
    letter.canDelete = true;
    
    const { container } = render(<LetterView letterInteraction={letterInteraction} />);
    
    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    expect(deleteButton).toBeInTheDocument();
  });
  
  it('hides delete icon when letter cannot be deleted', () => {
    const letterInteraction = currentWord.letterInteractions[0];
    letter.canDelete = false;
    
    const { container } = render(<LetterView letterInteraction={letterInteraction} />);
    
    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    expect(deleteButton).not.toBeInTheDocument();
  });
  
  it('shows replace icon when letter has replacements', () => {
    const letterInteraction = currentWord.letterInteractions[0];
    letter.canReplace = true;
    
    const { container } = render(<LetterView letterInteraction={letterInteraction} />);
    
    const replaceButton = container.querySelector('.replace-icon:not(.hidden)');
    expect(replaceButton).toBeInTheDocument();
  });
  
  it('shows letter choice menu when replace menu is open', () => {
    const letterInteraction = currentWord.letterInteractions[0];
    letterInteraction.isReplaceMenuOpen = true;
    
    const { getByTestId } = render(<LetterView letterInteraction={letterInteraction} />);
    
    expect(getByTestId('letter-choice-menu')).toBeInTheDocument();
  });
  
  it('calls deleteLetter when delete icon is clicked', () => {
    const letterInteraction = currentWord.letterInteractions[0];
    letter.canDelete = true;
    
    const { container } = render(<LetterView letterInteraction={letterInteraction} />);
    
    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    if (deleteButton) fireEvent.click(deleteButton);
    
    expect(appState.deleteLetter).toHaveBeenCalledWith(0);
  });
  
  it('calls openMenu when replace icon is clicked', () => {
    const letterInteraction = currentWord.letterInteractions[0];
    letter.canReplace = true;
    
    const { container } = render(<LetterView letterInteraction={letterInteraction} />);
    
    const replaceButton = container.querySelector('.replace-icon:not(.hidden)');
    if (replaceButton) fireEvent.click(replaceButton);
    
    expect(appState.openMenu).toHaveBeenCalledWith('replace', 0, expect.anything());
  });
  
  it('shows uppercase icon when letter can be uppercased', () => {
    const letterInteraction = currentWord.letterInteractions[0];
    letter.canUpperCase = true;
    letter.canLowerCase = false;
    
    const { container } = render(<LetterView letterInteraction={letterInteraction} />);
    
    const uppercaseButton = container.querySelector('button.case-icon[title="Make uppercase"]:not(.hidden)');
    expect(uppercaseButton).toBeInTheDocument();
  });
  
  it('shows lowercase icon when letter can be lowercased', () => {
    const letterInteraction = currentWord.letterInteractions[0];
    letter.canUpperCase = false;
    letter.canLowerCase = true;
    
    const { container } = render(<LetterView letterInteraction={letterInteraction} />);
    
    const lowercaseButton = container.querySelector('button.case-icon[title="Make lowercase"]:not(.hidden)');
    expect(lowercaseButton).toBeInTheDocument();
  });
  
  it('calls changeLetterCase with correct parameters when case icons are clicked', () => {
    // Test uppercase icon
    const letterInteraction = currentWord.letterInteractions[0];
    letter.canUpperCase = true;
    letter.canLowerCase = false;
    
    const { container: container1 } = render(<LetterView letterInteraction={letterInteraction} />);
    
    const uppercaseButton = container1.querySelector('button.case-icon[title="Make uppercase"]:not(.hidden)');
    if (uppercaseButton) fireEvent.click(uppercaseButton);
    
    expect(appState.changeLetterCase).toHaveBeenCalledWith(0, true);
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Test lowercase icon - use the same letterInteraction but change the flags
    letter.canUpperCase = false;
    letter.canLowerCase = true;
    
    const { container: container2 } = render(<LetterView letterInteraction={letterInteraction} />);
    
    const lowercaseButton = container2.querySelector('button.case-icon[title="Make lowercase"]:not(.hidden)');
    if (lowercaseButton) fireEvent.click(lowercaseButton);
    
    expect(appState.changeLetterCase).toHaveBeenCalledWith(0, false);
  });
  
  it('calls replaceLetter when a letter choice is selected', () => {
    const letterInteraction = currentWord.letterInteractions[0];
    letterInteraction.isReplaceMenuOpen = true;
    
    const { getAllByTestId } = render(<LetterView letterInteraction={letterInteraction} />);
    
    const letterOptions = getAllByTestId('letter-choice-option');
    fireEvent.click(letterOptions[0]);
    
    expect(appState.replaceLetter).toHaveBeenCalledWith(0, 'b');
    expect(appState.closeAllMenus).toHaveBeenCalled();
  });
});