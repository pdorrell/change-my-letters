import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { helpStore } from '@/lib/help-store';

interface HelpContentProps {
  helpText: React.ReactNode;
  onClose: () => void;
}

const HelpDisplay: React.FC<HelpContentProps> = observer(({ helpText, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 20000
        }}
        onClick={onClose}
      />
      {/* Help Display */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '2px solid var(--help-mode-color)',
          borderRadius: '8px',
          padding: '16px',
          margin: '8px',
          zIndex: 20001,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, paddingRight: '16px' }}>
            {helpText}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px',
              color: '#666'
            }}
            title="Close help"
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
});

interface HelpableProps {
  children: React.ReactNode;
}

// This component wraps panels that contain Help elements
export const Helpable: React.FC<HelpableProps> = observer(({ children }) => {
  const [showHelp, setShowHelp] = useState(false);
  if (!helpStore.helpEnabled) {
    return <>{children}</>;
  }

  // Extract Help elements from children
  const helpElements: React.ReactNode[] = [];
  const otherChildren: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === Help) {
      helpElements.push(child.props.children);
    } else {
      otherChildren.push(child);
    }
  });

  // If no help content found, just render children
  if (helpElements.length === 0) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Help Question Mark */}
      <button
        onClick={() => setShowHelp(true)}
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          backgroundColor: 'var(--help-mode-color)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          fontSize: '14px',
          cursor: 'pointer',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Show help"
      >
        ?
      </button>

      {/* Panel Content */}
      {otherChildren}

      {/* Help Display */}
      {showHelp && (
        <HelpDisplay
          helpText={helpElements}
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
});

// Simple Help component to contain help text
interface HelpProps {
  children: React.ReactNode;
}

export const Help: React.FC<HelpProps> = observer(({ children: _children }) => {
  // This component doesn't render anything itself
  // It's just a marker component that Helpable looks for
  return null;
});