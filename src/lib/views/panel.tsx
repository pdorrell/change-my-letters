import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { Inspectable } from '@/lib/inspector';

interface PanelProps {
  children: React.ReactNode;
  visible?: boolean;
  left?: boolean;
  inspectorTitle: string;
}

/**
 * Standardized panel component that provides consistent layout and styling
 * across the application. All panels fill the width of their container and
 * expand vertically to fit their content.
 *
 * Features:
 * - Transparent or visible (light gray with border) styling
 * - Integrated Inspectable component for debugging
 * - Position relative for proper component positioning
 */
export const Panel: React.FC<PanelProps> = observer(({
  children,
  visible = false,
  left = false,
  inspectorTitle
}) => {
  return (
    <Inspectable name={inspectorTitle}>
      <div className={clsx('panel', {
        'panel--visible': visible,
        'panel--left': left
      })}>
        {children}
      </div>
    </Inspectable>
  );
});
