import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

interface GroupRightProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Layout component that groups items and pushes them to the right side
 * of their parent container using margin-left: auto.
 *
 * Features:
 * - Flex container with row layout and center justification
 * - Uses margin-left: auto to push content to the right
 * - Other items in the parent container will be pushed to the left
 * - Useful for creating right-aligned button groups or controls
 */
export const GroupRight: React.FC<GroupRightProps> = observer(({ children, className }) => {
  return (
    <div className={clsx('group-right', className)}>
      {children}
    </div>
  );
});
