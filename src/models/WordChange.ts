import { Word } from './Word';

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
export class InsertChange extends BaseChange {
  constructor(
    result: Word,
    public readonly letter: string
  ) {
    super(result);
  }
}

/**
 * Represents the result of replacing a letter
 */
export class ReplaceChange extends BaseChange {
  constructor(
    result: Word,
    public readonly letter: string
  ) {
    super(result);
  }
}

/**
 * Represents all possible changes for a Word
 */
export class WordChanges {
  constructor(
    public readonly deleteChanges: DeleteChange[] = [],
    public readonly insertChanges: InsertChange[][] = [],
    public readonly replaceChanges: ReplaceChange[][] = []
  ) {}
}

/**
 * Represents all possible changes for a Letter
 */
export class LetterChanges {
  constructor(
    public readonly deleteChange: DeleteChange | null = null,
    public readonly replaceChanges: ReplaceChange[] = []
  ) {}
}

/**
 * Represents all possible changes for a Position
 */
export class PositionChanges {
  constructor(
    public readonly insertChanges: InsertChange[] = []
  ) {}
}