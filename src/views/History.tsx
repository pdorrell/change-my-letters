import React from 'react';
import { observer } from 'mobx-react-lite';
import { History } from '@/models/History';

interface HistoryPanelProps { history: History; }

export const HistoryPanel: React.FC<HistoryPanelProps> = observer(({ history }) => {
  const handleHistoryClick = (index: number) => {
    const word = history.jumpToIndex(index);
    if (word) {
      history.appState.setCurrentWord(word);
    }
  };

  return (
    <div className="history-panel">
      <div className="history-panel-list">
        {history.entries.map((entry, index) => (
          <span
            key={index}
            className={`history-panel-word ${index === history.currentIndex ? 'current' : ''} ${
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
