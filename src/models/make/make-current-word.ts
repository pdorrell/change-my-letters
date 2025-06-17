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
      disabled: false,
      showChangeHints: false,
      alwaysInteract: true
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
      return 'bg-yellow-100'; // Non-interactive: light yellow
    }
    return 'bg-orange-100'; // Interactive: light orange
  }

  setInteractive(interactive: boolean): void {
    this.isInteractive = interactive;

    // Update the word interaction options
    const options: InteractionOptions = {
      disabled: !interactive,
      showChangeHints: false,
      alwaysInteract: true
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
