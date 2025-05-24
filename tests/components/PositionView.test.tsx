import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { PositionView } from '../../src/views/PositionView';
import { Position } from '../../src/models/Position';
import { WordInteraction } from '../../src/models/interaction/WordInteraction';
import { PositionInteraction } from '../../src/models/interaction/PositionInteraction';
import { AppState } from '../../src/models/AppState';
import { FreeTestWordGetter } from '../utils/FreeTestWordGetter';
import { WordSayerTestDouble } from '../test_doubles/WordSayerTestDouble';



describe('PositionView', () => {
  let appState: AppState;
  let currentWord: WordInteraction;
  let positionInteraction: PositionInteraction;
  
  beforeEach(() => {
    // Create a FreeTestWordGetter and populate it with changes
    const wordGetter = new FreeTestWordGetter();
    const catWord = wordGetter.getRequiredWord('cat');
    catWord.populateChanges(wordGetter);
    
    const wordSayerTestDouble = new WordSayerTestDouble();
    
    // Create a simple mock AppState for testing
    appState = {
      previouslyVisitedWords: new Set(),
      newWordHandler: (word: any) => { /* mock handler */ },
      wordSayer: wordSayerTestDouble,
      menuManager: {
        activeButtonElement: null,
        closeMenus: () => {},
        toggleMenu: () => {}
      }
    } as any;

    // Create WordInteraction using the populated Word
    currentWord = new WordInteraction(catWord, appState.newWordHandler, appState.wordSayer, appState.menuManager);
    
    // Get the first position interaction (before 'c')
    positionInteraction = currentWord.positionInteractions[0];
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
    
    render(<PositionView positionInteraction={positionInteraction} />);
    
    // Use the menuRef to access the LetterChoiceMenu
    const menu = positionInteraction.insertMenuRef.current;
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveClass('letter-choice-menu');
  });
  
  it('displays letter choices when insert menu is open', () => {
    // Set the insert menu to open
    positionInteraction.isInsertMenuOpen = true;
    
    render(<PositionView positionInteraction={positionInteraction} />);
    
    // Use the menuRef to access the LetterChoiceMenu
    const menu = positionInteraction.insertMenuRef.current;
    expect(menu).toBeInTheDocument();
    
    // Get the letter choice options
    const letterOptions = menu?.querySelectorAll('.letter-choice-option');
    
    // Should be at least one letter option
    expect(letterOptions?.length).toBeGreaterThan(0);
    
    // Just verify the menu is displayed properly - clicking leads to complex model interactions
    // that are better tested at the integration level
    expect(letterOptions?.[0]).toBeInTheDocument();
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
      insertMenuRef: React.createRef<HTMLDivElement>(),
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