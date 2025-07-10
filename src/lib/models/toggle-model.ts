import { makeAutoObservable } from 'mobx';

export interface ToggleTooltips {
  on: string;
  off: string;
}

export class ToggleModel {
  value: boolean;
  tooltips: ToggleTooltips;

  constructor(initialValue: boolean, tooltips: ToggleTooltips) {
    this.value = initialValue;
    this.tooltips = tooltips;
    makeAutoObservable(this);
  }

  toggle(): void {
    this.value = !this.value;
  }

  setValue(value: boolean): void {
    this.value = value;
  }

  get currentTooltip(): string {
    return this.value ? this.tooltips.off : this.tooltips.on;
  }
}
