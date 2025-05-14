import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { LetterView } from '../../src/views/LetterView';
import { Letter } from '../../src/models/Letter';
import { CurrentWord } from '../../src/models/CurrentWord';
import { AppState } from '../../src/models/AppState';

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

describe('LetterView', () => {
  let appState: AppState;
  let currentWord: CurrentWord;
  let letter: Letter;
  
  beforeEach(() => {
    // Create real instances but spy on the methods we want to test
    appState = new AppState();
    
    // Spy on AppState methods
    appState.openMenu = jest.fn();
    appState.closeAllMenus = jest.fn();
    appState.deleteLetter = jest.fn();
    appState.changeLetterCase = jest.fn();
    appState.replaceLetter = jest.fn();
    
    // Create a CurrentWord with our AppState
    currentWord = new CurrentWord('test', appState);
    
    // Create a Letter with default settings for tests
    letter = new Letter(currentWord, 'a', 0);
    letter.canDelete = true;
    letter.canReplace = true;
    letter.replacements = ['b', 'c', 'd'];
  });

  it('renders a letter with its value', () => {
    const { getByText } = render(<LetterView letter={letter} />);
    expect(getByText('a')).toBeInTheDocument();
  });
  
  it('shows delete icon when letter can be deleted', () => {
    letter.canDelete = true;
    const { container } = render(<LetterView letter={letter} />);
    
    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    expect(deleteButton).toBeInTheDocument();
  });
  
  it('hides delete icon when letter cannot be deleted', () => {
    letter.canDelete = false;
    const { container } = render(<LetterView letter={letter} />);
    
    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    expect(deleteButton).not.toBeInTheDocument();
  });
  
  it('shows replace icon when letter has replacements', () => {
    letter.canReplace = true;
    const { container } = render(<LetterView letter={letter} />);
    
    const replaceButton = container.querySelector('.replace-icon:not(.hidden)');
    expect(replaceButton).toBeInTheDocument();
  });
  
  it('shows letter choice menu when replace menu is open', () => {
    letter.isReplaceMenuOpen = true;
    
    const { getByTestId } = render(<LetterView letter={letter} />);
    
    expect(getByTestId('letter-choice-menu')).toBeInTheDocument();
  });
  
  it('calls deleteLetter when delete icon is clicked', () => {
    letter.canDelete = true;
    
    const { container } = render(<LetterView letter={letter} />);
    
    const deleteButton = container.querySelector('.delete-icon:not(.hidden)');
    if (deleteButton) fireEvent.click(deleteButton);
    
    expect(appState.deleteLetter).toHaveBeenCalledWith(0);
  });
  
  it('calls openMenu when replace icon is clicked', () => {
    letter.canReplace = true;
    
    const { container } = render(<LetterView letter={letter} />);
    
    const replaceButton = container.querySelector('.replace-icon:not(.hidden)');
    if (replaceButton) fireEvent.click(replaceButton);
    
    expect(appState.openMenu).toHaveBeenCalledWith('replace', 0, expect.anything());
  });
  
  it('shows uppercase icon when letter can be uppercased', () => {
    letter.canUpperCase = true;
    letter.canLowerCase = false;
    
    const { container } = render(<LetterView letter={letter} />);
    
    const uppercaseButton = container.querySelector('button.case-icon[title="Make uppercase"]:not(.hidden)');
    expect(uppercaseButton).toBeInTheDocument();
  });
  
  it('shows lowercase icon when letter can be lowercased', () => {
    const letterUpperCase = new Letter(currentWord, 'A', 0);
    letterUpperCase.canUpperCase = false;
    letterUpperCase.canLowerCase = true;
    
    const { container } = render(<LetterView letter={letterUpperCase} />);
    
    const lowercaseButton = container.querySelector('button.case-icon[title="Make lowercase"]:not(.hidden)');
    expect(lowercaseButton).toBeInTheDocument();
  });
  
  it('calls changeLetterCase with correct parameters when case icons are clicked', () => {
    // Test uppercase icon
    letter.canUpperCase = true;
    letter.canLowerCase = false;
    
    const { container: container1 } = render(<LetterView letter={letter} />);
    
    const uppercaseButton = container1.querySelector('button.case-icon[title="Make uppercase"]:not(.hidden)');
    if (uppercaseButton) fireEvent.click(uppercaseButton);
    
    expect(appState.changeLetterCase).toHaveBeenCalledWith(0, true);
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Test lowercase icon
    const letterUpperCase = new Letter(currentWord, 'A', 0);
    letterUpperCase.canUpperCase = false;
    letterUpperCase.canLowerCase = true;
    
    const { container: container2 } = render(<LetterView letter={letterUpperCase} />);
    
    const lowercaseButton = container2.querySelector('button.case-icon[title="Make lowercase"]:not(.hidden)');
    if (lowercaseButton) fireEvent.click(lowercaseButton);
    
    expect(appState.changeLetterCase).toHaveBeenCalledWith(0, false);
  });
  
  it('calls replaceLetter when a letter choice is selected', () => {
    letter.isReplaceMenuOpen = true;
    
    const { getAllByTestId } = render(<LetterView letter={letter} />);
    
    const letterOptions = getAllByTestId('letter-choice-option');
    fireEvent.click(letterOptions[0]);
    
    expect(appState.replaceLetter).toHaveBeenCalledWith(0, 'b');
    expect(appState.closeAllMenus).toHaveBeenCalled();
  });
});