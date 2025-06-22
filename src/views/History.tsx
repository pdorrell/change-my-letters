import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { History } from '@/models/History';

interface HistoryPanelProps { history: History; }

export const HistoryPanel: React.FC<HistoryPanelProps> = observer(({ history }) => {
  const handleHistoryClick = (index: number) => {
    const word = history.jumpToIndex(index);
    if (word) {
      history.wordStateManager.setWordChanger(word);
    }
  };

  return (
    <div className="history-panel touch-interactive-area">
      <div className="history-panel-list">
        {history.entries.map((entry, index) => (
          <span
            key={index}
            className={clsx('history-panel-word', {
              current: index === history.currentIndex,
              visited: history.hasVisited(entry.word),
              unvisited: !history.hasVisited(entry.word)
            })}
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
