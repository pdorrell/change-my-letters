import { Word } from './word';

/**
 * Base class for all types of word changes
 */
export abstract class BaseChange {
  /**
   * The resulting Word after this change is applied
   */
  constructor(
    public readonly result: Word
  ) {}
}

/**
 * Base class for changes that involve a letter
 */
export abstract class LetterChange extends BaseChange {
  /**
   * The letter involved in this change
   */
  constructor(
    result: Word,
    public readonly letter: string
  ) {
    super(result);
  }
}

/**
 * Represents the result of deleting a letter
 */
export class DeleteChange extends BaseChange {
  constructor(result: Word) {
    super(result);
  }
}

/**
 * Represents the result of inserting a letter
 */
export class InsertChange extends LetterChange {
  constructor(
    result: Word,
    letter: string
  ) {
    super(result, letter);
  }
}

/**
 * Represents the result of replacing a letter
 */
export class ReplaceChange extends LetterChange {
  constructor(
    result: Word,
    letter: string
  ) {
    super(result, letter);
  }
}

/**
 * Represents all possible changes for a Word
 */
export class WordChanges {
  constructor(
    public deleteChanges: (DeleteChange | null)[] = [],
    public insertChanges: InsertChange[][] = [],
    public replaceChanges: ReplaceChange[][] = []
  ) {}
}

/**
 * Represents all possible changes for a Letter
 */
export class LetterChanges {
  constructor(
    public deleteChange: DeleteChange | null = null,
    public replaceChanges: ReplaceChange[] = []
  ) {}
}

/**
 * Represents all possible changes for a Position
 */
export class PositionChanges {
  constructor(
    public insertChanges: InsertChange[] = []
  ) {}
}
