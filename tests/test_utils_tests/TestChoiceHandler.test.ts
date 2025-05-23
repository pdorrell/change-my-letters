import { TestChoiceHandler } from '../utils/TestChoiceHandler';

describe('TestChoiceHandler', () => {
  describe('with string choices', () => {
    let handler: TestChoiceHandler<string>;

    beforeEach(() => {
      handler = new TestChoiceHandler<string>();
    });

    it('starts with empty choices array', () => {
      expect(handler.choices).toEqual([]);
    });

    it('throws error when accessing choice with no choices made', () => {
      expect(() => handler.choice).toThrow('No choices were made');
    });

    it('records a single choice', () => {
      handler.chooser('hello');
      
      expect(handler.choices).toEqual(['hello']);
      expect(handler.choice).toBe('hello');
    });

    it('records multiple choices in order', () => {
      handler.chooser('first');
      handler.chooser('second');
      handler.chooser('third');
      
      expect(handler.choices).toEqual(['first', 'second', 'third']);
    });

    it('throws error when accessing choice with multiple choices made', () => {
      handler.chooser('first');
      handler.chooser('second');
      
      expect(() => handler.choice).toThrow('Multiple choices (2) were made');
    });

    it('returns copy of choices array to prevent mutation', () => {
      handler.chooser('test');
      const choices = handler.choices;
      choices.push('modified');
      
      expect(handler.choices).toEqual(['test']);
    });
  });

  describe('with object choices', () => {
    interface TestChoice {
      id: number;
      name: string;
    }

    let handler: TestChoiceHandler<TestChoice>;

    beforeEach(() => {
      handler = new TestChoiceHandler<TestChoice>();
    });

    it('records object choices correctly', () => {
      const choice1 = { id: 1, name: 'first' };
      const choice2 = { id: 2, name: 'second' };
      
      handler.chooser(choice1);
      handler.chooser(choice2);
      
      expect(handler.choices).toEqual([choice1, choice2]);
    });

    it('returns single object choice', () => {
      const choice = { id: 42, name: 'answer' };
      handler.chooser(choice);
      
      expect(handler.choice).toEqual(choice);
      expect(handler.choice).toBe(choice);
    });
  });

  describe('error messages', () => {
    let handler: TestChoiceHandler<number>;

    beforeEach(() => {
      handler = new TestChoiceHandler<number>();
    });

    it('provides correct error message for multiple choices', () => {
      handler.chooser(1);
      handler.chooser(2);
      handler.chooser(3);
      handler.chooser(4);
      handler.chooser(5);
      
      expect(() => handler.choice).toThrow('Multiple choices (5) were made');
    });
  });
});