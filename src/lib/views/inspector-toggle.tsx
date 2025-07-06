import React from 'react';
import { observer } from 'mobx-react-lite';
import { inspectorStore } from '@/lib/inspector-store';

/**
 * Toggle component for enabling/disabling inspector mode
 */
export const InspectorToggle: React.FC = observer(() => {
  return (
    <label style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 10000,
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '5px 10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '0.8em',
      cursor: 'pointer'
    }}>
      <input
        type="checkbox"
        checked={inspectorStore.inspectorEnabled}
        onChange={(e) => inspectorStore.setInspectorEnabled(e.target.checked)}
        style={{ marginRight: '5px' }}
      />
      Inspector Mode
    </label>
  );
});
