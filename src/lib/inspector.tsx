import React from 'react';
import { observer } from 'mobx-react-lite';

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
 * hovering over the wrapped component will show a red border and display the provided label.
 * 
 * @param label - The label to display when hovering in inspector mode
 * @param children - The React children to wrap with inspection capabilities
 */
interface InspectableProps {
  label: string;
  children: React.ReactNode;
}

export const Inspectable: React.FC<InspectableProps> = observer(({ label, children }) => {
  return (
    <div className="inspectable">
      <div className="label">{label}</div>
      {children}
    </div>
  );
});

/**
 * @deprecated Use <Inspectable label="ComponentName"> instead
 * Wrapper function that makes a React component inspectable in inspector mode.
 */
export function inspectable<P extends Record<string, any>>(
  label: string,
  Component: React.FC<P>
): React.FC<P> {
  const InspectableComponent: React.FC<P> = (props) => {
    return (
      <Inspectable label={label}>
        <Component {...props} />
      </Inspectable>
    );
  };

  // Set display name for debugging
  InspectableComponent.displayName = `Inspectable(${Component.displayName || Component.name || 'Component'})`;

  return InspectableComponent;
}


// Export the inspector store for convenience
export { inspectorStore } from './inspector-store';