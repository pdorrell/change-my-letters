import { makeAutoObservable } from 'mobx';
import { Word } from '@/models/Word';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { MakeWordsHistory } from './maker-history';
import { MakeCurrentWord } from './maker-current-word';
import { MakeWordResult, MakeWordResultPlaceholder } from './maker-word-result';
import { ButtonAction } from '@/lib/models/actions';
import { WordGraph } from '@/models/word-graph';

export type MakeState = 'awaiting-new-word' | 'awaiting-change' | 'incorrect-result' | 'correct-result';

export class MakerInteraction {
  history: MakeWordsHistory;
  currentWord: MakeCurrentWord;
  result: MakeWordResult | null = null;
  newWordToMake: Word | null = null;
  state: MakeState = 'awaiting-new-word';
  private readonly resultPlaceholder = new MakeWordResultPlaceholder();

  constructor(
    private readonly wordSayer: WordSayerInterface,
    private readonly wordGraph: WordGraph,
    initialWord: Word
  ) {
    this.history = new MakeWordsHistory();
    this.currentWord = new MakeCurrentWord(initialWord, (word: Word) => this.handleWordChange(word), this.wordSayer);

    makeAutoObservable(this);
  }

  get resultDisplay(): MakeWordResult | MakeWordResultPlaceholder {
    return this.result || this.resultPlaceholder;
  }

  get newWordAction(): ButtonAction {
    const isEnabled = this.state === 'awaiting-new-word' || this.state === 'awaiting-change';
    const handler = isEnabled ? () => this.chooseNewWord() : null;
    const tooltip = this.state === 'awaiting-new-word'
      ? 'Choose a new word to make'
      : 'Say the word again';

    return new ButtonAction(handler, { tooltip });
  }

  get deleteResultAction(): ButtonAction {
    const isEnabled = this.state === 'incorrect-result';
    const handler = isEnabled ? () => this.deleteResult() : null;
    return new ButtonAction(handler, { tooltip: 'Delete incorrect result' });
  }


  async chooseNewWord(): Promise<void> {
    if (this.state === 'awaiting-change' && this.newWordToMake) {
      // Just say the word again
      await this.wordSayer.say(this.newWordToMake.word);
      return;
    }

    // Choose a word one step away from current word
    const possibleWords = this.currentWord.word.possibleNextWords;
    if (possibleWords.length === 0) {
      return;
    }

    // Get words not yet visited in this Make interaction
    const unvisitedWords = possibleWords.filter(wordString =>
      !this.history.hasVisited(wordString)
    );

    // Choose from unvisited words if available, otherwise from all possible words
    const candidateWords = unvisitedWords.length > 0 ? unvisitedWords : possibleWords;

    // Randomly select a word
    const randomIndex = Math.floor(Math.random() * candidateWords.length);
    const selectedWordString = candidateWords[randomIndex];
    const selectedWord = this.wordGraph.getNode(selectedWordString);

    if (selectedWord) {
      this.newWordToMake = selectedWord;
      this.state = 'awaiting-change';
      this.currentWord.setInteractive(true);

      // Say the new word
      await this.wordSayer.say(selectedWordString);
    }
  }

  private async handleWordChange(resultWord: Word): Promise<void> {
    if (this.state !== 'awaiting-change' || !this.newWordToMake) {
      return;
    }

    // Create result
    this.result = new MakeWordResult(resultWord);
    this.currentWord.setInteractive(false);

    // Say the result word
    await this.wordSayer.say(resultWord.word);

    // Check if correct
    if (resultWord.word === this.newWordToMake.word) {
      this.result.setCorrect(true);
      this.state = 'correct-result';

      // Wait 1 second then advance
      setTimeout(() => this.advanceToNextWord(), 1000);
    } else {
      this.result.setCorrect(false);
      this.state = 'incorrect-result';
    }
  }

  private deleteResult(): void {
    if (this.state !== 'incorrect-result') {
      return;
    }

    this.result = null;
    this.state = 'awaiting-change';
    this.currentWord.setInteractive(true);
  }

  private advanceToNextWord(): void {
    if (this.state !== 'correct-result' || !this.result) {
      return;
    }

    // Move current word to history
    this.history.addWord(this.currentWord.word);

    // Result becomes new current word
    this.currentWord = new MakeCurrentWord(
      this.result.word,
      (word: Word) => this.handleWordChange(word),
      this.wordSayer
    );

    // Clear result and new word to make
    this.result = null;
    this.newWordToMake = null;
    this.state = 'awaiting-new-word';
    this.currentWord.setInteractive(false);
  }


}
