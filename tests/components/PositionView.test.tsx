import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { PositionView } from '../../src/views/PositionView';
import { Position } from '../../src/models/Position';

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

// Mock the App context
const mockAppState = {
  openMenu: jest.fn(),
  closeAllMenus: jest.fn(),
  insertLetter: jest.fn(),
};

jest.mock('../../src/App', () => ({
  getAppState: () => mockAppState,
}));

describe('PositionView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without insert icon when insertion is not possible', () => {
    const position = new Position(0);
    position.canInsert = false;
    
    const { container } = render(<PositionView position={position} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    expect(insertButton).not.toBeInTheDocument();
  });
  
  it('shows insert icon when insertion is possible', () => {
    const position = new Position(0);
    position.canInsert = true;
    
    const { container } = render(<PositionView position={position} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    expect(insertButton).toBeInTheDocument();
  });
  
  it('shows letter choice menu when insert menu is open', () => {
    const position = new Position(0);
    position.isInsertMenuOpen = true;
    position.insertOptions = ['a', 'b'];
    
    const { getByTestId } = render(<PositionView position={position} />);
    
    expect(getByTestId('letter-choice-menu')).toBeInTheDocument();
  });
  
  it('calls openMenu when insert icon is clicked', () => {
    const position = new Position(0);
    position.canInsert = true;
    
    const { container } = render(<PositionView position={position} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    if (insertButton) fireEvent.click(insertButton);
    
    expect(mockAppState.openMenu).toHaveBeenCalledWith('insert', 0, expect.anything());
  });
  
  it('calls insertLetter when a letter choice is selected', () => {
    const position = new Position(0);
    position.isInsertMenuOpen = true;
    position.insertOptions = ['a', 'b'];
    
    const { getAllByTestId } = render(<PositionView position={position} />);
    
    const letterOptions = getAllByTestId('letter-choice-option');
    fireEvent.click(letterOptions[0]);
    
    expect(mockAppState.insertLetter).toHaveBeenCalledWith(0, 'a');
    expect(mockAppState.closeAllMenus).toHaveBeenCalled();
  });
});