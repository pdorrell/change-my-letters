import React from 'react';
import { render, screen } from '@testing-library/react';
import { FinderTypeNavigation } from '@/views/finders/finder-type-navigation';
import { Finders } from '@/models/finders/finders';
import { AudioFilePlayerTestDouble } from '@/tests/test_doubles/audio-file-player-test-double';
import { WordSayer } from '@/models/word-sayer';
import { EmotionalWordSayer } from '@/models/audio/emotional-word-sayer';
import { EmotionWordSet, HappyOrSad } from '@/models/audio/emotion-types';

describe('FinderTypeNavigation', () => {
  it('renders Word Choice tab as active by default', () => {
    const audioFilePlayer = new AudioFilePlayerTestDouble('/assets/words/amazon_polly');
    const wordSayer = new WordSayer(audioFilePlayer, 'words');
    const emotionalWordSayer = new EmotionalWordSayer(audioFilePlayer, [
      new EmotionWordSet<HappyOrSad>('happy', ['cool!!']),
      new EmotionWordSet<HappyOrSad>('sad', ['oh no!'])
    ]);
    const getRandomWords = () => ['cat', 'dog', 'bat'];
    const findersInteraction = new Finders(wordSayer, emotionalWordSayer, getRandomWords);

    render(<FinderTypeNavigation findersInteraction={findersInteraction} />);

    const wordChoiceTab = screen.getByRole('button', { name: 'Word Choice' });
    expect(wordChoiceTab).toBeInTheDocument();
    expect(wordChoiceTab).toBeDisabled(); // Active tab should be disabled
    expect(wordChoiceTab).toHaveClass('active');
  });

  it('shows correct tooltip for Word Choice tab', () => {
    const audioFilePlayer = new AudioFilePlayerTestDouble('/assets/words/amazon_polly');
    const wordSayer = new WordSayer(audioFilePlayer, 'words');
    const emotionalWordSayer = new EmotionalWordSayer(audioFilePlayer, [
      new EmotionWordSet<HappyOrSad>('happy', ['cool!!']),
      new EmotionWordSet<HappyOrSad>('sad', ['oh no!'])
    ]);
    const getRandomWords = () => ['cat', 'dog', 'bat'];
    const findersInteraction = new Finders(wordSayer, emotionalWordSayer, getRandomWords);

    render(<FinderTypeNavigation findersInteraction={findersInteraction} />);

    const wordChoiceTab = screen.getByRole('button', { name: 'Word Choice' });
    expect(wordChoiceTab).toHaveAttribute('title', 'Switch to Word Choice finder');
  });
});
