import '@testing-library/jest-dom';

// Mock the MobX functionality
jest.mock('mobx-react-lite', () => ({
  observer: (component: any) => component,
}));