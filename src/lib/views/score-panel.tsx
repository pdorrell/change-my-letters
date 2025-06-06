import React from 'react';
import { observer } from 'mobx-react-lite';
import { ScoreModel } from '@/lib/models/score-model';

interface ScorePanelProps { scoreModel: ScoreModel; }

export const ScorePanel: React.FC<ScorePanelProps> = observer(({ scoreModel }) => {
  return (
    <div className="score-panel">
      <div className="score-label-box">
        {scoreModel.label.map((line, index) => (
          <div key={index} className="score-label-line">{line}</div>
        ))}
      </div>
      <div className="score-rows">
        <div className="score-row correct-row">
          {Array.from({ length: scoreModel.correct }, (_, index) => (
            <div key={`correct-${index}`} className="score-square correct-square"></div>
          ))}
        </div>
        <div className="score-row incorrect-row">
          {Array.from({ length: scoreModel.incorrect }, (_, index) => (
            <div key={`incorrect-${index}`} className="score-square incorrect-square"></div>
          ))}
        </div>
      </div>
    </div>
  );
});
