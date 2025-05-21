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
   */
  doAction(): void;
}

/**
 * Implementation of ButtonActionInterface
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
   */
  doAction(): void {
    if (this.handler) {
      this.handler();
    }
  }
}
