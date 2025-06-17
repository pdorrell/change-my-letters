export interface InteractionOptions {
  disabled?: boolean;
  showChangeHints?: boolean;
  alwaysInteract?: boolean;
}

export const DEFAULT_INTERACTION_OPTIONS: InteractionOptions = {
  disabled: false,
  showChangeHints: true,
  alwaysInteract: false
};
