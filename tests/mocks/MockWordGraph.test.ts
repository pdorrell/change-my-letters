import { createMockWordGraph } from './MockWordGraph';

describe('MockWordGraph', () => {
  it('should create a mock word graph with test words', () => {
    const mockGraph = createMockWordGraph();
    
    expect(mockGraph.hasWord('cat')).toBe(true);
    expect(mockGraph.hasWord('bat')).toBe(true);
    expect(mockGraph.hasWord('rat')).toBe(true);
    expect(mockGraph.hasWord('dog')).toBe(true);
    
    // Non-existent word
    expect(mockGraph.hasWord('xyz')).toBe(false);
    
    // Check that nodes exist
    expect(mockGraph.getNode('cat')).not.toBeNull();
    expect(mockGraph.getNode('bat')).not.toBeNull();
  });
});