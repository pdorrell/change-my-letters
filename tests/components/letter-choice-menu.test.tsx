import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { LetterChoiceMenu } from '@/views/changer/word-changer';
import { createTestWordChanger } from '@/tests/utils/test-app-builder';
import { MenuManager } from '@/lib/views/menu-manager';
import { WordSelectionByLetter } from '@/models/word-selection-by-letter';
import { WordChanger } from '@/models/changer/word-changer';
import { Word } from '@/models/Word';
import { TestChoiceHandler } from '@/tests/utils/test-choice-handler';
import { FreeTestWordGetter } from '@/tests/utils/free-test-word-getter';
import { ReplaceChange } from '@/models/word-change';

describe('LetterChoiceMenu', () => {
  let wordChanger: WordChanger;
  let menuManager: MenuManager;
  let options: ReplaceChange[];
  let choiceHandler: TestChoiceHandler<Word>;
  let menuRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    // Create WordChanger with AudioFilePlayerTestDouble
    wordChanger = createTestWordChanger();
    wordChanger.menuManager.activeButtonElement = document.createElement('button');
    // Pre-populate visited words
    wordChanger.previouslyVisitedWords.add('bat');
    wordChanger.previouslyVisitedWords.add('rat');

    // Assign the menuManager for direct use
    menuManager = wordChanger.menuManager;


    // Create sample letter change options using FreeTestWordGetter
    const wordGetter = new FreeTestWordGetter();
    const batWord = wordGetter.getRequiredWord('bat');
    const hatWord = wordGetter.getRequiredWord('hat');
    const ratWord = wordGetter.getRequiredWord('rat');

    options = [
      new ReplaceChange(batWord, 'b'),
      new ReplaceChange(hatWord, 'h'),
      new ReplaceChange(ratWord, 'r')
    ];

    // Create choice handler
    choiceHandler = new TestChoiceHandler<Word>();

    // Create menu ref for testing
    menuRef = React.createRef<HTMLDivElement>();
  });


  it('renders letter options correctly', () => {
    // Set previouslyVisited on the Word objects
    options[0].result.previouslyVisited = true; // 'bat' was visited
    options[2].result.previouslyVisited = true; // 'rat' was visited

    const wordSelectionByLetter = new WordSelectionByLetter(options, choiceHandler.chooser);

    render(
      <LetterChoiceMenu
        wordSelectionByLetter={wordSelectionByLetter}
        menuManager={menuManager}
        menuRef={menuRef}
      />
    );

    // Should render the letter options - use menuRef to access the DOM
    const menu = menuRef.current;
    expect(menu).not.toBeNull();

    const letterOption1 = menu?.querySelector('.letter-choice-option:nth-child(1)');
    const letterOption2 = menu?.querySelector('.letter-choice-option:nth-child(2)');
    const letterOption3 = menu?.querySelector('.letter-choice-option:nth-child(3)');

    expect(letterOption1?.textContent).toBe('b');
    expect(letterOption2?.textContent).toBe('h');
    expect(letterOption3?.textContent).toBe('r');
  });

  it('marks previously visited options correctly', () => {
    // Set previouslyVisited on the Word objects
    options[0].result.previouslyVisited = true; // 'bat' was visited
    options[2].result.previouslyVisited = true; // 'rat' was visited

    const wordSelectionByLetter = new WordSelectionByLetter(options, choiceHandler.chooser);

    render(
      <LetterChoiceMenu
        wordSelectionByLetter={wordSelectionByLetter}
        menuManager={menuManager}
        menuRef={menuRef}
      />
    );

    // Should render the letter options - use menuRef to access the DOM
    const menu = menuRef.current;
    expect(menu).not.toBeNull();

    const letterOption1 = menu?.querySelector('.letter-choice-option:nth-child(1)');
    const letterOption2 = menu?.querySelector('.letter-choice-option:nth-child(2)');
    const letterOption3 = menu?.querySelector('.letter-choice-option:nth-child(3)');

    // First option (b -> bat) should be previously visited
    expect(letterOption1?.classList.contains('previously-visited')).toBe(true);

    // Second option (h -> hat) should not be previously visited
    expect(letterOption2?.classList.contains('previously-visited')).toBe(false);

    // Third option (r -> rat) should be previously visited
    expect(letterOption3?.classList.contains('previously-visited')).toBe(true);
  });

  it('calls onSelect when a letter choice is clicked', () => {
    // Set previouslyVisited on the Word objects
    options[0].result.previouslyVisited = true; // 'bat' was visited
    options[2].result.previouslyVisited = true; // 'rat' was visited

    const wordSelectionByLetter = new WordSelectionByLetter(options, choiceHandler.chooser);

    render(
      <LetterChoiceMenu
        wordSelectionByLetter={wordSelectionByLetter}
        menuManager={menuManager}
        menuRef={menuRef}
      />
    );

    // Get the first letter option and click it - use menuRef to access the DOM
    const menu = menuRef.current;
    expect(menu).not.toBeNull();

    const letterOption1 = menu?.querySelector('.letter-choice-option:nth-child(1)');
    if (letterOption1) fireEvent.click(letterOption1);

    // choiceHandler should have received the Word object from the first option
    expect(choiceHandler.choice).toBe(options[0].result);
  });
});
