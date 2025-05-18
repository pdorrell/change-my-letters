import '@testing-library/jest-dom';
import MockAudio from './mocks/audioMock';

// Mock the MobX functionality
jest.mock('mobx-react-lite', () => ({
  observer: (component: any) => component,
}));

// Mock the Audio class
global.Audio = MockAudio as any;