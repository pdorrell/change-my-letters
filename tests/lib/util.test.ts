import { range, shuffle } from '@/lib/util';

describe('util', () => {
  describe('range', () => {
    it('should create an array of numbers from 0 to n-1', () => {
      expect(range(0)).toEqual([]);
      expect(range(1)).toEqual([0]);
      expect(range(3)).toEqual([0, 1, 2]);
      expect(range(5)).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('shuffle', () => {
    it('should return an array with the same elements', () => {
      const original = ['a', 'b', 'c', 'd', 'e'];
      const shuffled = shuffle(original);

      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('should not modify the original array', () => {
      const original = ['a', 'b', 'c'];
      const originalCopy = [...original];
      shuffle(original);

      expect(original).toEqual(originalCopy);
    });

    it('should handle empty arrays', () => {
      expect(shuffle([])).toEqual([]);
    });

    it('should handle single element arrays', () => {
      expect(shuffle(['a'])).toEqual(['a']);
    });

    it('should produce different orders (probabilistic test)', () => {
      const original = ['a', 'b', 'c', 'd', 'e'];
      const shuffles = Array.from({ length: 20 }, () => shuffle(original));

      // It's extremely unlikely (but theoretically possible) that all 20 shuffles
      // would produce the same order as the original, so this test should pass
      const differentOrders = shuffles.filter(s => JSON.stringify(s) !== JSON.stringify(original));
      expect(differentOrders.length).toBeGreaterThan(0);
    });
  });
});

