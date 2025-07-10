import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { helpStore } from '@/lib/help-store';

interface HelpContentProps {
  helpText: React.ReactNode;
  onClose: () => void;
}

const HelpDisplay: React.FC<HelpContentProps> = observer(({ helpText, onClose }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const helpDisplayRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!helpDisplayRef.current) return;
    const rect = helpDisplayRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y
    });
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

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
        ref={helpDisplayRef}
        style={{
          position: 'absolute',
          top: position.y,
          left: position.x,
          backgroundColor: 'white',
          border: '2px solid var(--help-mode-color)',
          borderRadius: '8px',
          margin: '8px',
          zIndex: 20001,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          minWidth: '300px',
          maxWidth: '500px',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            backgroundColor: 'var(--help-mode-color)',
            color: 'white',
            padding: '8px 16px',
            margin: '-2px -2px 0 -2px',
            borderRadius: '6px 6px 0 0',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none'
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Help</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              color: 'white',
              padding: '0 4px'
            }}
            title="Close help"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          {helpText}
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