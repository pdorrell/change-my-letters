import React from 'react';
import { observer } from 'mobx-react-lite';
import { inspectorStore } from '@/lib/inspector-store';

/**
 * Toggle component for enabling/disabling inspector mode
 */
export const InspectorToggle: React.FC = observer(() => {
  const isEnabled = inspectorStore.inspectorEnabled;
  return (
    <button
      onClick={() => inspectorStore.setInspectorEnabled(!isEnabled)}
      title={isEnabled ? 'Turn Off Inspector mode' : 'Turn On Inspector mode'}
      style={{
        position: 'fixed',
        top: '80px',
        right: '10px',
        zIndex: 10000,
        background: isEnabled ? '#dc3545' : 'white',
        padding: '8px 10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '1.2em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '40px',
        minHeight: '40px'
      }}
    >
      🕵️
    </button>
  );
});
