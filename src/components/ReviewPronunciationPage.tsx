import React from 'react';
import { AppState } from '../models/AppState';
import { ReviewPronunciationView } from '../views/ReviewPronunciation';

interface ReviewPronunciationPageProps { appState: AppState; }

export const ReviewPronunciationPage: React.FC<ReviewPronunciationPageProps> = ({ appState }) => {
  return (
    <ReviewPronunciationView reviewInteraction={appState.reviewPronunciationInteraction} />
  );
};