import React from 'react';
import { observer } from 'mobx-react-lite';
import { Pronunciation } from '@/models/pronunciation/pronunciation';
import { PageNavigationMenu } from '@/lib/views/page-navigation-menu';

interface PronunciationTypeNavigationProps {
  pronunciation: Pronunciation;
}

export const PronunciationTypeNavigation: React.FC<PronunciationTypeNavigationProps> = observer(({
  pronunciation
}) => {
  return <PageNavigationMenu subPageModel={pronunciation} />;
});
