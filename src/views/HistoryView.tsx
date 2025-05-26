import React from 'react';
import { observer } from 'mobx-react-lite';
import { History } from '../models/History';

interface CompactHistoryViewProps { history: History; }

export const CompactHistoryView: React.FC<CompactHistoryViewProps> = observer(({ history }) => {
  const handleHistoryClick = (index: number) => {
    const word = history.jumpToIndex(index);
    if (word) {
      history.appState.setCurrentWord(word);
    }
  };

  return (
    <div className="compact-history-view">
      <div className="history-summary">
        History ({history.entries.length} words):
      </div>
      <div className="history-words">
        {history.entries.map((entry, index) => (
          <span
            key={index}
            className={`history-word ${index === history.currentIndex ? 'current' : ''} ${
              history.hasVisited(entry.word) ? 'visited' : 'unvisited'
            }`}
            onClick={() => handleHistoryClick(index)}
            title={`Go to word '${entry.wordString}'`}
          >
            {entry.wordString}
          </span>
        ))}
      </div>
    </div>
  );
});