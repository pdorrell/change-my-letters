import { MenuManagerTestDouble } from '../test_doubles/menu-manager-test-double';

describe('MenuManagerTestDouble', () => {
  it('should behave like MenuManager for basic operations', () => {
    let closeAllMenusCalled = false;
    const closeAllMenus = () => { closeAllMenusCalled = true; };
    
    const menuManager = new MenuManagerTestDouble(closeAllMenus);
    
    // Test initial state
    expect(menuManager.activeButtonElement).toBeNull();
    
    // Test closeMenus
    menuManager.closeMenus();
    expect(closeAllMenusCalled).toBe(true);
    expect(menuManager.activeButtonElement).toBeNull();
    
    // Test toggleMenu with button ref
    const mockButton = document.createElement('button');
    const buttonRef = { current: mockButton };
    
    let menuOpened = false;
    const setMenuOpen = () => { menuOpened = true; };
    
    // Toggle menu when currently closed
    menuManager.toggleMenu(false, setMenuOpen, buttonRef);
    expect(menuOpened).toBe(true);
    expect(menuManager.activeButtonElement).toBe(mockButton);
    
    // Reset for next test
    menuOpened = false;
    closeAllMenusCalled = false;
    
    // Toggle menu when currently open (should close it)
    menuManager.toggleMenu(true, setMenuOpen, buttonRef);
    expect(menuOpened).toBe(false);
    expect(closeAllMenusCalled).toBe(true);
  });
  
  it('should work without closeAllMenus function', () => {
    const menuManager = new MenuManagerTestDouble();
    
    // Should not throw when calling closeMenus
    expect(() => menuManager.closeMenus()).not.toThrow();
    expect(menuManager.activeButtonElement).toBeNull();
  });
});