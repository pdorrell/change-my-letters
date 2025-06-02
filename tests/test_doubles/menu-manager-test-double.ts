import React from 'react';
import { MenuManagerInterface } from '../../src/lib/models/menu-manager-interface';

/**
 * Test double for MenuManager that implements the interface without requiring MobX
 */
export class MenuManagerTestDouble implements MenuManagerInterface {
  activeButtonElement: HTMLElement | null = null;

  constructor(private closeAllMenus: () => void = () => {}) {}

  toggleMenu(
    currentlyOpen: boolean,
    setMenuOpen: () => void,
    buttonRef: React.RefObject<HTMLButtonElement>
  ): void {
    this.closeMenus();

    if (!currentlyOpen && buttonRef.current) {
      this.activeButtonElement = buttonRef.current;
      setMenuOpen();
    }
  }

  closeMenus(): void {
    this.closeAllMenus();
    this.activeButtonElement = null;
  }
}
