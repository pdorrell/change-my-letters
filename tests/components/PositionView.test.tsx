import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { PositionView } from '../../src/views/PositionView';
import { Position } from '../../src/models/Position';
import { CurrentWord } from '../../src/models/CurrentWord';
import { AppState } from '../../src/models/AppState';
import { WordGraphNode } from '../../src/models/WordGraphNode';

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
  
  constructor(word: string) {
    this.word = word;
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
}

describe('PositionView', () => {
  let appState: AppState;
  let currentWord: CurrentWord;
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
    
    // Create a CurrentWord with our mock WordGraphNode and AppState
    currentWord = new CurrentWord(node, appState, false);
    
    // Create a Position with default settings for tests
    position = new Position(currentWord, 0);
    position.canInsert = true;
    position.insertOptions = ['a', 'e', 'i', 'o', 'u'];
  });

  it('renders without insert icon when insertion is not possible', () => {
    position.canInsert = false;
    
    const { container } = render(<PositionView position={position} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    expect(insertButton).not.toBeInTheDocument();
  });
  
  it('shows insert icon when insertion is possible', () => {
    position.canInsert = true;
    
    const { container } = render(<PositionView position={position} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    expect(insertButton).toBeInTheDocument();
  });
  
  it('shows letter choice menu when insert menu is open', () => {
    position.isInsertMenuOpen = true;
    
    const { getByTestId } = render(<PositionView position={position} />);
    
    expect(getByTestId('letter-choice-menu')).toBeInTheDocument();
  });
  
  it('calls openMenu when insert icon is clicked', () => {
    position.canInsert = true;
    
    const { container } = render(<PositionView position={position} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    if (insertButton) fireEvent.click(insertButton);
    
    expect(appState.openMenu).toHaveBeenCalledWith('insert', 0, expect.anything());
  });
  
  it('calls insertLetter when a letter choice is selected', () => {
    position.isInsertMenuOpen = true;
    
    const { getAllByTestId } = render(<PositionView position={position} />);
    
    const letterOptions = getAllByTestId('letter-choice-option');
    fireEvent.click(letterOptions[0]);
    
    expect(appState.insertLetter).toHaveBeenCalledWith(0, 'a');
    expect(appState.closeAllMenus).toHaveBeenCalled();
  });
});