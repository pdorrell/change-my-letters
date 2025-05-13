import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { LetterView } from '../../src/views/LetterView';
import { Letter } from '../../src/models/Letter';
import { CurrentWord } from '../../src/models/CurrentWord';

// Mock MobX's observer
jest.mock('mobx-react-lite', () => ({
  observer: (component: React.FC) => component,
}));

// Mock the LetterChoiceMenu component
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

// Create mock appState
const mockAppState = {
  openMenu: jest.fn(),
  closeAllMenus: jest.fn(),
  deleteLetter: jest.fn(),
  changeLetterCase: jest.fn(),
  replaceLetter: jest.fn(),
};

// Mock CurrentWord model
jest.mock('../../src/models/CurrentWord', () => {
  return {
    CurrentWord: jest.fn().mockImplementation(() => ({
      appState: mockAppState
    }))
  };
});

// Mock the Letter class
jest.mock('../../src/models/Letter', () => {
  const mockWord = {
    appState: mockAppState
  };

  return {
    Letter: jest.fn().mockImplementation((value, position) => ({
      value,
      position,
      word: mockWord,
      canDelete: true,
      canReplace: true,
      canUpperCase: false,
      canLowerCase: false,
      isReplaceMenuOpen: false,
      replacements: []
    }))
  };
});

describe('LetterView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a letter with its value', () => {
    const letter = new Letter('a', 0);
    const { getByText } = render(<LetterView letter={letter} />);

    expect(getByText('a')).toBeInTheDocument();
  });
  
  it('shows delete icon when letter can be deleted', () => {
    const letter = new Letter('a', 0);
    letter.canDelete = true;
    const { container } = render(<LetterView letter={letter} />);
    
    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    expect(deleteButton).toBeInTheDocument();
  });
  
  it('hides delete icon when letter cannot be deleted', () => {
    const letter = new Letter('a', 0);
    letter.canDelete = false;
    const { container } = render(<LetterView letter={letter} />);
    
    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    expect(deleteButton).not.toBeInTheDocument();
  });
  
  it('shows replace icon when letter has replacements', () => {
    const letter = new Letter('a', 0);
    letter.canReplace = true;
    const { container } = render(<LetterView letter={letter} />);
    
    const replaceButton = container.querySelector('.replace-icon:not(.hidden)');
    expect(replaceButton).toBeInTheDocument();
  });
  
  it('shows letter choice menu when replace menu is open', () => {
    const letter = new Letter('a', 0);
    letter.isReplaceMenuOpen = true;
    letter.replacements = ['b', 'c'];
    
    const { getByTestId } = render(<LetterView letter={letter} />);
    
    expect(getByTestId('letter-choice-menu')).toBeInTheDocument();
  });
  
  it('calls deleteLetter when delete icon is clicked', () => {
    const letter = new Letter('a', 0);
    letter.canDelete = true;
    
    const { container } = render(<LetterView letter={letter} />);
    
    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    if (deleteButton) fireEvent.click(deleteButton);
    
    expect(mockAppState.deleteLetter).toHaveBeenCalledWith(0);
  });
  
  it('calls openMenu when replace icon is clicked', () => {
    const letter = new Letter('a', 0);
    letter.canReplace = true;
    
    const { container } = render(<LetterView letter={letter} />);
    
    const replaceButton = container.querySelector('.replace-icon:not(.hidden)');
    if (replaceButton) fireEvent.click(replaceButton);
    
    expect(mockAppState.openMenu).toHaveBeenCalledWith('replace', 0, expect.anything());
  });
  
  it('shows uppercase icon when letter can be uppercased', () => {
    const letter = new Letter('a', 0);
    letter.canUpperCase = true;
    letter.canLowerCase = false;
    
    const { container } = render(<LetterView letter={letter} />);
    
    const uppercaseButton = container.querySelector('button.case-icon[title="Make uppercase"]:not(.hidden)');
    expect(uppercaseButton).toBeInTheDocument();
  });
  
  it('shows lowercase icon when letter can be lowercased', () => {
    const letter = new Letter('A', 0);
    letter.canUpperCase = false;
    letter.canLowerCase = true;
    
    const { container } = render(<LetterView letter={letter} />);
    
    const lowercaseButton = container.querySelector('button.case-icon[title="Make lowercase"]:not(.hidden)');
    expect(lowercaseButton).toBeInTheDocument();
  });
  
  it('calls changeLetterCase with correct parameters when case icons are clicked', () => {
    // Test uppercase icon
    const letter1 = new Letter('a', 0);
    letter1.canUpperCase = true;
    letter1.canLowerCase = false;
    
    const { container: container1 } = render(<LetterView letter={letter1} />);
    
    const uppercaseButton = container1.querySelector('button.case-icon[title="Make uppercase"]:not(.hidden)');
    if (uppercaseButton) fireEvent.click(uppercaseButton);
    
    expect(mockAppState.changeLetterCase).toHaveBeenCalledWith(0, true);
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Test lowercase icon
    const letter2 = new Letter('A', 0);
    letter2.canUpperCase = false;
    letter2.canLowerCase = true;
    
    const { container: container2 } = render(<LetterView letter={letter2} />);
    
    const lowercaseButton = container2.querySelector('button.case-icon[title="Make lowercase"]:not(.hidden)');
    if (lowercaseButton) fireEvent.click(lowercaseButton);
    
    expect(mockAppState.changeLetterCase).toHaveBeenCalledWith(0, false);
  });
  
  it('calls replaceLetter when a letter choice is selected', () => {
    const letter = new Letter('a', 0);
    letter.isReplaceMenuOpen = true;
    letter.replacements = ['b', 'c'];
    
    const { getAllByTestId } = render(<LetterView letter={letter} />);
    
    const letterOptions = getAllByTestId('letter-choice-option');
    fireEvent.click(letterOptions[0]);
    
    expect(mockAppState.replaceLetter).toHaveBeenCalledWith(0, 'b');
    expect(mockAppState.closeAllMenus).toHaveBeenCalled();
  });
});