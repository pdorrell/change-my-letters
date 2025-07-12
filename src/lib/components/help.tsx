import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import dedent from 'dedent';
import { helpStore } from '@/lib/help-store';

interface HelpContentProps {
  helpText: string;
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
          <ReactMarkdown>{dedent(helpText)}</ReactMarkdown>
        </div>
      </div>
    </>
  );
});

// Help component that renders its own trigger and modal
interface HelpProps {
  children: string;
  title: string;
}

export const Help: React.FC<HelpProps> = observer(({ children, title }) => {
  const [showHelp, setShowHelp] = useState(false);

  // Don't render anything if help is disabled
  if (!helpStore.helpEnabled) {
    return null;
  }

  return (
    <>
      {/* Help Question Mark */}
      <button
        onClick={() => setShowHelp(true)}
        className="help-trigger-button"
        title="Show help"
      >
        ?
      </button>

      {/* Help Display */}
      {showHelp && (
        <HelpDisplay
          helpText={children}
          title={title}
          onClose={() => setShowHelp(false)}
        />
      )}
    </>
  );
});
