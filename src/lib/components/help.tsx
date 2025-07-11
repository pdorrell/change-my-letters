import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { helpStore } from '@/lib/help-store';

interface HelpContentProps {
  helpText: React.ReactNode;
  title: string;
  onClose: () => void;
}

const HelpDisplay: React.FC<HelpContentProps> = observer(({ helpText, title, onClose }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const helpDisplayRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Calculate offset from mouse position to current element position
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
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

  // Touch event handlers for iOS Safari where mouse events don't work for dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    // Calculate offset from touch position to current element position
    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    if (!touch) return;

    setPosition({
      x: touch.clientX - dragOffset.x,
      y: touch.clientY - dragOffset.y
    });
    e.preventDefault(); // Prevent scrolling
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="help-backdrop"
        onClick={onClose}
      />
      {/* Help Display */}
      <div
        ref={helpDisplayRef}
        className={clsx('help-display', {
          'help-display--dragging': isDragging
        })}
        style={{
          top: position.y,
          left: position.x
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={clsx('help-drag-handle', {
            'help-drag-handle--dragging': isDragging
          })}
        >
          <span className="help-title">
            <span className="help-title-icon">?</span>
            <span className="help-title-text">{title}</span>
          </span>
          <button
            onClick={onClose}
            className="help-close-button"
            title="Close help"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="help-content">
          {helpText}
        </div>
      </div>
    </>
  );
});

interface HelpableProps {
  children: React.ReactNode;
  title: string;
}

// This component wraps panels that contain Help elements
export const Helpable: React.FC<HelpableProps> = observer(({ children, title }) => {
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
    <div className="help-trigger-container">
      {/* Help Question Mark */}
      <button
        onClick={() => setShowHelp(true)}
        className="help-trigger-button"
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
          title={title}
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
