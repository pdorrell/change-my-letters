import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { runInAction } from 'mobx';
import { ReviewPronunciationView, ReviewActionControls } from '@/views/review/review-pronunciation';
import { ReviewPronunciationInteraction } from '@/models/review/review-pronunciation-interaction';
import { ReviewStateFilterOption } from '@/models/review/review-state-filter-option';
import { Word } from '@/models/Word';
import { WordSayerTestDouble } from '@/tests/test_doubles/word-sayer-test-double';

describe('ReviewPronunciationView', () => {
  let reviewInteraction: ReviewPronunciationInteraction;
  let wordSayer: WordSayerTestDouble;
  let testWords: Word[];

  beforeEach(() => {
    wordSayer = new WordSayerTestDouble();

    // Create test words
    testWords = [
      new Word('cat', [false, false, false], ['', '', '', ''], ['', '', '']),
      new Word('dog', [false, false, false], ['', '', '', ''], ['', '', '']),
      new Word('fish', [false, false, false, false], ['', '', '', '', ''], ['', '', '', '']),
      new Word('bird', [false, false, false, false], ['', '', '', '', ''], ['', '', '', ''])
    ];

    reviewInteraction = new ReviewPronunciationInteraction(testWords, wordSayer);
  });

  it('renders the view without main title (now in header)', () => {
    render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

    // The main title is now in the app header, not in the view itself
    expect(screen.queryByText('Review Pronunciation')).not.toBeInTheDocument();
  });

  describe('Action Buttons Panel', () => {
    it('renders all action buttons', () => {
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      expect(screen.getByText('+ Load State')).toBeInTheDocument();
      expect(screen.getByText('Save State')).toBeInTheDocument();
      expect(screen.getByText('Download Wrong Words')).toBeInTheDocument();
      expect(screen.getByText('Reset All to Unreviewed')).toBeInTheDocument();
      expect(screen.getByText('Reset All to OK')).toBeInTheDocument();
      expect(screen.getByText('Review Wrong Words')).toBeInTheDocument();
    });

    it('does not show drag and drop hint anymore', () => {
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      expect(screen.queryByText('(or drag & drop)')).not.toBeInTheDocument();
    });

    it('calls resetAllToUnreviewed when button is clicked', () => {
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      // Set up some state to reset
      act(() => {
        runInAction(() => {
          testWords[0].reviewed = true;
          testWords[1].soundsWrong = true;
        });
      });

      const resetButton = screen.getByText('Reset All to Unreviewed');
      act(() => {
        fireEvent.click(resetButton);
      });

      expect(testWords[0].reviewed).toBe(false);
      expect(testWords[1].soundsWrong).toBe(false);
    });

    it('calls resetAllToOK when button is clicked', () => {
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      const resetButton = screen.getByText('Reset All to OK');
      act(() => {
        fireEvent.click(resetButton);
      });

      testWords.forEach(word => {
        expect(word.reviewed).toBe(true);
        expect(word.soundsWrong).toBe(false);
      });
    });
  });

  describe('word changer Panel', () => {
    it('always renders the word changer panel', () => {
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      const wordChangerPanel = document.querySelector('.word-changer-panel');
      expect(wordChangerPanel).toBeInTheDocument();
      expect(screen.getByText('Sounds Wrong')).toBeInTheDocument();
      expect(screen.getByText('Sounds OK')).toBeInTheDocument();
      expect(screen.getByText('Auto')).toBeInTheDocument();
    });

    it('shows word when there is a current review word', () => {
      act(() => {
        runInAction(() => {
          reviewInteraction.reviewWord('cat');
        });
      });

      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      const wordChangerPanel = document.querySelector('.word-changer-panel');
      expect(wordChangerPanel).toContainElement(screen.getAllByText('cat')[0]);
      expect(screen.getByText('Sounds Wrong')).toBeInTheDocument();
      expect(screen.getByText('Sounds OK')).toBeInTheDocument();
    });

    it('shows correct styling for current review word that sounds wrong', () => {
      act(() => {
        runInAction(() => {
          reviewInteraction.reviewWord('cat');
          testWords[0].soundsWrong = true;
        });
      });

      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      const wordChangerPanel = document.querySelector('.word-changer-panel');
      const wordSpan = wordChangerPanel!.querySelector('.word-span');
      expect(wordSpan).toHaveClass('wrong', 'current-review');
    });

    it('shows correct styling for current review word that sounds OK', () => {
      act(() => {
        runInAction(() => {
          reviewInteraction.reviewWord('cat');
          testWords[0].reviewed = true;
          testWords[0].soundsWrong = false;
        });
      });

      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      const wordChangerPanel = document.querySelector('.word-changer-panel');
      const wordSpan = wordChangerPanel!.querySelector('.word-span');
      expect(wordSpan).toHaveClass('ok', 'current-review');
    });

    it('enables/disables buttons based on word changer state', () => {
      act(() => {
        runInAction(() => {
          reviewInteraction.reviewWord('cat');
          testWords[0].soundsWrong = true;
        });
      });

      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      const soundsOKButton = screen.getByText('Sounds OK');
      const soundsWrongButton = screen.getByText('Sounds Wrong');

      expect(soundsOKButton.closest('button')).not.toBeDisabled();
      expect(soundsWrongButton.closest('button')).toBeDisabled();
    });
  });

  describe('Filter Panel', () => {
    it('renders filter controls', () => {
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      expect(screen.getByPlaceholderText('Filter text...')).toBeInTheDocument();
      expect(screen.getByText('Match')).toBeInTheDocument();
      expect(screen.getByLabelText('start')).toBeInTheDocument();
      expect(screen.getByLabelText('end')).toBeInTheDocument();
      expect(screen.getByLabelText('any')).toBeInTheDocument();
      expect(screen.getByLabelText('Review state:')).toBeInTheDocument();
    });

    it('updates filter text when typing', () => {
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      const filterInput = screen.getByPlaceholderText('Filter text...');

      act(() => {
        fireEvent.change(filterInput, { target: { value: 'cat' } });
      });

      expect(reviewInteraction.filter.value.value).toBe('cat');
      expect(filterInput).toHaveValue('cat');
    });

    it('updates match option radio buttons', () => {
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      const startRadio = screen.getByLabelText('start');
      const anyRadio = screen.getByLabelText('any');
      expect(startRadio).toBeChecked(); // default start
      expect(anyRadio).not.toBeChecked();

      act(() => {
        fireEvent.click(anyRadio);
      });

      expect(reviewInteraction.filter.matchOption.value).toBe('any');
      expect(anyRadio).toBeChecked();
      expect(startRadio).not.toBeChecked();
    });

    it('updates review state filter', () => {
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      const select = screen.getByLabelText('Review state:');

      act(() => {
        fireEvent.change(select, { target: { value: '1' } }); // UNREVIEWED
      });

      expect(reviewInteraction.reviewStateFilter).toBe(ReviewStateFilterOption.UNREVIEWED);
    });

    it('shows all review state options in select', () => {
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

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
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      expect(screen.getByText('Words: 4')).toBeInTheDocument();
      expect(screen.getByText('cat')).toBeInTheDocument();
      expect(screen.getByText('dog')).toBeInTheDocument();
      expect(screen.getByText('fish')).toBeInTheDocument();
      expect(screen.getByText('bird')).toBeInTheDocument();
    });

    it('updates word count when filtering', () => {
      act(() => {
        runInAction(() => {
          reviewInteraction.filter.value.set('c');
          reviewInteraction.filter.matchOption.set('start');
        });
      });

      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      expect(screen.getByText('Words: 1')).toBeInTheDocument();
      expect(screen.getByText('cat')).toBeInTheDocument();
      expect(screen.queryByText('dog')).not.toBeInTheDocument();
    });

    it('applies correct CSS classes based on word state', () => {
      act(() => {
        runInAction(() => {
          testWords[0].reviewed = true; // cat - reviewed OK
          testWords[1].soundsWrong = true; // dog - wrong
          testWords[2].currentReview = true; // fish - current review
          reviewInteraction.currentReviewWord = testWords[2];
        });
      });

      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

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
      const reviewWordSpy = jest.spyOn(reviewInteraction, 'reviewWord');

      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      const catSpan = screen.getAllByText('cat').find(el => el.closest('.words-grid'));

      act(() => {
        fireEvent.click(catSpan!);
      });

      expect(reviewWordSpy).toHaveBeenCalledWith('cat');
      expect(wordSayer.playedWords).toContain('cat');
    });
  });

  describe('Drag and Drop', () => {
    it('handles drag over event', () => {
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

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

      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

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
    it('shows keyboard shortcuts hint', () => {
      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      expect(screen.getByText('Use ← → arrow keys to navigate, Alt+→ to start autoplay, space bar to toggle sounds wrong')).toBeInTheDocument();
    });

    it('handles right arrow key for next word navigation', () => {
      const gotoNextWordSpy = jest.spyOn(reviewInteraction, 'gotoNextWord');

      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      // Simulate right arrow key press
      act(() => {
        fireEvent.keyDown(document, { key: 'ArrowRight' });
      });

      expect(gotoNextWordSpy).toHaveBeenCalled();
    });

    it('handles left arrow key for previous word navigation', () => {
      const gotoPreviousWordSpy = jest.spyOn(reviewInteraction, 'gotoPreviousWord');

      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      // Simulate left arrow key press
      act(() => {
        fireEvent.keyDown(document, { key: 'ArrowLeft' });
      });

      expect(gotoPreviousWordSpy).toHaveBeenCalled();
    });

    it('does not handle other keys', () => {
      const gotoNextWordSpy = jest.spyOn(reviewInteraction, 'gotoNextWord');
      const gotoPreviousWordSpy = jest.spyOn(reviewInteraction, 'gotoPreviousWord');

      render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

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

      const { unmount } = render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Integration with ReviewPronunciationInteraction', () => {
    it('reflects changes in interaction state', () => {
      const { rerender } = render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      // Initially word changer panel always exists but no word shown
      const wordChangerPanel = document.querySelector('.word-changer-panel');
      expect(wordChangerPanel).toBeInTheDocument();

      // Set a current review word
      act(() => {
        runInAction(() => {
          reviewInteraction.reviewWord('cat');
        });
      });

      rerender(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      // Should now show the word in the panel
      expect(wordChangerPanel).toContainElement(screen.getAllByText('cat')[0]);
    });

    it('updates word count when filter changes', () => {
      const { rerender } = render(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      expect(screen.getByText('Words: 4')).toBeInTheDocument();

      act(() => {
        runInAction(() => {
          reviewInteraction.filter.value.set('fish');
        });
      });

      rerender(<ReviewPronunciationView reviewInteraction={reviewInteraction} />);

      expect(screen.getByText('Words: 1')).toBeInTheDocument();
    });
  });
});

describe('ReviewActionControls', () => {
  let reviewInteraction: ReviewPronunciationInteraction;
  let wordSayer: WordSayerTestDouble;
  let reviewStateFileLoader: jest.Mock<void, [File]>;
  let testWords: Word[];

  beforeEach(() => {
    wordSayer = new WordSayerTestDouble();

    // Create test words
    testWords = [
      new Word('cat', [false, false, false], ['', '', '', ''], ['', '', '']),
      new Word('dog', [false, false, false], ['', '', '', ''], ['', '', ''])
    ];

    reviewInteraction = new ReviewPronunciationInteraction(testWords, wordSayer);

    // Create test double for reviewStateFileLoader
    reviewStateFileLoader = jest.fn();
  });

  describe('Drag and Drop', () => {
    it('handles drag over event', () => {
      render(
        <ReviewActionControls
          reviewInteraction={reviewInteraction}
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
        <ReviewActionControls
          reviewInteraction={reviewInteraction}
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
        <ReviewActionControls
          reviewInteraction={reviewInteraction}
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
        <ReviewActionControls
          reviewInteraction={reviewInteraction}
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
        <ReviewActionControls
          reviewInteraction={reviewInteraction}
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
