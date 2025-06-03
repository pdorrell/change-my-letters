import React from 'react';

/**
 * Interface for MenuManager to allow for test doubles
 */
export interface MenuManagerInterface {
  activeButtonElement: HTMLElement | null;

  toggleMenu(
    currentlyOpen: boolean,
    setMenuOpen: () => void,
    buttonRef: React.RefObject<HTMLElement>
  ): void;

  closeMenus(): void;
}
