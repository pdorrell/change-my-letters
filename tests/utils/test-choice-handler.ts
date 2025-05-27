export class TestChoiceHandler<T> {
  private _choices: T[] = [];

  get chooser(): (choice: T) => void {
    return (choice: T) => {
      this._choices.push(choice);
    };
  }

  get choices(): T[] {
    return [...this._choices];
  }

  get choice(): T {
    if (this._choices.length === 0) {
      throw new Error('No choices were made');
    }
    if (this._choices.length > 1) {
      throw new Error(`Multiple choices (${this._choices.length}) were made`);
    }
    return this._choices[0];
  }
}