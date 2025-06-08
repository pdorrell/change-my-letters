import { makeAutoObservable } from 'mobx';

export type Operation = () => void | Promise<void>;

export interface ConfirmationRequest {
  request: string;
  confirmLabel: string;
  cancelLabel: string;
}

export interface Confirmable {
  confirmationRequest: ConfirmationRequest;
  operation: Operation;
}

export class ConfirmationModel {
  confirmable: Confirmable | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async askForConfirmation(confirmationRequest: ConfirmationRequest, operation: Operation): Promise<void> {
    this.confirmable = {
      confirmationRequest,
      operation
    };
  }

  async askForConfirmationYesOrNo(question: string, operation: Operation): Promise<void> {
    const confirmationRequest: ConfirmationRequest = {
      request: question,
      confirmLabel: 'Yes',
      cancelLabel: 'No'
    };
    await this.askForConfirmation(confirmationRequest, operation);
  }

  async askForConfirmationOkOrCancel(proposedAction: string, operation: Operation): Promise<void> {
    const confirmationRequest: ConfirmationRequest = {
      request: proposedAction,
      confirmLabel: 'OK',
      cancelLabel: 'Cancel'
    };
    await this.askForConfirmation(confirmationRequest, operation);
  }

  async confirm(): Promise<void> {
    if (this.confirmable) {
      const operation = this.confirmable.operation;
      this.confirmable = null;
      await operation();
    }
  }

  cancel(): void {
    if (this.confirmable) {
      this.confirmable = null;
    }
  }
}
