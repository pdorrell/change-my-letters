import { ValueModel } from './value-models';

export type PageType = string;

export interface SubPageConfig {
  label: string;
  shortLabel?: string;
}

export interface SubPageModel<T extends PageType> {
  subPage: ValueModel<T>;
  configs: Record<T, SubPageConfig>;
  getAllSubPageTypes(): T[];
}
