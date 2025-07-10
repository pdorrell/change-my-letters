import React from 'react';
import { observer } from 'mobx-react-lite';
import { inspectorStore } from './inspector-store';

/**
 * Inspector Tool for React Components
 *
 * This tool allows you to add visual inspection capabilities to React components.
 * When inspector mode is enabled, hovering over inspectable components will show:
 * - A bright red border around the component
 * - A label showing the component name in the top-left corner
 *
 * Usage:
 * 1. Wrap your component function with `inspectable('ComponentName', ...)`
 * 2. Toggle inspector mode using the InspectorToggle component or programmatically
 * 3. Hover over components to see their labels
 *
 * Example:
 * ```typescript
 * const MyComponentImpl: React.FC<Props> = ({ prop1, prop2 }) => {
 *   return <div>Component content</div>;
 * };
 *
 * export const MyComponent: React.FC<Props> =
 *   inspectable('MyComponent', observer(MyComponentImpl));
 * ```
 *
 * IMPORTANT: The first parameter MUST match the exported component name
 * for consistency and debugging purposes.
 *
 * Note: There will be a slight layout shift when hovering due to the 1px border,
 * but this is intentional for the inspection functionality.
 */

/**
 * Component that makes its children inspectable in inspector mode.
 *
 * When the application is in inspector mode (has 'inspector' CSS class on top-level element),
 * hovering over the wrapped component will show a border and display the provided name.
 *
 * @param name - The name to display when hovering in inspector mode
 * @param lib - Whether this is a lib component (blue styling) vs app component (red styling)
 * @param children - The React children to wrap with inspection capabilities
 */
interface InspectableProps {
  name: string;
  lib?: boolean;
  children: React.ReactNode;
}

export const Inspectable: React.FC<InspectableProps> = observer(({ name, lib = false, children }) => {
  const { inspectorEnabled } = inspectorStore;

  if (!inspectorEnabled) {
    return <>{children}</>;
  }

  return (
    <div className={`inspectable ${lib ? 'lib' : ''}`}>
      <div className="label">{name}</div>
      {children}
    </div>
  );
});

// Export the inspector store for convenience
export { inspectorStore } from './inspector-store';
