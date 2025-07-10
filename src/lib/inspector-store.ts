import { ToggleModel } from './models/toggle-model';

/**
 * Store for managing inspector mode state
 */
class InspectorStore {
  inspectorToggle: ToggleModel;

  constructor() {
    this.inspectorToggle = new ToggleModel(false, {
      on: 'Turn On Inspector mode',
      off: 'Turn Off Inspector mode'
    });
  }

  get inspectorEnabled(): boolean {
    return this.inspectorToggle.value;
  }

  setInspectorEnabled(enabled: boolean) {
    this.inspectorToggle.setValue(enabled);
  }

  toggleInspector() {
    this.inspectorToggle.toggle();
  }
}

export const inspectorStore = new InspectorStore();
