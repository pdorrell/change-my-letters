import { Letter } from '../../src/models/Letter';

describe('Letter', () => {
  it('should initialize with the correct properties', () => {
    const letter = new Letter('a', 1);
    
    expect(letter.value).toBe('a');
    expect(letter.position).toBe(1);
    expect(letter.canDelete).toBe(true); // Default in mock implementation is true
    expect(letter.isReplaceMenuOpen).toBe(false);
    expect(letter.canReplace).toBe(true); // Default in mock implementation is true
    expect(letter.replacements.length).toBeGreaterThan(0); // Has some replacements
  });

  it('should toggle replace menu state', () => {
    const letter = new Letter('a', 1);
    
    // Initially closed
    expect(letter.isReplaceMenuOpen).toBe(false);
    
    // Open it
    letter.toggleReplaceMenu();
    expect(letter.isReplaceMenuOpen).toBe(true);
    
    // Close it
    letter.toggleReplaceMenu();
    expect(letter.isReplaceMenuOpen).toBe(false);
  });

  it('should set canUpperCase for lowercase letters', () => {
    const letter = new Letter('a', 1);
    expect(letter.canUpperCase).toBe(true);
    
    const uppercase = new Letter('A', 1);
    expect(uppercase.canUpperCase).toBe(false);
  });

  it('should set canLowerCase for uppercase letters', () => {
    const letter = new Letter('A', 1);
    expect(letter.canLowerCase).toBe(true);
    
    const lowercase = new Letter('a', 1);
    expect(lowercase.canLowerCase).toBe(false);
  });

  it('should generate different replacements for vowels and consonants', () => {
    // Vowel
    const vowel = new Letter('a', 0);
    expect(vowel.replacements.length).toBeGreaterThan(0);
    expect(vowel.replacements).toContain('e');
    expect(vowel.replacements).not.toContain('a');
    
    // Consonant
    const consonant = new Letter('b', 0);
    expect(consonant.replacements.length).toBeGreaterThan(0);
    expect(consonant.replacements).not.toContain('a');
    expect(consonant.replacements).not.toContain('b');
  });
});