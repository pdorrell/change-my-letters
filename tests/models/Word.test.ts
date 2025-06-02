import { Word } from '../../src/models/word';

describe('Word', () => {
  it('should initialize correctly', () => {
    const word = new Word(
      'cat',
      [true, true, true],
      ['aeiou', 'aeiou', 'aeiou', 'aeiou'],
      ['bcdf', 'bcdf', 'bcdf']
    );

    expect(word.word).toBe('cat');
    expect(word.deletes).toEqual([true, true, true]);
    expect(word.inserts).toEqual(['aeiou', 'aeiou', 'aeiou', 'aeiou']);
    expect(word.replaces).toEqual(['bcdf', 'bcdf', 'bcdf']);
  });

  it('should create letter objects', () => {
    const word = new Word(
      'cat',
      [true, true, true],
      ['aeiou', 'aeiou', 'aeiou', 'aeiou'],
      ['bcdf', 'bcdf', 'bcdf']
    );

    const letters = word.letters;

    // Should have three letters for 'cat'
    expect(letters.length).toBe(3);

    // Letters should have correct values
    expect(letters[0].value).toBe('c');
    expect(letters[1].value).toBe('a');
    expect(letters[2].value).toBe('t');

    // MobX will now handle caching automatically
  });

  it('should create position objects', () => {
    const word = new Word(
      'cat',
      [true, true, true],
      ['aeiou', 'aeiou', 'aeiou', 'aeiou'],
      ['bcdf', 'bcdf', 'bcdf']
    );

    const positions = word.positions;

    // Should have four positions for 'cat'
    expect(positions.length).toBe(4);

    // Positions should have correct indices
    expect(positions[0].index).toBe(0);
    expect(positions[1].index).toBe(1);
    expect(positions[2].index).toBe(2);
    expect(positions[3].index).toBe(3);

    // MobX will now handle caching automatically
  });

  it('should handle get operations like canDelete, getReplacements, etc.', () => {
    const word = new Word(
      'cat',
      [true, false, true],
      ['aeiou', 'aeiou', 'aeiou', 'aeiou'],
      ['bcdf', 'bcdf', 'bcdf']
    );

    // Test canDelete
    expect(word.canDelete(0)).toBe(true);
    expect(word.canDelete(1)).toBe(false);
    expect(word.canDelete(2)).toBe(true);

    // Test getReplacements
    expect(word.getReplacements(0)).toBe('bcdf');

    // Test getPossibleReplacements
    expect(word.getPossibleReplacements(0)).toEqual(['b', 'c', 'd', 'f']);

    // Test getInsertions
    expect(word.getInsertions(0)).toBe('aeiou');

    // Test getPossibleInsertions
    expect(word.getPossibleInsertions(0)).toEqual(['a', 'e', 'i', 'o', 'u']);

    // Case-related tests have been removed
  });

  it('should be created from JSON', () => {
    const json = {
      delete: 'c.t',
      insert: 'aeiou/aeiou/aeiou/aeiou',
      replace: 'bcdf/bcdf/bcdf'
    };

    const word = Word.fromJson('cat', json);

    expect(word.word).toBe('cat');
    expect(word.deletes).toEqual([true, false, true]);
    expect(word.replaces).toEqual(['bcdf', 'bcdf', 'bcdf']);

    // Case-related tests have been removed
  });

  it('should convert to JSON', () => {
    const word = new Word(
      'cat',
      [true, false, true],
      ['aeiou', 'aeiou', 'aeiou', 'aeiou'],
      ['bcdf', 'bcdf', 'bcdf']
    );

    const json = word.toJson();

    expect(json.delete).toBe('c.t');
    expect(json.insert).toBe('aeiou/aeiou/aeiou/aeiou');
    expect(json.replace).toBe('bcdf/bcdf/bcdf');
    // Case-related tests have been removed
  });

  it('should roundtrip toJson -> fromJson correctly', () => {
    const originalWord = new Word(
      'hello',
      [true, false, true, false, true],
      ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr'],
      ['xyz', 'uvw', 'rst', 'opq', 'lmn']
    );

    const json = originalWord.toJson();
    const recreatedWord = Word.fromJson('hello', json);

    expect(recreatedWord.word).toBe(originalWord.word);
    expect(recreatedWord.deletes).toEqual(originalWord.deletes);
    expect(recreatedWord.inserts).toEqual(originalWord.inserts);
    expect(recreatedWord.replaces).toEqual(originalWord.replaces);
  });

  it('should roundtrip toJson -> fromJson with empty arrays', () => {
    const originalWord = new Word(
      'test',
      [false, false, false, false],
      ['', '', '', '', ''],
      ['', '', '', '']
    );

    const json = originalWord.toJson();
    const recreatedWord = Word.fromJson('test', json);

    expect(recreatedWord.word).toBe(originalWord.word);
    expect(recreatedWord.deletes).toEqual(originalWord.deletes);
    expect(recreatedWord.inserts).toEqual(originalWord.inserts);
    expect(recreatedWord.replaces).toEqual(originalWord.replaces);
  });
});
