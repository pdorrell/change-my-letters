export type PronunciationType = 'activity' | 'review';
export type PronunciationPageType = PronunciationType;

export interface PronunciationConfig {
  label: string;
  shortLabel: string;
}

export const PRONUNCIATION_CONFIGS: Record<PronunciationType, PronunciationConfig> = {
  'activity': { label: 'Pronunciation Activity', shortLabel: 'Activity' },
  'review': { label: 'Pronunciation Review', shortLabel: 'Review' }
};
