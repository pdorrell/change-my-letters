import React from 'react';
import { observer } from 'mobx-react-lite';

interface PanelProps {
  children: React.ReactNode;
}

/**
 * Generic panel component with the same layout as word-outer-container
 * but with transparent background and no border
 */
export const Panel: React.FC<PanelProps> = observer(({ children }) => {
  return (
    <div className="panel">
      {children}
    </div>
  );
});
