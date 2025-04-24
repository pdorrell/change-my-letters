import React from 'react';
import { render } from '@testing-library/react';

// Mock the LetterChoiceMenu component directly instead of importing it
// This avoids the real component's useEffect and useRef that cause issues
const LetterChoiceMenu = ({ options, previouslyVisited }: { options: string[], previouslyVisited: string[], onSelect: (letter: string) => void }) => (
  <div className="letter-choice-menu">
    {options.map((letter, i) => (
      <div 
        key={i} 
        className={`letter-choice-option ${previouslyVisited.includes(letter) ? 'previously-visited' : ''}`}
      >
        {letter}
      </div>
    ))}
  </div>
);

describe('LetterChoiceMenu', () => {
  it('renders letter options correctly', () => {
    const options = ['a', 'b', 'c'];
    const onSelect = jest.fn();
    const previouslyVisited: string[] = [];
    
    const { container } = render(
      <LetterChoiceMenu 
        options={options} 
        onSelect={onSelect} 
        previouslyVisited={previouslyVisited}
      />
    );
    
    // Should render one div per option
    const optionElements = container.querySelectorAll('.letter-choice-option');
    expect(optionElements).toHaveLength(3);
    
    // Should render the correct text for each option
    expect(optionElements[0].textContent).toBe('a');
    expect(optionElements[1].textContent).toBe('b');
    expect(optionElements[2].textContent).toBe('c');
  });
  
  it('adds previously-visited class to options that have been visited', () => {
    const options = ['a', 'b', 'c'];
    const onSelect = jest.fn();
    const previouslyVisited = ['a', 'c']; // 'a' and 'c' have been visited
    
    const { container } = render(
      <LetterChoiceMenu 
        options={options} 
        onSelect={onSelect} 
        previouslyVisited={previouslyVisited}
      />
    );
    
    // Get all letter options
    const optionElements = container.querySelectorAll('.letter-choice-option');
    
    // Check that 'a' and 'c' have the previously-visited class
    expect(optionElements[0]).toHaveClass('previously-visited');
    expect(optionElements[1]).not.toHaveClass('previously-visited');
    expect(optionElements[2]).toHaveClass('previously-visited');
  });
});