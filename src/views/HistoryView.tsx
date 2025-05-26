import React from 'react';
import { observer } from 'mobx-react-lite';
import { History } from '../models/History';

/**
 * View component for displaying the word history
 */
interface HistoryViewProps { history: History; }

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
                appState.setCurrentWord(wordObj);
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

/**
 * Compact view component for displaying history inline
 */
interface CompactHistoryViewProps { history: History; }

export const CompactHistoryView: React.FC<CompactHistoryViewProps> = observer(({ history }) => {
  const appState = history.appState;
  
  return (
    <div className="compact-history-view">
      <div className="compact-history-title">History:</div>
      <div className="compact-history-list">
        {history.entries.map((entry, index) => (
          <span
            key={`compact-history-${index}`}
            className={`compact-history-word ${index === history.currentIndex ? 'current' : ''}`}
            onClick={() => {
              const wordObj = history.jumpToIndex(index);
              if (wordObj) {
                appState.setCurrentWord(wordObj);
              }
            }}
            title={entry.change ? 
              `${entry.change.type === 'delete_letter' ? `Deleted letter at position ${entry.change.position}` :
                entry.change.type === 'insert_letter' ? `Inserted ${entry.change.letter} at position ${entry.change.position}` :
                entry.change.type === 'replace_letter' ? `Replaced letter at position ${entry.change.position} with ${entry.change.letter}` :
                entry.change.type === 'upper_case_letter' ? `Uppercased letter at position ${entry.change.position}` :
                entry.change.type === 'lower_case_letter' ? `Lowercased letter at position ${entry.change.position}` : ''}`
              : 'Initial word'
            }
          >
            {entry.wordString}
          </span>
        ))}
      </div>
    </div>
  );
});

/**
 * Checkbox component for toggling compact history view
 */
interface ShowCompactHistoryCheckboxProps { history: History; }

export const ShowCompactHistoryCheckbox: React.FC<ShowCompactHistoryCheckboxProps> = observer(({ history }) => {
  return (
    <label className="show-history-container">
      <input
        type="checkbox"
        checked={history.showCompactHistory}
        onChange={() => history.toggleShowCompactHistory()}
      />
      Show History
    </label>
  );
});
