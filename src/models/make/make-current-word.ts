import { makeAutoObservable } from 'mobx';
import { Word } from '@/models/Word';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { WordInteraction } from '@/models/interaction/word-interaction';
import { MenuManager } from '@/lib/views/menu-manager';
import { InteractionOptions } from '@/models/interaction/interaction-options';

export class MakeCurrentWord {
  public wordInteraction: WordInteraction;
  private isInteractive: boolean = false;

  constructor(
    public readonly word: Word,
    private readonly newWordHandler: (word: Word) => void,
    private readonly wordSayer: WordSayerInterface
  ) {
    // Create a menu manager for this interaction
    const menuManager = new MenuManager(() => {
      this.wordInteraction.closeAllMenus();
    });

    // Create word interaction with special options for Make page
    const options: InteractionOptions = {
      disabled: true,  // Start as disabled until setInteractive(true) is called
      showChangeHints: false,
      alwaysInteract: false  // Start as non-interactive
    };

    this.wordInteraction = new WordInteraction(
      word,
      this.newWordHandler,
      wordSayer,
      menuManager,
      null, // No history for Make page
      options
    );

    makeAutoObservable(this);
  }

  get letters() {
    return this.wordInteraction.letters;
  }

  get positions() {
    return this.wordInteraction.positions;
  }

  get backgroundClass(): string {
    if (!this.isInteractive) {
      return 'make-current-waiting'; // Non-interactive: light yellow
    }
    return 'make-current-interactive'; // Interactive: light orange
  }

  setInteractive(interactive: boolean): void {
    this.isInteractive = interactive;

    // Update the word interaction options
    const options: InteractionOptions = {
      disabled: !interactive,
      showChangeHints: false,
      alwaysInteract: interactive  // Only show interactions when actually interactive
    };

    this.wordInteraction = new WordInteraction(
      this.word,
      this.newWordHandler,
      this.wordSayer,
      this.wordInteraction.menuManager,
      null,
      options
    );
  }

  closeAllMenus(): void {
    this.wordInteraction.closeAllMenus();
  }
}
