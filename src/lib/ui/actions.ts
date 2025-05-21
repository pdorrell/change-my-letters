import React from 'react';

/**
 * Interface for button actions
 */
export interface ButtonActionInterface {
  /**
   * Whether the action is enabled
   */
  get enabled(): boolean;

  /**
   * Perform the action
   * @param event The mouse event from the button click
   */
  do_action(event: React.MouseEvent<HTMLButtonElement>): void;
}

/**
 * Button action that handles the event
 */
export class EventedButtonAction implements ButtonActionInterface {
  /**
   * Create a new evented button action
   * @param handler The handler function for the event, or null if the action is disabled
   */
  constructor(
    private handler: ((event: React.MouseEvent<HTMLButtonElement>) => void) | null
  ) {}

  /**
   * Whether the action is enabled
   */
  get enabled(): boolean {
    return this.handler !== null;
  }

  /**
   * Perform the action
   * @param event The mouse event from the button click
   */
  do_action(event: React.MouseEvent<HTMLButtonElement>): void {
    if (this.handler) {
      this.handler(event);
    }
  }
}

/**
 * Button action that ignores the event
 */
export class ButtonAction implements ButtonActionInterface {
  /**
   * Create a new button action
   * @param handler The handler function, or null if the action is disabled
   */
  constructor(
    private handler: (() => void) | null
  ) {}

  /**
   * Whether the action is enabled
   */
  get enabled(): boolean {
    return this.handler !== null;
  }

  /**
   * Perform the action
   * @param event The mouse event from the button click (ignored)
   */
  do_action(_event: React.MouseEvent<HTMLButtonElement>): void {
    if (this.handler) {
      this.handler();
    }
  }
}
