import React from 'react';
import { observer } from 'mobx-react-lite';
import { Inspectable } from '@/lib/inspector';

/**
 * Generic Page component for consistent layout across all pages and sub-pages.
 *
 * Features:
 * - Maximum width of 850px or 100% viewport width, whichever is smaller
 * - Horizontally centered in the application container
 * - Flex container with column direction for vertical stacking of child components
 * - No margin, padding, border, or background for clean nesting
 * - Inspectable as a lib component
 */
interface PageProps {
  children: React.ReactNode;
  className?: string;
}

export const Page: React.FC<PageProps> = observer(({ children, className }) => {
  return (
    <Inspectable name="Page" lib>
      <div className={`page ${className || ''}`}>
        {children}
      </div>
    </Inspectable>
  );
});
