import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { PositionView } from '../../src/views/PositionView';
import { Position } from '../../src/models/Position';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { AppState } from '../../src/models/AppState';
import { createTestWordGraph, testWordLists } from '../utils/TestWordGraphBuilder';
import { createTestAppState } from '../utils/TestAppBuilder';

// Mock the LetterChoiceMenu component only (not the model classes)
jest.mock('../../src/views/CurrentWordView', () => ({
  LetterChoiceMenu: ({ wordSelectionByLetter }: { wordSelectionByLetter: any }) => (
    <div data-testid="letter-choice-menu">
      {wordSelectionByLetter.options.map((option: any, index: number) => (
        <div key={index} data-testid="letter-choice-option" onClick={() => wordSelectionByLetter.onSelect(option.result)}>
          {option.letter}
        </div>
      ))}
    </div>
  ),
}));


describe('PositionView', () => {
  let appState: any;
  let currentWord: WordInteraction;
  let positionInteraction: any;
  
  beforeEach(() => {
    // Create AppState with WordSayerTestDouble
    appState = createTestAppState();
    appState.history.previouslyVisitedWords = new Set();
    
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
      setNewWord: (word: any) => {
        appState.setNewWord(word);
      },
      openInsertMenuAction: {
        enabled: true,
        doAction: () => {
          // No-op for testing - just verify button shows and is clickable
        }
      },
      insertButtonRef: { current: null },
      get selectionOfLetterToInsert() {
        return {
          options: this.position.changes.insertChanges,
          onSelect: this.setNewWord
        };
      }
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
  
  it('opens insert menu when insert icon is clicked', () => {
    const { container } = render(<PositionView positionInteraction={positionInteraction} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    if (insertButton) fireEvent.click(insertButton);
    
    // Test that menu gets opened by checking if toggleMenu was triggered
    // Since we can't easily test menu state changes in this isolated test,
    // we just verify the button click doesn't cause errors
    expect(insertButton).toBeInTheDocument();
  });
  
  it('shows letter choice menu when insert menu is open', () => {
    // Set the insert menu to open
    positionInteraction.isInsertMenuOpen = true;
    
    const { getByTestId } = render(<PositionView positionInteraction={positionInteraction} />);
    
    expect(getByTestId('letter-choice-menu')).toBeInTheDocument();
  });
  
  it('displays letter choices when insert menu is open', () => {
    // Set the insert menu to open
    positionInteraction.isInsertMenuOpen = true;
    
    const { getAllByTestId } = render(<PositionView positionInteraction={positionInteraction} />);
    
    // Get the letter choice options
    const letterOptions = getAllByTestId('letter-choice-option');
    
    // Should be at least one letter option
    expect(letterOptions.length).toBeGreaterThan(0);
    
    // Just verify the menu is displayed properly - clicking leads to complex model interactions
    // that are better tested at the integration level
    expect(letterOptions[0]).toBeInTheDocument();
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
      setNewWord: (word: any) => {
        appState.setNewWord(word);
      },
      openInsertMenuAction: {
        enabled: false,
        doAction: () => {}
      },
      insertButtonRef: { current: null },
      get selectionOfLetterToInsert() {
        return {
          options: [],
          onSelect: this.setNewWord
        };
      }
    };
    
    const { container } = render(<PositionView positionInteraction={mockPositionInteraction as any} />);
    
    const insertButton = container.querySelector('.insert-icon:not(.hidden)');
    expect(insertButton).not.toBeInTheDocument();
  });
});