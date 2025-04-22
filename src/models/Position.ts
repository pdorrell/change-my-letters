import { makeAutoObservable } from 'mobx';

/**
 * Model representing a position where a letter can be inserted
 */
export class Position {
  // Position index
  index: number;
  
  // Whether a letter can be inserted at this position
  canInsert: boolean = false;
  
  // Possible letters that can be inserted
  insertOptions: string[] = [];
  
  // Whether the insert menu is currently open
  isInsertMenuOpen: boolean = false;
  
  constructor(index: number) {
    this.index = index;
    
    // In a real implementation, these would be determined by the word graph
    this.canInsert = true;
    this.insertOptions = ['a', 'e', 'i', 'o', 'u']; // Placeholder
    
    makeAutoObservable(this);
  }
  
  toggleInsertMenu(): void {
    this.isInsertMenuOpen = !this.isInsertMenuOpen;
  }
}