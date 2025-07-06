import { makeAutoObservable, computed } from 'mobx';
import { FinderType, FinderPageType, FINDER_CONFIGS } from './finder-types';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { EmotionalWordSayer } from '@/models/audio/emotional-word-sayer';
import { HappyOrSad } from '@/models/audio/emotion-types';
import { SubPageModel, SubPageConfig } from '@/lib/models/sub-page-model';
import { ValueModel } from '@/lib/models/value-models';

export class Finders implements SubPageModel<FinderPageType> {
  subPage: ValueModel<FinderPageType>;
  configs: Record<FinderPageType, SubPageConfig>;

  constructor(
    public readonly wordSayer: WordSayerInterface,
    public readonly emotionalWordSayer: EmotionalWordSayer<HappyOrSad>,
    public readonly getRandomWords: () => string[]
  ) {
    this.subPage = new ValueModel<FinderPageType>('word-choice', 'Finder Type', 'Select the type of finder to use');
    this.configs = {
      'word-choice': { label: FINDER_CONFIGS['word-choice'].label, shortLabel: FINDER_CONFIGS['word-choice'].shortLabel },
      'words-in-row': { label: FINDER_CONFIGS['words-in-row'].label, shortLabel: FINDER_CONFIGS['words-in-row'].shortLabel }
    };
    makeAutoObservable(this, {
      allFinderTypes: computed
    });
  }

  setFinderType(finderType: FinderType): void {
    this.subPage.set(finderType);
  }

  getAllSubPageTypes(): FinderPageType[] {
    return ['word-choice', 'words-in-row'];
  }

  get currentFinderType(): FinderType {
    return this.subPage.value;
  }

  /**
   * Get all finder types with their config and active status
   */
  get allFinderTypes(): Array<{ finderType: FinderType; label: string; shortLabel: string; isActive: boolean }> {
    const finderTypeOrder: FinderType[] = ['word-choice', 'words-in-row'];
    return finderTypeOrder.map(finderType => ({
      finderType,
      label: FINDER_CONFIGS[finderType].label,
      shortLabel: FINDER_CONFIGS[finderType].shortLabel,
      isActive: finderType === this.currentFinderType
    }));
  }
}
