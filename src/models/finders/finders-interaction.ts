import { makeAutoObservable, computed } from 'mobx';
import { FinderType, FINDER_CONFIGS } from './finder-types';
import { WordSayerInterface } from '@/models/word-sayer-interface';

export class FindersInteraction {
  currentFinderType: FinderType = 'word-choice';

  constructor(
    public readonly wordSayer: WordSayerInterface,
    public readonly happyWordSayer: WordSayerInterface,
    public readonly getRandomWords: () => string[]
  ) {
    makeAutoObservable(this, {
      allFinderTypes: computed
    });
  }

  setFinderType(finderType: FinderType): void {
    this.currentFinderType = finderType;
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
