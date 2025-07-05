import React from 'react';

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
 * export const MyComponent: React.FC<Props> = observer(
 *   inspectable('MyComponent', MyComponentImpl)
 * );
 * ```
 * 
 * IMPORTANT: The first parameter MUST match the exported component name
 * for consistency and debugging purposes.
 * 
 * Note: There will be a slight layout shift when hovering due to the 1px border,
 * but this is intentional for the inspection functionality.
 */

/**
 * Wrapper function that makes a React component inspectable in inspector mode.
 * 
 * When the application is in inspector mode (has 'inspector' CSS class on top-level element),
 * hovering over the wrapped component will show a red border and display the provided label.
 * 
 * @param label - The label to display when hovering in inspector mode
 * @param Component - The React component function to wrap
 * @returns A new component wrapped with inspection capabilities
 */
export function inspectable<P extends Record<string, any>>(
  label: string,
  Component: React.FC<P>
): React.FC<P> {
  const InspectableComponent: React.FC<P> = (props) => {
    return (
      <div className="inspectable">
        <div className="label">{label}</div>
        <Component {...props} />
      </div>
    );
  };

  // Set display name for debugging
  InspectableComponent.displayName = `Inspectable(${Component.displayName || Component.name || 'Component'})`;

  return InspectableComponent;
}


// Export the inspector store for convenience
export { inspectorStore } from './inspector-store';