import { ToggleModel } from './models/toggle-model';

/**
 * Store for managing help mode state
 */
class HelpStore {
  helpToggle: ToggleModel;

  constructor() {
    this.helpToggle = new ToggleModel(false, {
      on: 'Turn On Help mode',
      off: 'Turn Off Help mode'
    });
  }

  get helpEnabled(): boolean {
    return this.helpToggle.value;
  }

  setHelpEnabled(enabled: boolean) {
    this.helpToggle.setValue(enabled);
  }

  toggleHelp() {
    this.helpToggle.toggle();
  }
}

export const helpStore = new HelpStore();