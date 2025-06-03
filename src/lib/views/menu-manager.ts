import { makeAutoObservable } from 'mobx';
import React from 'react';
import { MenuManagerInterface } from './menu-manager-interface';

/**
 * MenuManager - Handles menu state and control across the application
 */
export class MenuManager implements MenuManagerInterface {
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
   * @param buttonRef Reference to the button element that triggered the menu
   */
  toggleMenu(
    currentlyOpen: boolean,
    setMenuOpen: () => void,
    buttonRef: React.RefObject<HTMLElement>
  ): void {
    // Close all menus first
    this.closeMenus();

    // If the menu was previously closed, open it now
    if (!currentlyOpen && buttonRef.current) {
      this.activeButtonElement = buttonRef.current;
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
