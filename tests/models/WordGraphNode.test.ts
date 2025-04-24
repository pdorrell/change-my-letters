import { WordGraphNode } from '../../src/models/WordGraphNode';

describe('WordGraphNode', () => {
  it('should initialize correctly', () => {
    const word = 'test';
    const deletes = [false, true, false, false];
    const inserts = ['a', 'b', 'c', 'd', 'e'];
    const replaces = ['xy', 'z', 'abc', ''];
    const uppercase = [true, false, false, false];
    const lowercase = [false, true, false, false];
    
    const node = new WordGraphNode(word, deletes, inserts, replaces, uppercase, lowercase);
    
    expect(node.word).toBe(word);
    expect(node.deletes).toEqual(deletes);
    expect(node.inserts).toEqual(inserts);
    expect(node.replaces).toEqual(replaces);
    expect(node.uppercase).toEqual(uppercase);
    expect(node.lowercase).toEqual(lowercase);
  });

  it('should get replacement letters at a specific position', () => {
    const replaces = ['xy', 'z', 'abc'];
    const node = new WordGraphNode('cat', [], [], replaces, [], []);
    
    expect(node.getReplacements(0)).toBe('xy');
    expect(node.getReplacements(1)).toBe('z');
    expect(node.getReplacements(2)).toBe('abc');
  });

  it('should get insertion letters at a specific position', () => {
    const inserts = ['a', 'bc', 'def', 'g'];
    const node = new WordGraphNode('cat', [], inserts, [], [], []);
    
    expect(node.getInsertions(0)).toBe('a');
    expect(node.getInsertions(1)).toBe('bc');
    expect(node.getInsertions(2)).toBe('def');
    expect(node.getInsertions(3)).toBe('g');
  });

  it('should check if a letter can be deleted', () => {
    const deletes = [true, false, true];
    const node = new WordGraphNode('cat', deletes, [], [], [], []);
    
    expect(node.canDelete(0)).toBe(true);
    expect(node.canDelete(1)).toBe(false);
    expect(node.canDelete(2)).toBe(true);
  });

  it('should check if a letter can be upper-cased', () => {
    const uppercase = [true, false, true];
    const node = new WordGraphNode('cat', [], [], [], uppercase, []);
    
    expect(node.canUppercase(0)).toBe(true);
    expect(node.canUppercase(1)).toBe(false);
    expect(node.canUppercase(2)).toBe(true);
  });

  it('should check if a letter can be lower-cased', () => {
    const lowercase = [true, false, true];
    const node = new WordGraphNode('CAT', [], [], [], [], lowercase);
    
    expect(node.canLowercase(0)).toBe(true);
    expect(node.canLowercase(1)).toBe(false);
    expect(node.canLowercase(2)).toBe(true);
  });

  it('should serialize to JSON and deserialize from JSON', () => {
    // Create a node with some operations
    const word = 'cat';
    const deletes = [true, false, true];
    const inserts = ['a', 'bc', '', 'd'];
    const replaces = ['xy', '', 'z'];
    const uppercase = [true, false, false];
    const lowercase = [false, false, true];
    
    const node = new WordGraphNode(word, deletes, inserts, replaces, uppercase, lowercase);
    
    // Serialize to JSON
    const json = node.toJson();
    
    // Check JSON format
    expect(json.delete).toBe('c.t');
    expect(json.insert).toBe('a/bc//d');
    expect(json.replace).toBe('xy//z');
    expect(json.uppercase).toBe('c..');
    expect(json.lowercase).toBe('..t');
    
    // Create a new node from the JSON
    const newNode = WordGraphNode.fromJson(word, json);
    
    // Check that the properties were restored correctly
    expect(newNode.word).toBe(word);
    expect(newNode.deletes).toEqual(deletes);
    expect(newNode.inserts).toEqual(inserts);
    expect(newNode.replaces).toEqual(replaces);
    expect(newNode.uppercase).toEqual(uppercase);
    expect(newNode.lowercase).toEqual(lowercase);
  });
});