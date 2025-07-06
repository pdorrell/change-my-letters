import { makeAutoObservable } from 'mobx';
import { PronunciationPageType, PRONUNCIATION_CONFIGS } from './pronunciation-types';
import { SubPageModel, SubPageConfig } from '@/lib/models/sub-page-model';
import { ValueModel } from '@/lib/models/value-models';

export class Pronunciation implements SubPageModel<PronunciationPageType> {
  subPage: ValueModel<PronunciationPageType>;
  configs: Record<PronunciationPageType, SubPageConfig>;

  constructor() {
    this.subPage = new ValueModel<PronunciationPageType>('activity', 'Pronunciation Type', 'Select between activity and review modes');
    this.configs = {
      'activity': { label: PRONUNCIATION_CONFIGS['activity'].label, shortLabel: PRONUNCIATION_CONFIGS['activity'].shortLabel },
      'review': { label: PRONUNCIATION_CONFIGS['review'].label, shortLabel: PRONUNCIATION_CONFIGS['review'].shortLabel }
    };
    makeAutoObservable(this);
  }

  getAllSubPageTypes(): PronunciationPageType[] {
    return ['activity', 'review'];
  }

  get currentPronunciationType(): PronunciationPageType {
    return this.subPage.value;
  }

  setPronunciationType(type: PronunciationPageType): void {
    this.subPage.set(type);
  }
}
