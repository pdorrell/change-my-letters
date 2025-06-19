import { useRef, useEffect } from 'react';

// Custom hook for scrolling with minimum bottom space
export const useAutoScrollWithMargin = (bottomMargin: number = 20) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      const element = elementRef.current;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate how much of the element is below the viewport
      const elementBottom = rect.bottom;
      const availableSpace = viewportHeight - elementBottom;

      // Only scroll if there's insufficient space at the bottom
      if (availableSpace < bottomMargin) {
        const scrollAmount = bottomMargin - availableSpace;
        window.scrollBy({
          top: scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  }, [bottomMargin]);

  return elementRef;
};
