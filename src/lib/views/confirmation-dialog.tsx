import React from 'react';
import { observer } from 'mobx-react-lite';
import { ValueModel } from '@/lib/models/value-models';

interface ConfirmationDialogProps { confirming: ValueModel<boolean>; question: string; operation: () => void; }

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = observer(({ confirming, question, operation }) => {
  if (!confirming.value) {
    return null;
  }

  const handleYes = () => {
    operation();
    confirming.set(false);
  };

  const handleNo = () => {
    confirming.set(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      confirming.set(false);
    }
  };

  return (
    <div className="confirmation-dialog-backdrop" onClick={handleBackdropClick}>
      <div className="confirmation-dialog">
        <div className="confirmation-question">
          {question}
        </div>
        <div className="confirmation-buttons">
          <button className="confirmation-button yes-button" onClick={handleYes}>
            Yes
          </button>
          <button className="confirmation-button no-button" onClick={handleNo}>
            No
          </button>
        </div>
      </div>
    </div>
  );
});
