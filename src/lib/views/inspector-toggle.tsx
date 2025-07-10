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
        zIndex: 10000,
        background: isEnabled ? '#dc3545' : 'white',
        padding: '0.1em 0.1em',
        borderRadius: '0.2em',
        border: '1px solid #ccc',
        fontSize: '1.1em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      🕵️
    </button>
  );
});
