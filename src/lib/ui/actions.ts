/**
 * Class for button actions
 */
export class ButtonAction {
  /**
   * Create a new button action
   * @param handler The handler function, or null if the action is disabled
   * @param tooltip Optional tooltip text for the action
   */
  constructor(
    private handler: (() => void) | null,
    readonly tooltip?: string
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
