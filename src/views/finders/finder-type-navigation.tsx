import React from 'react';
import { observer } from 'mobx-react-lite';
import { Finders } from '@/models/finders/finders';
import { PageNavigationMenu } from '@/lib/views/page-navigation-menu';

interface FinderTypeNavigationProps { finders: Finders; }

export const FinderTypeNavigation: React.FC<FinderTypeNavigationProps> = observer(({ finders }) => {
  return <PageNavigationMenu subPageModel={finders} />;
});
