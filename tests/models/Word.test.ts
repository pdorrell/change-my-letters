import { Word } from '../../src/models/Word';

describe('Word', () => {
  it('should initialize correctly', () => {
    const word = new Word(
      'cat',
      [true, true, true],
      ['aeiou', 'aeiou', 'aeiou', 'aeiou'],
      ['bcdf', 'bcdf', 'bcdf'],
      [true, false, true],
      [false, true, false]
    );

    expect(word.word).toBe('cat');
    expect(word.deletes).toEqual([true, true, true]);
    expect(word.inserts).toEqual(['aeiou', 'aeiou', 'aeiou', 'aeiou']);
    expect(word.replaces).toEqual(['bcdf', 'bcdf', 'bcdf']);
    expect(word.uppercase).toEqual([true, false, true]);
    expect(word.lowercase).toEqual([false, true, false]);
  });

  it('should create letter objects', () => {
    const word = new Word(
      'cat',
      [true, true, true],
      ['aeiou', 'aeiou', 'aeiou', 'aeiou'],
      ['bcdf', 'bcdf', 'bcdf'],
      [true, false, true],
      [false, true, false]
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
      ['bcdf', 'bcdf', 'bcdf'],
      [true, false, true],
      [false, true, false]
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
      ['bcdf', 'bcdf', 'bcdf'],
      [true, false, true],
      [false, true, false]
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

    // Test canUppercase
    expect(word.canUppercase(0)).toBe(true);
    expect(word.canUppercase(1)).toBe(false);

    // Test canLowercase
    expect(word.canLowercase(0)).toBe(false);
    expect(word.canLowercase(1)).toBe(true);

    // Test canChangeCaseAt - this depends on letter case and possible changes
    expect(word.canChangeCaseAt(0)).toBe(true);  // Can uppercase
    expect(word.canChangeCaseAt(1)).toBe(true);  // Can lowercase
    expect(word.canChangeCaseAt(2)).toBe(true);  // Can uppercase
  });

  it('should be created from JSON', () => {
    const json = {
      delete: 'c.t',
      insert: 'aeiou/aeiou/aeiou/aeiou',
      replace: 'bcdf/bcdf/bcdf',
      uppercase: 'c.t',
      lowercase: '.a.'
    };

    const word = Word.fromJson('cat', json);

    expect(word.word).toBe('cat');
    expect(word.deletes).toEqual([true, false, true]);
    expect(word.replaces).toEqual(['bcdf', 'bcdf', 'bcdf']);

    // Test that uppercase and lowercase are parsed correctly
    expect(word.uppercase).toEqual([true, false, true]);
    expect(word.lowercase).toEqual([false, true, false]);
  });

  it('should convert to JSON', () => {
    const word = new Word(
      'cat',
      [true, false, true],
      ['aeiou', 'aeiou', 'aeiou', 'aeiou'],
      ['bcdf', 'bcdf', 'bcdf'],
      [true, false, true],
      [false, true, false]
    );

    const json = word.toJson();

    expect(json.delete).toBe('c.t');
    expect(json.insert).toBe('aeiou/aeiou/aeiou/aeiou');
    expect(json.replace).toBe('bcdf/bcdf/bcdf');
    expect(json.uppercase).toBe('c.t');
    expect(json.lowercase).toBe('.a.');
  });
});