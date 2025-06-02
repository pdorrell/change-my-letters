/**
 * Options for button actions
 */
export interface ButtonActionOptions {
  /**
   * Optional tooltip text for the action
   */
  tooltip?: string;

  /**
   * Optional handler for pressing the button
   */
  onPress?: () => void;
}

/**
 * Class for button actions
 */
export class ButtonAction {
  /**
   * Optional tooltip text for the action
   */
  readonly tooltip?: string;

  /**
   * Optional handler for pressing the button
   */
  readonly onPress?: () => void;

  /**
   * Create a new button action
   * @param handler The handler function, or null if the action is disabled
   * @param options Optional settings for the action
   */
  constructor(
    private handler: (() => void) | null,
    options: ButtonActionOptions = {}
  ) {
    this.tooltip = options.tooltip;
    this.onPress = options.onPress;
  }

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
