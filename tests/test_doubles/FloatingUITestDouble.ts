/**
 * Test double for @floating-ui/react
 * Provides minimal implementation to support component testing without mocking
 */

export interface FloatingUITestDouble {
  refs: {
    setFloating: (element: HTMLElement | null) => void;
  };
  floatingStyles: React.CSSProperties;
  context: any;
}

export interface UseInteractionsResult {
  getFloatingProps: () => Record<string, any>;
}

export const createFloatingUITestDouble = (): FloatingUITestDouble => {
  return {
    refs: {
      setFloating: () => {}, // No-op for tests
    },
    floatingStyles: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
    },
    context: {}, // Empty context object
  };
};

export const createUseInteractionsTestDouble = (): UseInteractionsResult => {
  return {
    getFloatingProps: () => ({}), // Return empty props object
  };
};

export const createUseDismissTestDouble = () => ({});
export const createUseRoleTestDouble = () => ({});