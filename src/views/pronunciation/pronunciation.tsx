import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppState } from '@/models/app-state';
import { PronunciationTypeNavigation } from './pronunciation-type-navigation';
import { PronunciationActivityPage } from './pronunciation-activity-page';
import { PronunciationReviewPage } from './pronunciation-review-page';
import { Inspectable } from '@/lib/inspector';

/**
 * Full page component for Pronunciation page with sub-page navigation
 */
interface PronunciationPageProps { appState: AppState; }

export const PronunciationPage: React.FC<PronunciationPageProps> = observer(({ appState }) => {
  const currentType = appState.pronunciation.currentPronunciationType;

  return (
    <Inspectable label="PronunciationPage">
      <>
        <div className="pronunciation-header">
          <PronunciationTypeNavigation
            pronunciation={appState.pronunciation}
          />
        </div>
        {currentType === 'activity' && (
          <PronunciationActivityPage pronunciation={appState.activityPronunciation} />
        )}
        {currentType === 'review' && (
          <PronunciationReviewPage pronunciation={appState.reviewPronunciation} />
        )}
      </>
    </Inspectable>
  );
});
