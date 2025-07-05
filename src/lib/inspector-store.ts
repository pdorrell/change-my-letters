import { makeAutoObservable } from 'mobx';

/**
 * Store for managing inspector mode state
 */
class InspectorStore {
  inspectorEnabled = false;

  constructor() {
    makeAutoObservable(this);
  }

  setInspectorEnabled(enabled: boolean) {
    this.inspectorEnabled = enabled;
  }

  toggleInspector() {
    this.inspectorEnabled = !this.inspectorEnabled;
  }
}

export const inspectorStore = new InspectorStore();