import React from 'react';
import { observer } from 'mobx-react-lite';
import { inspectorStore } from '@/lib/inspector-store';
import { ModeToggleButton } from '@/lib/components/mode-toggle-button';

/**
 * Toggle component for enabling/disabling inspector mode
 */
export const InspectorToggle: React.FC = observer(() => {
  return (
    <ModeToggleButton
      model={inspectorStore.inspectorToggle}
      label="🕵️"
      activeColor="var(--inspector-mode-color)"
      style={{ zIndex: 10000 }}
    />
  );
});
