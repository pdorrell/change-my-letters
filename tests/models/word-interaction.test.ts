import { WordInteraction } from '@/models/interaction/word-interaction';
import { WordChanger } from '@/models/changer/word-changer';
import { createTestWordChanger } from '@/tests/utils/test-app-builder';
import { createTestWordGraph, testWordLists } from '@/tests/utils/test-word-graph-builder';
import { AudioFilePlayerTestDouble } from '@/tests/test_doubles/audio-file-player-test-double';

describe('WordInteraction', () => {
  let wordChanger: WordChanger;
  let wordGraph: ReturnType<typeof createTestWordGraph>;

  beforeEach(() => {
    wordChanger = createTestWordChanger();
    wordGraph = createTestWordGraph(testWordLists.minimal);
  });

  it('should initialize correctly with a word', () => {
    const wordObj = wordGraph.getRequiredWord('cat');
    const wordInteraction = new WordInteraction(wordObj, wordChanger.newWordHandler, wordChanger.wordSayer, wordChanger.menuManager, wordChanger.history);

    expect(wordInteraction.value).toBe('cat');
    expect(wordInteraction.word).toBe(wordObj);

    // Should have letterInteractions for each letter in 'cat'
    expect(wordInteraction.letterInteractions.length).toBe(3);

    // Should have positionInteractions for before, between, and after all letters
    expect(wordInteraction.positionInteractions.length).toBe(4);
    expect(wordInteraction.positionInteractions[0].position.index).toBe(0);
    expect(wordInteraction.positionInteractions[1].position.index).toBe(1);
    expect(wordInteraction.positionInteractions[2].position.index).toBe(2);
    expect(wordInteraction.positionInteractions[3].position.index).toBe(3);
  });

  it('should update word value and related properties', () => {
    const catWord = wordGraph.getRequiredWord('cat');
    const batWord = wordGraph.getRequiredWord('bat');
    const wordInteraction = new WordInteraction(catWord, wordChanger.newWordHandler, wordChanger.wordSayer, wordChanger.menuManager, wordChanger.history);
    wordInteraction.updateWord(batWord);

    expect(wordInteraction.value).toBe('bat');
    expect(wordInteraction.word).toBe(batWord);

    // Should still have 3 letterInteractions
    expect(wordInteraction.letterInteractions.length).toBe(3);

    // Should still have 4 positionInteractions
    expect(wordInteraction.positionInteractions.length).toBe(4);
  });

  it('should create letterInteractions for each character', () => {
    const wordObj = wordGraph.getRequiredWord('cat');
    const wordInteraction = new WordInteraction(wordObj, wordChanger.newWordHandler, wordChanger.wordSayer, wordChanger.menuManager, wordChanger.history);

    // Verify that the letterInteractions have been created correctly
    expect(wordInteraction.letterInteractions.length).toBe(3);
    expect(wordInteraction.letterInteractions[0].letter.value).toBe('c');
    expect(wordInteraction.letterInteractions[0].letter.position).toBe(0);

    expect(wordInteraction.letterInteractions[1].letter.value).toBe('a');
    expect(wordInteraction.letterInteractions[1].letter.position).toBe(1);

    expect(wordInteraction.letterInteractions[2].letter.value).toBe('t');
    expect(wordInteraction.letterInteractions[2].letter.position).toBe(2);

    // Verify that letterInteractions are properly initialized with the correct letters
    expect(wordInteraction.letterInteractions[0].letter.value).toBe('c');
    expect(wordInteraction.letterInteractions[1].letter.value).toBe('a');
    expect(wordInteraction.letterInteractions[2].letter.value).toBe('t');
  });

  it('should create positionInteractions for before, between, and after characters', () => {
    const wordObj = wordGraph.getRequiredWord('cat');
    const wordInteraction = new WordInteraction(wordObj, wordChanger.newWordHandler, wordChanger.wordSayer, wordChanger.menuManager, wordChanger.history);

    // Verify that the positionInteractions have been created correctly
    expect(wordInteraction.positionInteractions.length).toBe(4);
    expect(wordInteraction.positionInteractions[0].position.index).toBe(0);
    expect(wordInteraction.positionInteractions[1].position.index).toBe(1);
    expect(wordInteraction.positionInteractions[2].position.index).toBe(2);
    expect(wordInteraction.positionInteractions[3].position.index).toBe(3);

    // Verify that positionInteractions are properly initialized with correct indices
    expect(wordInteraction.positionInteractions[0].position.index).toBe(0);
    expect(wordInteraction.positionInteractions[1].position.index).toBe(1);
    expect(wordInteraction.positionInteractions[2].position.index).toBe(2);
    expect(wordInteraction.positionInteractions[3].position.index).toBe(3);
  });

  it('should handle different word lengths when updating', () => {
    const catWord = wordGraph.getRequiredWord('cat');
    const batWord = wordGraph.getRequiredWord('bat');
    const atWord = wordGraph.getRequiredWord('at');

    const wordInteraction = new WordInteraction(catWord, wordChanger.newWordHandler, wordChanger.wordSayer, wordChanger.menuManager, wordChanger.history);

    // Update to different word of same length
    wordInteraction.updateWord(batWord);

    expect(wordInteraction.letterInteractions.length).toBe(3);
    expect(wordInteraction.positionInteractions.length).toBe(4);

    // Update to shorter word
    wordInteraction.updateWord(atWord);

    expect(wordInteraction.letterInteractions.length).toBe(2);
    expect(wordInteraction.positionInteractions.length).toBe(3);
  });

  it('should close all menus', () => {
    const wordObj = wordGraph.getRequiredWord('cat');
    const wordInteraction = new WordInteraction(wordObj, wordChanger.newWordHandler, wordChanger.wordSayer, wordChanger.menuManager, wordChanger.history);

    // Open some menus
    wordInteraction.letterInteractions[0].isReplaceMenuOpen = true;
    wordInteraction.positionInteractions[0].isInsertMenuOpen = true;

    // Verify they're open
    expect(wordInteraction.letterInteractions[0].isReplaceMenuOpen).toBe(true);
    expect(wordInteraction.positionInteractions[0].isInsertMenuOpen).toBe(true);

    // Close all menus
    wordInteraction.closeAllMenus();

    // Verify all menus are closed
    for (const letterInteraction of wordInteraction.letterInteractions) {
      expect(letterInteraction.isReplaceMenuOpen).toBe(false);
    }

    for (const positionInteraction of wordInteraction.positionInteractions) {
      expect(positionInteraction.isInsertMenuOpen).toBe(false);
    }
  });

  it('should have a computed value property that returns the word string', () => {
    const wordObj = wordGraph.getRequiredWord('cat');
    const wordInteraction = new WordInteraction(wordObj, wordChanger.newWordHandler, wordChanger.wordSayer, wordChanger.menuManager, wordChanger.history);

    expect(wordInteraction.value).toBe('cat');

    // Update the word and check that value updates
    const newWord = wordGraph.getRequiredWord('bat');
    wordInteraction.updateWord(newWord);

    expect(wordInteraction.value).toBe('bat');
  });

  /* The previouslyVisited test has been removed since this property was removed */

  it('should initialize with a Word object', () => {
    const catWord = wordGraph.getRequiredWord('cat');
    const wordInteraction = new WordInteraction(catWord, wordChanger.newWordHandler, wordChanger.wordSayer, wordChanger.menuManager, wordChanger.history);

    expect(wordInteraction.value).toBe('cat');
    expect(wordInteraction.letterInteractions.length).toBe(3);
    expect(wordInteraction.positionInteractions.length).toBe(4);
  });

  it('should call the wordSayer.say method with the word changer', () => {
    const wordObj = wordGraph.getRequiredWord('cat');
    const wordInteraction = new WordInteraction(wordObj, wordChanger.newWordHandler, wordChanger.wordSayer, wordChanger.menuManager, wordChanger.history);

    // Call the say method
    wordInteraction.say();

    // Verify that the audio file player test double's playAudioFile method was called with 'words/cat'
    const audioFilePlayerTestDouble = (wordChanger.wordSayer as unknown as { audioFilePlayer: unknown }).audioFilePlayer;
    if (audioFilePlayerTestDouble instanceof AudioFilePlayerTestDouble) {
      expect(audioFilePlayerTestDouble.playedFiles).toEqual(['words/cat']);
    } else {
      throw new Error('Expected AudioFilePlayerTestDouble in test');
    }
  });
});
