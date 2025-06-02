import '@testing-library/jest-dom';
import failOnConsole from 'jest-fail-on-console';

// Mock the MobX functionality

// Make tests fail on console warnings and errors
failOnConsole({
  shouldFailOnWarn: true,
  shouldFailOnError: true,
  shouldFailOnLog: false, // Allow console.log
  shouldFailOnInfo: false, // Allow console.info
  shouldFailOnDebug: false, // Allow console.debug

  // Allow specific React testing warnings that are common in testing environments
  silenceMessage: (message: string) => {
    // Allow React testing warnings about act() wrapping
    if (message.includes('was not wrapped in act(...)')) {
      return true;
    }

    // Allow other React testing warnings if needed
    if (message.includes('Warning: ReactDOM.render is no longer supported')) {
      return true;
    }

    return false;
  }
});
