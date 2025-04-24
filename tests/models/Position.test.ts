import { Position } from '../../src/models/Position';

describe('Position', () => {
  it('should initialize with the correct properties', () => {
    const position = new Position(1);
    
    expect(position.index).toBe(1);
    expect(position.isInsertMenuOpen).toBe(false);
    expect(position.canInsert).toBe(true); // Default in mock implementation is true
    expect(position.insertOptions).toEqual(['a', 'e', 'i', 'o', 'u']); // Default in mock implementation
  });

  it('should toggle insert menu state', () => {
    const position = new Position(1);
    
    // Initially closed
    expect(position.isInsertMenuOpen).toBe(false);
    
    // Open it
    position.toggleInsertMenu();
    expect(position.isInsertMenuOpen).toBe(true);
    
    // Close it
    position.toggleInsertMenu();
    expect(position.isInsertMenuOpen).toBe(false);
  });

  it('should have canInsert set to true by default', () => {
    const position = new Position(1);
    expect(position.canInsert).toBe(true);
  });

  it('should initialize with default insert options', () => {
    const position = new Position(1);
    expect(position.insertOptions).toEqual(['a', 'e', 'i', 'o', 'u']);
  });
});