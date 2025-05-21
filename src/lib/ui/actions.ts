/**
 * Class for button actions
 */
export class ButtonAction {
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
