import { makeAutoObservable } from 'mobx';

/**
 * Represents a node in the word graph, containing all possible operations
 * that can be performed on a word
 */
export class WordGraphNode {
  // Boolean arrays indicating whether each letter can be deleted
  deletes: boolean[] | null = null;
  
  // Arrays of possible letters that can be inserted at each position
  inserts: string[] | null = null;
  
  // Arrays of possible letters that can replace each current letter
  replaces: string[] | null = null;
  
  // Boolean arrays indicating whether each letter can be uppercased
  uppercase: boolean[] | null = null;
  
  // Boolean arrays indicating whether each letter can be lowercased
  lowercase: boolean[] | null = null;
  
  constructor() {
    makeAutoObservable(this);
  }
  
  /**
   * Get possible replacements for a letter at the given position
   */
  getReplacements(position: number): string {
    if (!this.replaces || position < 0 || position >= this.replaces.length) {
      return '';
    }
    return this.replaces[position] || '';
  }
  
  /**
   * Get possible insertions at the given position
   */
  getInsertions(position: number): string {
    if (!this.inserts || position < 0 || position >= this.inserts.length) {
      return '';
    }
    return this.inserts[position] || '';
  }
  
  /**
   * Check if a letter at the given position can be deleted
   */
  canDelete(position: number): boolean {
    if (!this.deletes || position < 0 || position >= this.deletes.length) {
      return false;
    }
    return this.deletes[position];
  }
  
  /**
   * Check if a letter at the given position can be uppercased
   */
  canUppercase(position: number): boolean {
    if (!this.uppercase || position < 0 || position >= this.uppercase.length) {
      return false;
    }
    return this.uppercase[position];
  }
  
  /**
   * Check if a letter at the given position can be lowercased
   */
  canLowercase(position: number): boolean {
    if (!this.lowercase || position < 0 || position >= this.lowercase.length) {
      return false;
    }
    return this.lowercase[position];
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
      
      node.deletes = hasDelete ? deletes : null;
    }
    
    // Process inserts (convert from slash-separated string to string[])
    if (data.insert) {
      // Handle both array format (old) and string format (new)
      if (typeof data.insert === 'string') {
        const parts = data.insert.split('/');
        const inserts: string[] = [];
        let hasInsert = false;
        
        for (let i = 0; i < parts.length; i++) {
          inserts[i] = parts[i] || '';
          if (parts[i]) hasInsert = true;
        }
        
        node.inserts = hasInsert ? inserts : null;
      } else if (Array.isArray(data.insert)) {
        // Handle legacy array format
        const inserts: string[] = [];
        let hasInsert = false;
        
        for (let i = 0; i < data.insert.length; i++) {
          inserts[i] = data.insert[i] || '';
          if (data.insert[i]) hasInsert = true;
        }
        
        node.inserts = hasInsert ? inserts : null;
      }
    }
    
    // Process replaces (convert from slash-separated string to string[])
    if (data.replace) {
      // Handle both array format (old) and string format (new)
      if (typeof data.replace === 'string') {
        const parts = data.replace.split('/');
        const replaces: string[] = [];
        let hasReplace = false;
        
        for (let i = 0; i < parts.length; i++) {
          replaces[i] = parts[i] || '';
          if (parts[i]) hasReplace = true;
        }
        
        node.replaces = hasReplace ? replaces : null;
      } else if (Array.isArray(data.replace)) {
        // Handle legacy array format
        const replaces: string[] = [];
        let hasReplace = false;
        
        for (let i = 0; i < data.replace.length; i++) {
          replaces[i] = data.replace[i] || '';
          if (data.replace[i]) hasReplace = true;
        }
        
        node.replaces = hasReplace ? replaces : null;
      }
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
      
      node.uppercase = hasUppercase ? uppercase : null;
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
      
      node.lowercase = hasLowercase ? lowercase : null;
    }
    
    return node;
  }
}