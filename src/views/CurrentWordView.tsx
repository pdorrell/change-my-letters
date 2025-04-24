import React from 'react';
import { observer } from 'mobx-react-lite';
import { CurrentWord } from '../models/CurrentWord';
import { LetterView } from './LetterView';
import { PositionView } from './PositionView';
import { getAppState } from '../App';

interface CurrentWordViewProps {
  currentWord: CurrentWord;
}

/**
 * View component for displaying the current word
 */
export const CurrentWordView: React.FC<CurrentWordViewProps> = observer(({ currentWord }) => {
  const appState = getAppState();
  
  // Add a document-wide click handler to close menus when clicking outside
  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // If there's an active menu
      if (appState.activeMenuType !== 'none') {
        // Check if click is outside of menus
        // We don't close if clicked on letter-choice-menu, letter-choice-option,
        // or replace-icon/insert-icon buttons which handle their own clicks
        const target = e.target as HTMLElement;
        const menuClick = 
          target.classList.contains('letter-choice-menu') || 
          target.classList.contains('letter-choice-option') ||
          target.classList.contains('replace-icon') ||
          target.classList.contains('insert-icon');
          
        if (!menuClick) {
          appState.closeAllMenus();
        }
      }
    };
    
    // Add the click handler to document
    document.addEventListener('click', handleGlobalClick);
    
    // Clean up on component unmount
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [appState]);
  
  return (
    <div className={`current-word-container ${currentWord.previouslyVisited ? 'previously-visited' : ''}`}>      
      <div className="word-display">
        {/* Render alternating sequence of positions and letters */}
        {currentWord.positions.map((position, index) => (
          <React.Fragment key={`position-${index}`}>
            <PositionView position={position} />
            {index < currentWord.letters.length && (
              <LetterView letter={currentWord.letters[index]} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

/**
 * View component for the letter choice menu
 */
export const LetterChoiceMenu: React.FC<{ 
  options: string[],
  onSelect: (letter: string) => void,
  previouslyVisited: string[]
}> = ({ options, onSelect, previouslyVisited }) => {
  const appState = getAppState();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  
  // Calculate the position of the menu when it mounts
  React.useEffect(() => {
    // Get the button element directly from appState
    const activeButton = appState.activeButtonElement;
    
    if (activeButton && menuRef.current) {
      const buttonRect = activeButton.getBoundingClientRect();
      const menuWidth = menuRef.current.offsetWidth || 250;
      
      // Position the menu centered below the button
      setPosition({
        top: buttonRect.bottom + window.scrollY + 5, // 5px below the button
        left: Math.max(10, Math.min(
          window.innerWidth - menuWidth - 10,
          buttonRect.left + window.scrollX - (menuWidth / 2) + (buttonRect.width / 2)
        ))
      });
    } else {
      // Fallback position if no button element is found
      setPosition({
        top: 100,
        left: 100
      });
    }
  }, [appState.activeButtonElement]);
  
  // Stop propagation of clicks within the menu to prevent the global handler from closing it
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      ref={menuRef}
      className="letter-choice-menu" 
      onClick={handleMenuClick}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {options.map((letter, index) => {
        // Check if this letter would lead to a previously visited word
        const isPreviouslyVisited = previouslyVisited.includes(letter);
        
        return (
          <div 
            key={`option-${index}`}
            className={`letter-choice-option ${isPreviouslyVisited ? 'previously-visited' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(letter);
            }}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
};