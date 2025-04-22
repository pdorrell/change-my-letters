import { makeAutoObservable } from 'mobx';

/**
 * Model representing a single letter in the current word
 */
export class Letter {
  // The letter value
  value: string;
  
  // Position in the word
  position: number;
  
  // Whether the letter can be deleted
  canDelete: boolean = false;
  
  // Whether the letter can be replaced and the potential replacements
  canReplace: boolean = false;
  replacements: string[] = [];
  
  // Whether this letter can be upper or lower cased
  canUpperCase: boolean = false;
  canLowerCase: boolean = false;
  
  // Is the replacement menu currently open
  isReplaceMenuOpen: boolean = false;
  
  constructor(letter: string, position: number) {
    this.value = letter;
    this.position = position;
    
    // In a real implementation, these would be determined by the word graph
    this.canDelete = true;
    this.canReplace = true;
    
    // Add some sample replacements
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const vowels = 'aeiou';
    
    // For sample purposes, we'll add some replacement letters
    if (vowels.includes(letter.toLowerCase())) {
      // For vowels, use other vowels as replacements
      this.replacements = vowels.split('').filter(v => v !== letter.toLowerCase());
    } else {
      // For consonants, use nearby consonants in the alphabet
      const pos = alphabet.indexOf(letter.toLowerCase());
      if (pos !== -1) {
        const start = Math.max(0, pos - 2);
        const end = Math.min(alphabet.length, pos + 3);
        this.replacements = alphabet.substring(start, end).split('')
          .filter(char => !vowels.includes(char) && char !== letter.toLowerCase());
      }
    }
    
    this.canUpperCase = letter === letter.toLowerCase() && letter !== '';
    this.canLowerCase = letter === letter.toUpperCase() && letter !== '';
    
    makeAutoObservable(this);
  }
  
  toggleReplaceMenu(): void {
    this.isReplaceMenuOpen = !this.isReplaceMenuOpen;
  }
}