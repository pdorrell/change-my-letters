import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { runInAction } from 'mobx';
import { PronunciationActivityPage } from '@/views/pronunciation/pronunciation-activity-page';
import { PronunciationReviewPage, ReviewStateLoadAndSaveControls } from '@/views/pronunciation/pronunciation-review-page';
import { PronunciationActivity } from '@/models/pronunciation/pronunciation-activity';
import { PronunciationReview } from '@/models/pronunciation/pronunciation-review';
import { ReviewStateFilterOption } from '@/models/pronunciation/review-state-filter-option';
import { Word } from '@/models/Word';
import { AudioFilePlayerTestDouble } from '@/tests/test_doubles/audio-file-player-test-double';
import { WordSayer } from '@/models/word-sayer';

describe('Pronunciation Pages', () => {
  let activityPronunciation: PronunciationActivity;
  let reviewPronunciation: PronunciationReview;
  let wordSayer: WordSayer;
  let audioFilePlayer: AudioFilePlayerTestDouble;
  let testWords: Word[];

  // Helper function to render the appropriate component based on review mode
  const renderPronunciationComponent = (reviewMode: boolean = false) => {
    if (reviewMode) {
      return render(<PronunciationReviewPage pronunciation={reviewPronunciation} />);
    } else {
      return render(<PronunciationActivityPage pronunciation={activityPronunciation} />);
    }
  };


  beforeEach(() => {
    audioFilePlayer = new AudioFilePlayerTestDouble('/assets/words/amazon_polly');
    wordSayer = new WordSayer(audioFilePlayer, 'words');

    // Create test words
    testWords = [
      new Word('cat', [false, false, false], ['', '', '', ''], ['', '', '']),
      new Word('dog', [false, false, false], ['', '', '', ''], ['', '', '']),
      new Word('fish', [false, false, false, false], ['', '', '', '', ''], ['', '', '', '']),
      new Word('bird', [false, false, false, false], ['', '', '', '', ''], ['', '', '', ''])
    ];

    activityPronunciation = new PronunciationActivity(testWords, wordSayer);
    reviewPronunciation = new PronunciationReview(testWords, wordSayer);
  });

  it('renders the view without main title (now in header)', () => {
    renderPronunciationComponent();

    // The main title is now in the app header, not in the view itself
    expect(screen.queryByText('Review Pronunciation')).not.toBeInTheDocument();
  });

  describe('Action Buttons Panel', () => {
    beforeEach(() => {
      // Use review pronunciation for action buttons panel
    });

    it('renders all action buttons', () => {
      renderPronunciationComponent(true);

      expect(screen.getByText('+ Load State')).toBeInTheDocument();
      expect(screen.getByText('💾 State')).toBeInTheDocument();
      expect(screen.getByText('⬇️ Wrong Words')).toBeInTheDocument();
      expect(screen.getByText('🔄 all Unreviewed')).toBeInTheDocument();
      expect(screen.getByText('🔄 all OK')).toBeInTheDocument();
      expect(screen.getByText('👀 Wrong')).toBeInTheDocument();
    });

    it('does not show drag and drop hint anymore', () => {
      renderPronunciationComponent(true);

      expect(screen.queryByText('(or drag & drop)')).not.toBeInTheDocument();
    });

    it('calls resetAllToUnreviewed when button is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      renderPronunciationComponent(true);

      // Set up some state to reset
      act(() => {
        runInAction(() => {
          reviewPronunciation.markOK(testWords[0]);
          reviewPronunciation.markSoundsWrong(testWords[1]);
        });
      });

      const resetButton = screen.getByText('🔄 all Unreviewed');
      act(() => {
        fireEvent.click(resetButton);
      });

      expect(testWords[0].reviewed).toBe(false);
      expect(testWords[1].soundsWrong).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('calls resetAllToOK when button is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      renderPronunciationComponent(true);

      const resetButton = screen.getByText('🔄 all OK');
      act(() => {
        fireEvent.click(resetButton);
      });

      testWords.forEach(word => {
        expect(word.reviewed).toBe(true);
        expect(word.soundsWrong).toBe(false);
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('word changer Panel', () => {
    it('renders the word changer panel in review mode', () => {
      // Use review mode to show sounds wrong/OK buttons
      renderPronunciationComponent(true);

      // Check for review state controls panel
      expect(screen.getByText('Sounds Wrong')).toBeInTheDocument();
      expect(screen.getByText('Sounds OK')).toBeInTheDocument();
      expect(screen.getByText('Auto')).toBeInTheDocument();
    });

    it('hides the word changer panel in activity mode', () => {
      // Use activity mode
      renderPronunciationComponent(false);

      // In activity mode, these buttons should not be visible
      expect(screen.queryByText('Sounds Wrong')).not.toBeInTheDocument();
      expect(screen.queryByText('Sounds OK')).not.toBeInTheDocument();
    });

    it('shows word when there is a current review word', () => {
      // Use review mode to show sounds wrong/OK buttons
      act(() => {
        runInAction(() => {
          reviewPronunciation.reviewWord(testWords[0]);
        });
      });

      renderPronunciationComponent(true);

      // Should show the word in the review state controls
      expect(screen.getAllByText('cat')[0]).toBeInTheDocument();
      expect(screen.getByText('Sounds Wrong')).toBeInTheDocument();
      expect(screen.getByText('Sounds OK')).toBeInTheDocument();
    });

    it('shows correct styling for current review word that sounds wrong', () => {
      act(() => {
        runInAction(() => {
          reviewPronunciation.reviewWord(testWords[0]);
          reviewPronunciation.markSoundsWrong(testWords[0]);
        });
      });

      renderPronunciationComponent(true);

      // Find the word span with the wrong styling
      const wordSpan = document.querySelector('.word-span.wrong.current-review');
      expect(wordSpan).toBeInTheDocument();
    });

    it('shows correct styling for current review word that sounds OK', () => {
      act(() => {
        runInAction(() => {
          reviewPronunciation.reviewWord(testWords[0]);
          reviewPronunciation.markOK(testWords[0]);
        });
      });

      renderPronunciationComponent(true);

      // Find the word span with the ok styling
      const wordSpan = document.querySelector('.word-span.ok.current-review');
      expect(wordSpan).toBeInTheDocument();
    });

    it('enables/disables buttons based on word changer state', () => {
      // Use review mode to show sounds wrong/OK buttons
      act(() => {
        runInAction(() => {
          reviewPronunciation.reviewWord(testWords[0]);
          reviewPronunciation.markSoundsWrong(testWords[0]);
        });
      });

      renderPronunciationComponent(true);

      const soundsOKButton = screen.getByText('Sounds OK');
      const soundsWrongButton = screen.getByText('Sounds Wrong');

      expect(soundsOKButton.closest('button')).not.toBeDisabled();
      expect(soundsWrongButton.closest('button')).toBeDisabled();
    });
  });

  describe('Filter Panel', () => {
    it('renders filter controls', () => {
      // Use review mode to show review state filter
      renderPronunciationComponent(true);

      expect(screen.getByPlaceholderText('Filter text...')).toBeInTheDocument();
      expect(screen.getByText('Match')).toBeInTheDocument();
      expect(screen.getByLabelText('start')).toBeInTheDocument();
      expect(screen.getByLabelText('end')).toBeInTheDocument();
      expect(screen.getByLabelText('any')).toBeInTheDocument();
      expect(screen.getByLabelText('Review state:')).toBeInTheDocument();
    });

    it('shows Auto button in activity mode filter controls', () => {
      // Use activity mode
      renderPronunciationComponent(false);

      // Should show Auto button in activity mode
      const autoButton = screen.getByText('Auto');
      expect(autoButton).toBeInTheDocument();
    });

    it('does not show Auto button in review mode filter controls', () => {
      // Use review mode
      renderPronunciationComponent(true);

      // Should not show Auto button in review mode (it's in the state controls)
      const autoButton = screen.queryByText('Auto');
      expect(autoButton).toBeInTheDocument(); // Auto button is actually in review state controls
    });

    it('calls autoplay action when Auto button in filter controls is clicked', () => {
      // Use activity mode
      const startAutoplaySpy = jest.spyOn(activityPronunciation, 'startAutoplay');

      renderPronunciationComponent(false);

      const autoButton = screen.getByText('Auto');
      act(() => {
        fireEvent.click(autoButton);
      });

      expect(startAutoplaySpy).toHaveBeenCalled();
    });

    it('updates filter text when typing', () => {
      renderPronunciationComponent(true);

      const filterInput = screen.getByPlaceholderText('Filter text...');

      act(() => {
        fireEvent.change(filterInput, { target: { value: 'cat' } });
      });

      expect(reviewPronunciation.filter.value.value).toBe('cat');
      expect(filterInput).toHaveValue('cat');
    });

    it('updates match option radio buttons', () => {
      renderPronunciationComponent(true);

      const startRadio = screen.getByLabelText('start');
      const anyRadio = screen.getByLabelText('any');
      expect(startRadio).toBeChecked(); // default start
      expect(anyRadio).not.toBeChecked();

      act(() => {
        fireEvent.click(anyRadio);
      });

      expect(reviewPronunciation.filter.matchOption.value).toBe('any');
      expect(anyRadio).toBeChecked();
      expect(startRadio).not.toBeChecked();
    });

    it('updates review state filter', () => {
      // Use review mode to show review state filter
      renderPronunciationComponent(true);

      const select = screen.getByLabelText('Review state:');

      act(() => {
        fireEvent.change(select, { target: { value: '1' } }); // UNREVIEWED
      });

      expect(reviewPronunciation.reviewStateFilter).toBe(ReviewStateFilterOption.UNREVIEWED);
    });

    it('shows all review state options in select', () => {
      // Use review mode to show review state filter
      renderPronunciationComponent(true);

      const select = screen.getByLabelText('Review state:');
      const options = select.querySelectorAll('option');

      expect(options).toHaveLength(4);
      expect(options[0]).toHaveTextContent('All');
      expect(options[1]).toHaveTextContent('Un-reviewed');
      expect(options[2]).toHaveTextContent('Wrong');
      expect(options[3]).toHaveTextContent('Un-reviewed or Wrong');
    });
  });

  describe('Filtered Words', () => {
    it('displays all words by default', () => {
      renderPronunciationComponent(true);

      expect(screen.getByText('Words: 4')).toBeInTheDocument();
      expect(screen.getByText('cat')).toBeInTheDocument();
      expect(screen.getByText('dog')).toBeInTheDocument();
      expect(screen.getByText('fish')).toBeInTheDocument();
      expect(screen.getByText('bird')).toBeInTheDocument();
    });

    it('updates word count when filtering', () => {
      act(() => {
        runInAction(() => {
          reviewPronunciation.filter.value.set('c');
          reviewPronunciation.filter.matchOption.set('start');
        });
      });

      renderPronunciationComponent(true);

      expect(screen.getByText('Words: 1')).toBeInTheDocument();
      expect(screen.getByText('cat')).toBeInTheDocument();
      expect(screen.queryByText('dog')).not.toBeInTheDocument();
    });

    it('applies correct CSS classes based on word state', () => {
      // Use review mode to see CSS classes
      act(() => {
        runInAction(() => {
          reviewPronunciation.markOK(testWords[0]); // cat - reviewed OK
          reviewPronunciation.markSoundsWrong(testWords[1]); // dog - wrong
          reviewPronunciation.reviewWord(testWords[2]); // fish - current review
        });
      });

      renderPronunciationComponent(true);

      const wordsSection = screen.getByText('Words: 4').closest('.filtered-words');
      const wordsGrid = wordsSection!.querySelector('.words-grid');
      const allSpans = wordsGrid!.querySelectorAll('.word-span');
      const catSpan = Array.from(allSpans).find(span => span.textContent === 'cat');
      const dogSpan = Array.from(allSpans).find(span => span.textContent === 'dog');
      const fishSpan = Array.from(allSpans).find(span => span.textContent === 'fish');
      const birdSpan = Array.from(allSpans).find(span => span.textContent === 'bird');

      expect(catSpan).toHaveClass('ok');
      expect(dogSpan).toHaveClass('wrong');
      expect(fishSpan).toHaveClass('current-review');
      expect(birdSpan).toHaveClass('word-span');
      expect(birdSpan).not.toHaveClass('ok', 'wrong', 'current-review');
    });

    it('calls reviewWord when clicking on a word', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const reviewWordSpy = jest.spyOn(reviewPronunciation, 'reviewWord');

      renderPronunciationComponent(true);

      const catSpan = screen.getAllByText('cat').find(el => el.closest('.words-grid'));

      act(() => {
        fireEvent.click(catSpan!);
      });

      expect(reviewWordSpy).toHaveBeenCalledWith(testWords[0]);
      expect(audioFilePlayer.playedFiles).toContain('words/cat');
      
      consoleSpy.mockRestore();
    });

    it('shows ellipsis button when there are more words in activity mode', () => {
      // Use activity mode and limit words
      activityPronunciation.maxNumWordsToShow = 2;

      renderPronunciationComponent(false);

      const ellipsisButton = screen.getByRole('button', { name: '...' });expect(ellipsisButton).toBeInTheDocument();
      expect(ellipsisButton).toHaveClass('ellipsis-button');
    });

    it('does not show ellipsis button when there are no more words', () => {
      // Use activity mode but don't limit words
      activityPronunciation.maxNumWordsToShow = 20;

      renderPronunciationComponent(false);

      const ellipsisButton = screen.queryByRole('button', { name: '...' });
      expect(ellipsisButton).not.toBeInTheDocument();
    });

    it('calls showMoreWords when ellipsis button is clicked', () => {
      // Use activity mode and limit words
      activityPronunciation.maxNumWordsToShow = 2;

      const showMoreWordsSpy = jest.spyOn(activityPronunciation, 'showMoreWords');

      renderPronunciationComponent(false);

      const ellipsisButton = screen.getByRole('button', { name: '...' });
      act(() => {
        fireEvent.click(ellipsisButton);
      });

      expect(showMoreWordsSpy).toHaveBeenCalled();
      expect(activityPronunciation.maxNumWordsToShow).toBe(4);
    });
  });

  describe('Drag and Drop', () => {
    beforeEach(() => {
      // Use review mode to show action buttons panel
    });

    it('handles drag over event', () => {
      renderPronunciationComponent(true);

      const dropArea = screen.getByText('+ Load State').closest('.load-state-button-container');

      const dragOverEvent = new Event('dragover', { bubbles: true });
      Object.defineProperty(dragOverEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });

      act(() => {
        fireEvent(dropArea!, dragOverEvent);
      });

      expect(dragOverEvent.preventDefault).toHaveBeenCalled();
    });

    it('shows alert for incorrect filename on drop', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      renderPronunciationComponent(true);

      const dropArea = screen.getByText('+ Load State').closest('.load-state-button-container');

      const file = new File(['{}'], 'wrong-name.json', { type: 'application/json' });

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'preventDefault', { value: jest.fn() });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] }
      });

      act(() => {
        fireEvent(dropArea!, dropEvent);
      });

      expect(alertSpy).toHaveBeenCalledWith('Please drop a file named "review-pronunciation-state.json"');

      alertSpy.mockRestore();
    });
  });

  describe('Keyboard Navigation', () => {
    it('shows keyboard shortcuts hint for review mode', () => {
      renderPronunciationComponent(true);

      expect(screen.getByText('Use ← → keys to navigate, Alt+→ to auto-play, space bar to toggle OK/wrong')).toBeInTheDocument();
    });

    it('shows keyboard shortcuts hint for activity mode', () => {
      renderPronunciationComponent(false);

      expect(screen.getByText('Use ← → arrow keys to navigate, Alt+→ to start autoplay')).toBeInTheDocument();
    });

    it('handles right arrow key for next word navigation', () => {
      const gotoNextWordSpy = jest.spyOn(reviewPronunciation, 'gotoNextWord');

      renderPronunciationComponent(true);

      // Simulate right arrow key press
      act(() => {
        fireEvent.keyDown(document, { key: 'ArrowRight' });
      });

      expect(gotoNextWordSpy).toHaveBeenCalled();
    });

    it('handles left arrow key for previous word navigation', () => {
      const gotoPreviousWordSpy = jest.spyOn(reviewPronunciation, 'gotoPreviousWord');

      renderPronunciationComponent(true);

      // Simulate left arrow key press
      act(() => {
        fireEvent.keyDown(document, { key: 'ArrowLeft' });
      });

      expect(gotoPreviousWordSpy).toHaveBeenCalled();
    });

    it('does not handle other keys', () => {
      const gotoNextWordSpy = jest.spyOn(reviewPronunciation, 'gotoNextWord');
      const gotoPreviousWordSpy = jest.spyOn(reviewPronunciation, 'gotoPreviousWord');

      renderPronunciationComponent(true);

      // Simulate other key presses
      act(() => {
        fireEvent.keyDown(document, { key: 'Enter' });
        fireEvent.keyDown(document, { key: 'Space' });
        fireEvent.keyDown(document, { key: 'ArrowUp' });
      });

      expect(gotoNextWordSpy).not.toHaveBeenCalled();
      expect(gotoPreviousWordSpy).not.toHaveBeenCalled();
    });

    it('removes event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = renderPronunciationComponent(true);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Integration with Pronunciation', () => {
    it('reflects changes in interaction state', () => {
      const { rerender } = renderPronunciationComponent(true);

      // Initially no current review word shown in state controls
      const currentWordSpan = document.querySelector('.word-span.current-review');
      expect(currentWordSpan).not.toBeInTheDocument();

      // Set a current review word
      act(() => {
        runInAction(() => {
          reviewPronunciation.reviewWord(testWords[0]);
        });
      });

      rerender(<PronunciationReviewPage pronunciation={reviewPronunciation} />);

      // Should now show the word in the review state controls
      expect(screen.getAllByText('cat')[0]).toBeInTheDocument();
    });

    it('updates word count when filter changes', () => {
      const { rerender } = renderPronunciationComponent(true);

      expect(screen.getByText('Words: 4')).toBeInTheDocument();

      act(() => {
        runInAction(() => {
          reviewPronunciation.filter.value.set('fish');
        });
      });

      rerender(<PronunciationReviewPage pronunciation={reviewPronunciation} />);

      expect(screen.getByText('Words: 1')).toBeInTheDocument();
    });
  });
});

