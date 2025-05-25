import React from 'react';
import { observer } from 'mobx-react-lite';
import { ReviewPronunciationInteraction } from '../models/ReviewPronunciationInteraction';
import { ActionButton } from '../lib/ui/ActionButton';

interface ReviewPronunciationViewProps {
  reviewInteraction: ReviewPronunciationInteraction;
}

export const ReviewPronunciationView: React.FC<ReviewPronunciationViewProps> = observer(({ reviewInteraction }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files.find(f => f.name === 'review-pronunciation-state.json');
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          reviewInteraction.setReviewState(jsonData);
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('Error parsing JSON file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please drop a file named "review-pronunciation-state.json"');
    }
  };

  return (
    <div className="review-pronunciation-container">
      <h2>Review Pronunciation</h2>
      
      {/* Action Buttons Panel */}
      <div className="action-buttons-panel">
        <div 
          className="load-state-button-container"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <ActionButton action={reviewInteraction.loadStateAction}>
            Load State
          </ActionButton>
          <span className="drop-hint">(or drag & drop)</span>
        </div>
        
        <ActionButton action={reviewInteraction.saveStateAction}>
          Save State
        </ActionButton>
        
        <ActionButton action={reviewInteraction.downloadWrongWordsAction}>
          Download Wrong Words
        </ActionButton>
        
        <ActionButton action={reviewInteraction.resetAllToUnreviewedAction}>
          Reset All to Unreviewed
        </ActionButton>
        
        <ActionButton action={reviewInteraction.resetAllToOKAction}>
          Reset All to OK
        </ActionButton>
        
        <ActionButton action={reviewInteraction.reviewWrongWordsAction}>
          Review Wrong Words
        </ActionButton>
      </div>

      {/* Just Reviewed Word Panel */}
      {reviewInteraction.currentReviewWord && (
        <div className="just-reviewed-panel">
          <h3>Just Reviewed</h3>
          <div className="current-review-word">
            <span 
              className={`word-span ${
                reviewInteraction.currentReviewWord.soundsWrong ? 'wrong' : 'ok'
              } current-review`}
            >
              {reviewInteraction.currentReviewWord.word}
            </span>
            
            <div className="review-buttons">
              <ActionButton action={reviewInteraction.markSoundsWrongAction}>
                Sounds Wrong
              </ActionButton>
              
              <ActionButton action={reviewInteraction.markOKAction}>
                Sounds OK
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      <div className="filter-panel">
        <h3>Filter</h3>
        
        <div className="filter-controls">
          <div className="filter-text">
            <label htmlFor="filter-input">Filter text:</label>
            <input
              id="filter-input"
              type="text"
              value={reviewInteraction.filter}
              onChange={(e) => reviewInteraction.setFilter(e.target.value)}
              placeholder="Enter filter text..."
            />
          </div>
          
          <div className="match-start">
            <label>
              <input
                type="checkbox"
                checked={reviewInteraction.matchStartOnly}
                onChange={(e) => reviewInteraction.setMatchStartOnly(e.target.checked)}
              />
              Match start only
            </label>
          </div>
          
          <div className="review-state-filter">
            <label htmlFor="review-state-select">Review state:</label>
            <select
              id="review-state-select"
              value={reviewInteraction.reviewStateFilterOptions.indexOf(reviewInteraction.reviewStateFilter)}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                reviewInteraction.setReviewStateFilter(reviewInteraction.reviewStateFilterOptions[index]);
              }}
            >
              {reviewInteraction.reviewStateFilterOptions.map((option, index) => (
                <option key={index} value={index}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filtered Words */}
      <div className="filtered-words">
        <h3>Words ({reviewInteraction.filteredWords.length})</h3>
        
        <div className="words-grid">
          {reviewInteraction.filteredWords.map(word => {
            const isCurrentReview = word.currentReview;
            const isReviewed = word.reviewed && !word.soundsWrong;
            const isWrong = word.soundsWrong;
            
            let className = 'word-span';
            if (isWrong) {
              className += isCurrentReview ? ' wrong current-review' : ' wrong';
            } else if (isReviewed) {
              className += isCurrentReview ? ' ok current-review' : ' ok';
            } else if (isCurrentReview) {
              className += ' current-review';
            }
            
            return (
              <span
                key={word.word}
                className={className}
                onClick={() => reviewInteraction.reviewWord(word.word)}
              >
                {word.word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
});