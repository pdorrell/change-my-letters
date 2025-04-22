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
    this.canUpperCase = letter === letter.toLowerCase() && letter !== '';
    this.canLowerCase = letter === letter.toUpperCase() && letter !== '';
    
    makeAutoObservable(this);
  }
  
  toggleReplaceMenu(): void {
    this.isReplaceMenuOpen = !this.isReplaceMenuOpen;
  }
}