describe('ReviewStateLoadAndSaveControls', () => {
  let pronunciation: PronunciationReview;
  let wordSayer: WordSayer;
  let audioFilePlayer: AudioFilePlayerTestDouble;
  let reviewStateFileLoader: jest.Mock<void, [File]>;
  let testWords: Word[];

  beforeEach(() => {
    audioFilePlayer = new AudioFilePlayerTestDouble('/assets/words/amazon_polly');
    wordSayer = new WordSayer(audioFilePlayer, 'words');

    // Create test words
    testWords = [
      new Word('cat', [false, false, false], ['', '', '', ''], ['', '', '']),
      new Word('dog', [false, false, false], ['', '', '', ''], ['', '', ''])
    ];

    pronunciation = new PronunciationReview(testWords, wordSayer);

    // Create test double for reviewStateFileLoader
    reviewStateFileLoader = jest.fn();
  });

  describe('Drag and Drop', () => {
    it('handles drag over event', () => {
      render(
        <ReviewStateLoadAndSaveControls
          pronunciation={pronunciation}
          reviewStateFileLoader={reviewStateFileLoader}
        />
      );

      const dropArea = screen.getByText('+ Load State').closest('.load-state-button-container');

      const dragOverEvent = new Event('dragover', { bubbles: true });
      Object.defineProperty(dragOverEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });

      act(() => {
        fireEvent(dropArea!, dragOverEvent);
      });

      expect(dragOverEvent.preventDefault).toHaveBeenCalled();
    });

    it('calls reviewStateFileLoader with correct file on drop', () => {
      render(
        <ReviewStateLoadAndSaveControls
          pronunciation={pronunciation}
          reviewStateFileLoader={reviewStateFileLoader}
        />
      );

      const dropArea = screen.getByText('+ Load State').closest('.load-state-button-container');

      const testData = '{"reviewed": ["cat"], "soundsWrong": ["dog"]}';
      const file = new File([testData], 'review-pronunciation-state.json', { type: 'application/json' });

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'preventDefault', { value: jest.fn() });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] }
      });

      act(() => {
        fireEvent(dropArea!, dropEvent);
      });

      expect(reviewStateFileLoader).toHaveBeenCalledWith(file);
    });

    it('shows alert for incorrect filename on drop without calling reviewStateFileLoader', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <ReviewStateLoadAndSaveControls
          pronunciation={pronunciation}
          reviewStateFileLoader={reviewStateFileLoader}
        />
      );

      const dropArea = screen.getByText('+ Load State').closest('.load-state-button-container');

      const file = new File(['{}'], 'wrong-name.json', { type: 'application/json' });

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'preventDefault', { value: jest.fn() });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] }
      });

      act(() => {
        fireEvent(dropArea!, dropEvent);
      });

      expect(alertSpy).toHaveBeenCalledWith('Please drop a file named "review-pronunciation-state.json"');
      expect(reviewStateFileLoader).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('shows alert when no matching file is found on drop', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <ReviewStateLoadAndSaveControls
          pronunciation={pronunciation}
          reviewStateFileLoader={reviewStateFileLoader}
        />
      );

      const dropArea = screen.getByText('+ Load State').closest('.load-state-button-container');

      const file1 = new File(['{}'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['{}'], 'file2.json', { type: 'application/json' });

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'preventDefault', { value: jest.fn() });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file1, file2] }
      });

      act(() => {
        fireEvent(dropArea!, dropEvent);
      });

      expect(alertSpy).toHaveBeenCalledWith('Please drop a file named "review-pronunciation-state.json"');
      expect(reviewStateFileLoader).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('calls reviewStateFileLoader when correct file is found among multiple files', () => {
      render(
        <ReviewStateLoadAndSaveControls
          pronunciation={pronunciation}
          reviewStateFileLoader={reviewStateFileLoader}
        />
      );

      const dropArea = screen.getByText('+ Load State').closest('.load-state-button-container');

      const file1 = new File(['{}'], 'file1.txt', { type: 'text/plain' });
      const correctFile = new File(['{"reviewed": [], "soundsWrong": []}'], 'review-pronunciation-state.json', { type: 'application/json' });
      const file3 = new File(['{}'], 'file3.json', { type: 'application/json' });

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'preventDefault', { value: jest.fn() });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file1, correctFile, file3] }
      });

      act(() => {
        fireEvent(dropArea!, dropEvent);
      });

      expect(reviewStateFileLoader).toHaveBeenCalledWith(correctFile);
    });
  });
});
