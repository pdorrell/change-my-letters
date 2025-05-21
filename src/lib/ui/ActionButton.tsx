import React from 'react';
import { ButtonAction } from './actions';

/**
 * Props for the ActionButton component
 */
export interface ActionButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick' | 'title'> {
  /**
   * The action to perform when the button is clicked
   */
  action: ButtonAction;
}

/**
 * A button that performs an action when clicked
 */
export const ActionButton = React.forwardRef<
  HTMLButtonElement,
  ActionButtonProps
>(({ action, ...props }, ref) => {
  const handleClick = () => {
    action.doAction();
  };
  
  const handleMouseDown = () => {
    // Execute onPress handler if it exists
    if (action.onPress) {
      action.onPress();
    }
  };
  
  return (
    <button
      ref={ref}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      disabled={!action.enabled}
      title={action.tooltip}
      {...props}
    />
  );
});

// Add a display name for better debugging and to satisfy the react/display-name rule
ActionButton.displayName = 'ActionButton';