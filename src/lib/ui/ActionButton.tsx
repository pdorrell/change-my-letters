import React from 'react';
import { ButtonAction } from './actions';

/**
 * Props for the ActionButton component
 */
export interface ActionButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick'> {
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
  
  return (
    <button
      ref={ref}
      onClick={handleClick}
      disabled={!action.enabled}
      {...props}
    />
  );
});

// Add a display name for better debugging and to satisfy the react/display-name rule
ActionButton.displayName = 'ActionButton';