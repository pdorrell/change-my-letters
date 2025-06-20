export interface RangeSelectable {
    startSelection(index: number): void;
    updateSelection(index: number): void;
    finishSelection(): void | Promise<void>;
    clearSelection(): void;
    get canSelect(): boolean;
}
