import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { LetterChoiceMenu } from '@/lib/views/letter-choice-menu';
import { createTestWordChanger } from '@/tests/utils/test-app-builder';
import { MenuManager } from '@/lib/views/menu-manager';
import { WordSelectionByLetter } from '@/models/changer/word-selection-by-letter';
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
  });


  it('renders letter options correctly', () => {
    // Set previouslyVisited on the Word objects
    options[0].result.previouslyVisited = true; // 'bat' was visited
    options[2].result.previouslyVisited = true; // 'rat' was visited

    const wordSelectionByLetter = new WordSelectionByLetter(options, choiceHandler.chooser);

    const { container } = render(
      <LetterChoiceMenu
        wordSelectionByLetter={wordSelectionByLetter}
        menuManager={menuManager}
      />
    );

    // Should render the letter options
    const menu = container.querySelector('.letter-choice-menu');
    expect(menu).not.toBeNull();

    const letterOptions = container.querySelectorAll('.letter-choice-option');
    expect(letterOptions).toHaveLength(3);

    expect(letterOptions[0]?.textContent).toBe('b');
    expect(letterOptions[1]?.textContent).toBe('h');
    expect(letterOptions[2]?.textContent).toBe('r');
  });

  it('marks previously visited options correctly', () => {
    // Set previouslyVisited on the Word objects
    options[0].result.previouslyVisited = true; // 'bat' was visited
    options[2].result.previouslyVisited = true; // 'rat' was visited

    const wordSelectionByLetter = new WordSelectionByLetter(options, choiceHandler.chooser);

    const { container } = render(
      <LetterChoiceMenu
        wordSelectionByLetter={wordSelectionByLetter}
        menuManager={menuManager}
      />
    );

    // Should render the letter options
    const letterOptions = container.querySelectorAll('.letter-choice-option');
    expect(letterOptions).toHaveLength(3);

    // First option (b -> bat) should be previously visited
    expect(letterOptions[0]?.classList.contains('previously-visited')).toBe(true);

    // Second option (h -> hat) should not be previously visited
    expect(letterOptions[1]?.classList.contains('previously-visited')).toBe(false);

    // Third option (r -> rat) should be previously visited
    expect(letterOptions[2]?.classList.contains('previously-visited')).toBe(true);
  });

  it('calls onSelect when a letter choice is clicked', () => {
    // Set previouslyVisited on the Word objects
    options[0].result.previouslyVisited = true; // 'bat' was visited
    options[2].result.previouslyVisited = true; // 'rat' was visited

    const wordSelectionByLetter = new WordSelectionByLetter(options, choiceHandler.chooser);

    const { container } = render(
      <LetterChoiceMenu
        wordSelectionByLetter={wordSelectionByLetter}
        menuManager={menuManager}
      />
    );

    // Get the first letter option and click it
    const letterOptions = container.querySelectorAll('.letter-choice-option');
    expect(letterOptions).toHaveLength(3);
    
    fireEvent.click(letterOptions[0]);

    // choiceHandler should have received the Word object from the first option
    expect(choiceHandler.choice).toBe(options[0].result);
  });
});
