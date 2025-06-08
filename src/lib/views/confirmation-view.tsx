import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ConfirmationModel, Confirmable } from '@/lib/models/confirmation';

interface ConfirmationViewProps {
  confirmationModel: ConfirmationModel;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = observer(({ confirmationModel }) => {
  if (!confirmationModel.confirmable) {
    return null;
  }

  return (
    <ConfirmationDialog
      confirmationModel={confirmationModel}
      confirmable={confirmationModel.confirmable}
    />
  );
});

interface ConfirmationDialogProps {
  confirmationModel: ConfirmationModel;
  confirmable: Confirmable;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = observer(({ confirmationModel, confirmable }) => {
  const handleConfirm = async () => {
    await confirmationModel.confirm();
  };

  const handleCancel = () => {
    confirmationModel.cancel();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      confirmationModel.cancel();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      confirmationModel.cancel();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="confirmation-dialog-backdrop" onClick={handleBackdropClick}>
      <div className="confirmation-dialog">
        <div className="confirmation-question">
          {confirmable.confirmationRequest.request}
        </div>
        <div className="confirmation-buttons">
          <button
            className="confirmation-button confirm-button"
            onClick={handleConfirm}
            autoFocus
          >
            {confirmable.confirmationRequest.confirmLabel}
          </button>
          <button
            className="confirmation-button cancel-button"
            onClick={handleCancel}
          >
            {confirmable.confirmationRequest.cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
});
