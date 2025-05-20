import React from 'react';
import { observer } from 'mobx-react-lite';
import { HistoryModel } from '../models/HistoryModel';

/**
 * View component for displaying the word history
 */
interface HistoryViewProps { history: HistoryModel; }

export const HistoryView: React.FC<HistoryViewProps> = observer(({ history }) => {
  // Now we can access appState through history
  const appState = history.appState;
  return (
    <div className="history-view">
      <h2>Word History</h2>
      <div className="history-list">
        {history.entries.map((entry, index) => (
          <div
            key={`history-${index}`}
            className={`history-item ${index === history.currentIndex ? 'current' : ''}`}
            onClick={() => {
              const wordObj = history.jumpToIndex(index);
              if (wordObj) {
                appState.setNewWord(wordObj);
                appState.navigateTo('wordView');
              }
            }}
          >
            <div className="history-word">{entry.wordString}</div>
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
