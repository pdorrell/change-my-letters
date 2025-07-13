import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { Inspectable } from '@/lib/inspector';
import { Help } from '@/lib/components/help';

interface PanelProps {
  children: React.ReactNode;
  visible?: boolean;
  left?: boolean;
  inspectorTitle: string;
  helpTitle?: string;
  helpContent?: string;
}

/**
 * Standardized panel component that provides consistent layout and styling
 * across the application. All panels fill the width of their container and
 * expand vertically to fit their content.
 *
 * Features:
 * - Transparent or visible (light gray with border) styling
 * - Integrated Help component support
 * - Integrated Inspectable component for debugging
 * - Position relative for proper Help button positioning
 */
export const Panel: React.FC<PanelProps> = observer(({
  children,
  visible = false,
  left = false,
  inspectorTitle,
  helpTitle,
  helpContent
}) => {
  return (
    <Inspectable name={inspectorTitle}>
      <div className={clsx('panel', {
        'panel--visible': visible,
        'panel--left': left
      })}>
        {helpTitle && helpContent && (
          <Help title={helpTitle}>{helpContent}</Help>
        )}
        {children}
      </div>
    </Inspectable>
  );
});
