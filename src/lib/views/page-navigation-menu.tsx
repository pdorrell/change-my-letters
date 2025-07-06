import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { SubPageModel, PageType } from '@/lib/models/sub-page-model';
import { Inspectable } from '@/lib/inspector';

interface PageNavigationMenuProps<T extends PageType> {
  subPageModel: SubPageModel<T>;
  className?: string;
}

export const PageNavigationMenu = observer(<T extends PageType>({
  subPageModel,
  className
}: PageNavigationMenuProps<T>) => {
  const allTypes = subPageModel.getAllSubPageTypes();

  return (
    <Inspectable name="PageNavigationMenu" lib>
      <div className={clsx('page-navigation-tabs', className)}>
        {allTypes.map((pageType) => {
          const config = subPageModel.configs[pageType];
          const isActive = subPageModel.subPage.value === pageType;

          return (
            <button
              key={pageType}
              className={clsx('page-tab', { active: isActive })}
              onClick={isActive ? undefined : () => subPageModel.subPage.set(pageType)}
              title={`Switch to ${config.label}`}
              disabled={isActive}
            >
              {config.shortLabel || config.label}
            </button>
          );
        })}
      </div>
    </Inspectable>
  );
});
