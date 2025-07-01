import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { AppState } from '@/models/app-state';
import { PronunciationTypeNavigation } from './pronunciation-type-navigation';
import { PronunciationActivityPage } from './pronunciation-activity-page';
import { PronunciationReviewPage } from './pronunciation-review-page';

/**
 * Full page component for Pronunciation page with sub-page navigation
 */
interface PronunciationPageProps { appState: AppState; }

export const PronunciationPage: React.FC<PronunciationPageProps> = observer(({ appState }) => {
  // Local state for pronunciation type (activity vs review)
  const [pronunciationType, setPronunciationType] = useState<'activity' | 'review'>('activity');

  return (
    <>
      <div className="pronunciation-header">
        <PronunciationTypeNavigation
          pronunciationType={pronunciationType}
          onTypeChange={setPronunciationType}
        />
      </div>
      {pronunciationType === 'activity' && (
        <PronunciationActivityPage pronunciation={appState.activityPronunciation} />
      )}
      {pronunciationType === 'review' && (
        <PronunciationReviewPage pronunciation={appState.reviewPronunciation} />
      )}
    </>
  );
});
