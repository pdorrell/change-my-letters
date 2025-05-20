import { makeAutoObservable } from 'mobx';

/**
 * MenuManager - Handles menu state and control across the application
 */
export class MenuManager {
  // For floating menu positioning
  activeButtonElement: HTMLElement | null = null;

  /**
   * Create a new MenuManager
   * @param closeAllMenus Function that will close all menus in the application
   */
  constructor(private readonly closeAllMenus: () => void) {
    makeAutoObservable(this);
  }

  /**
   * Toggle a menu open/closed
   * @param currentlyOpen Current open state of the menu
   * @param setMenuOpen Function to open the menu
   * @param buttonElement Reference to the button element that triggered the menu
   */
  toggleMenu(currentlyOpen: boolean, setMenuOpen: () => void, buttonElement: HTMLElement): void {
    // Close all menus first
    this.closeMenus();

    // If the menu was previously closed, open it now
    if (!currentlyOpen) {
      this.activeButtonElement = buttonElement;
      setMenuOpen();
    }
  }

  /**
   * Close all menus
   */
  closeMenus(): void {
    // Call the closeAllMenus function passed in the constructor
    this.closeAllMenus();
    
    // Reset button element reference
    this.activeButtonElement = null;
  }
}