import { makeAutoObservable } from 'mobx';

/**
 * Represents a node in the word graph, containing all possible operations
 * that can be performed on a word
 */
export class WordGraphNode {
  // Boolean arrays indicating whether each letter can be deleted
  deletes: boolean[] = [];
  
  // Arrays of possible letters that can be inserted at each position
  inserts: string[] = [];
  
  // Arrays of possible letters that can replace each current letter
  replaces: string[] = [];
  
  // Boolean arrays indicating whether each letter can be uppercased
  uppercase: boolean[] = [];
  
  // Boolean arrays indicating whether each letter can be lowercased
  lowercase: boolean[] = [];
  
  constructor() {
    makeAutoObservable(this);
  }
  
  /**
   * Get possible replacements for a letter at the given position
   */
  getReplacements(position: number): string {
    return this.replaces[position] || '';
  }
  
  /**
   * Get possible insertions at the given position
   */
  getInsertions(position: number): string {
    return this.inserts[position] || '';
  }
  
  /**
   * Check if a letter at the given position can be deleted
   */
  canDelete(position: number): boolean {
    return this.deletes[position] || false;
  }
  
  /**
   * Check if a letter at the given position can be uppercased
   */
  canUppercase(position: number): boolean {
    return this.uppercase[position] || false;
  }
  
  /**
   * Check if a letter at the given position can be lowercased
   */
  canLowercase(position: number): boolean {
    return this.lowercase[position] || false;
  }
  
  /**
   * Create a WordGraphNode from the JSON representation
   */
  static fromJson(data: Record<string, any>): WordGraphNode {
    const node = new WordGraphNode();
    
    // Process deletes (convert from string to boolean[])
    if (data.delete) {
      const deletes: boolean[] = [];
      let hasDelete = false;
      
      for (let i = 0; i < data.delete.length; i++) {
        const canDelete = data.delete[i] !== '.';
        deletes[i] = canDelete;
        if (canDelete) hasDelete = true;
      }
      
      node.deletes = hasDelete ? deletes : [];
    }
    
    // Process inserts (convert from slash-separated string to string[])
    if (data.insert) {
      const parts = data.insert.split('/');
      const inserts: string[] = [];
      let hasInsert = false;
      
      for (let i = 0; i < parts.length; i++) {
        inserts[i] = parts[i] || '';
        if (parts[i]) hasInsert = true;
      }
      
      node.inserts = hasInsert ? inserts : [];
    }
    
    // Process replaces (convert from slash-separated string to string[])
    if (data.replace) {
      const parts = data.replace.split('/');
      const replaces: string[] = [];
      let hasReplace = false;
      
      for (let i = 0; i < parts.length; i++) {
        replaces[i] = parts[i] || '';
        if (parts[i]) hasReplace = true;
      }
      
      node.replaces = hasReplace ? replaces : [];
    }
    
    // Process uppercase
    if (data.uppercase) {
      const uppercase: boolean[] = [];
      let hasUppercase = false;
      
      for (let i = 0; i < data.uppercase.length; i++) {
        const canUppercase = data.uppercase[i] !== '.';
        uppercase[i] = canUppercase;
        if (canUppercase) hasUppercase = true;
      }
      
      node.uppercase = hasUppercase ? uppercase : [];
    }
    
    // Process lowercase
    if (data.lowercase) {
      const lowercase: boolean[] = [];
      let hasLowercase = false;
      
      for (let i = 0; i < data.lowercase.length; i++) {
        const canLowercase = data.lowercase[i] !== '.';
        lowercase[i] = canLowercase;
        if (canLowercase) hasLowercase = true;
      }
      
      node.lowercase = hasLowercase ? lowercase : [];
    }
    
    return node;
  }
}