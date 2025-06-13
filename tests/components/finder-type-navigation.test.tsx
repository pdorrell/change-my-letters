import React from 'react';
import { render, screen } from '@testing-library/react';
import { FinderTypeNavigation } from '@/views/finders/finder-type-navigation';
import { FindersInteraction } from '@/models/finders/finders-interaction';
import { WordSayerTestDouble } from '../test_doubles/word-sayer-test-double';

describe('FinderTypeNavigation', () => {
  it('renders Word Choice tab as active by default', () => {
    const wordSayer = new WordSayerTestDouble();
    const getRandomWords = () => ['cat', 'dog', 'bat'];
    const findersInteraction = new FindersInteraction(wordSayer, wordSayer, getRandomWords);

    render(<FinderTypeNavigation findersInteraction={findersInteraction} />);

    const wordChoiceTab = screen.getByRole('button', { name: 'Word Choice' });
    expect(wordChoiceTab).toBeInTheDocument();
    expect(wordChoiceTab).toBeDisabled(); // Active tab should be disabled
    expect(wordChoiceTab).toHaveClass('active');
  });

  it('shows correct tooltip for Word Choice tab', () => {
    const wordSayer = new WordSayerTestDouble();
    const getRandomWords = () => ['cat', 'dog', 'bat'];
    const findersInteraction = new FindersInteraction(wordSayer, wordSayer, getRandomWords);

    render(<FinderTypeNavigation findersInteraction={findersInteraction} />);

    const wordChoiceTab = screen.getByRole('button', { name: 'Word Choice' });
    expect(wordChoiceTab).toHaveAttribute('title', 'Switch to Word Choice finder');
  });
});
