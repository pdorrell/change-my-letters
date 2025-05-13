import React from 'react';
import { observer } from 'mobx-react-lite';
import { HistoryModel } from '../models/HistoryModel';
import { AppState } from '../models/AppState';

interface HistoryViewProps {
  history: HistoryModel;
  appState: AppState; // We need appState for navigation and setting the new word
}

/**
 * View component for displaying the word history
 */
export const HistoryView: React.FC<HistoryViewProps> = observer(({ history, appState }) => {
  return (
    <div className="history-view">
      <h2>Word History</h2>
      <div className="history-list">
        {history.entries.map((entry, index) => (
          <div
            key={`history-${index}`}
            className={`history-item ${index === history.currentIndex ? 'current' : ''}`}
            onClick={() => {
              const word = history.jumpToIndex(index);
              if (word) {
                appState.setNewWord(word);
                appState.navigateTo('wordView');
              }
            }}
          >
            <div className="history-word">{entry.word}</div>
            {entry.change && (
              <div className="history-change">
                {entry.change.type === 'delete_letter' && `Deleted letter at position ${entry.change.position}`}
                {entry.change.type === 'insert_letter' && `Inserted ${entry.change.letter} at position ${entry.change.position}`}
                {entry.change.type === 'replace_letter' && `Replaced letter at position ${entry.change.position} with ${entry.change.letter}`}
                {entry.change.type === 'upper_case_letter' && `Uppercased letter at position ${entry.change.position}`}
                {entry.change.type === 'lower_case_letter' && `Lowercased letter at position ${entry.change.position}`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});