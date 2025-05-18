/**
 * Mock implementation for HTMLAudioElement
 */
class MockAudio {
  src: string;
  eventListeners: { [event: string]: Array<(e: any) => void> } = {};
  
  constructor(src?: string) {
    this.src = src || '';
  }

  // Mock methods
  load(): void {
    // Do nothing - this is a mock
  }

  play(): Promise<void> {
    return Promise.resolve();
  }

  addEventListener(type: string, listener: (e: any) => void): void {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (e: any) => void): void {
    if (this.eventListeners[type]) {
      const index = this.eventListeners[type].indexOf(listener);
      if (index !== -1) {
        this.eventListeners[type].splice(index, 1);
      }
    }
  }
}

export default MockAudio;