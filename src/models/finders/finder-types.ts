export type FinderType = 'word-choice' | 'words-in-row' | 'words-in-grid';
export type FinderPageType = FinderType;

export interface FinderConfig {
  label: string;
  shortLabel: string;
}

export const FINDER_CONFIGS: Record<FinderType, FinderConfig> = {
  'word-choice': { label: 'Word Choice Finder', shortLabel: 'Word Choice' },
  'words-in-row': { label: 'Words In Row Finder', shortLabel: 'Words In Row' },
  'words-in-grid': { label: 'Words In Grid Finder', shortLabel: 'Words In Grid' }
};
