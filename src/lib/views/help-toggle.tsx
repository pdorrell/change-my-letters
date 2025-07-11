import React from 'react';
import { observer } from 'mobx-react-lite';
import { helpStore } from '@/lib/help-store';
import { ModeToggleButton } from '@/lib/components/mode-toggle-button';

/**
 * Toggle component for enabling/disabling help mode
 */
export const HelpToggle: React.FC = observer(() => {
  return (
    <ModeToggleButton
      model={helpStore.helpToggle}
      label="?"
      className="help"
      style={{ zIndex: 10000 }}
    />
  );
});
