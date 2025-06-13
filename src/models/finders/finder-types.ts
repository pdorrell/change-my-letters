export type FinderType = 'word-choice';

export interface FinderConfig {
  label: string;
  shortLabel: string;
}

export const FINDER_CONFIGS: Record<FinderType, FinderConfig> = {
  'word-choice': { label: 'Word Choice Finder', shortLabel: 'Word Choice' }
};
