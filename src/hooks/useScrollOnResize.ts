import { useRef, useEffect } from 'react';

function getScrollContainer(): Element {
  // Test if the body element scrolls
  const bodyScrollable = document.body.scrollHeight > document.body.clientHeight;

  if (bodyScrollable && document.body.scrollTop >= 0) {
    return document.body;
  }
  return document.documentElement;
}

export const useScrollOnResize = (bottomMargin: number = 20) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(`useScrollOnResize effect ...`);
    if (!containerRef.current || !bottomElementRef.current) return;

    const container = containerRef.current;
    const bottomElement = bottomElementRef.current;

    const resizeObserver = new ResizeObserver(() => {
      // Container size changed, check if bottom element needs scrolling
      console.log(`resizeObserver`);
      const rect = bottomElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementBottom = rect.bottom;
      console.debug("  elementBottom = ", elementBottom);
      const currentBottomSpace = viewportHeight - elementBottom;
      console.debug("  currentBottomSpace = ", currentBottomSpace);

      if (currentBottomSpace < bottomMargin) {
        const scrollAmount = bottomMargin - currentBottomSpace;
        console.log(`   scrolling ...`);
        console.debug("    scrollAmount = ", scrollAmount);

        // Try multiple scroll targets to ensure it works
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        const newScrollTop = currentScrollTop + scrollAmount;

        // Usage
        const scrollContainer = getScrollContainer();
        scrollContainer.scrollTo({
          top: newScrollTop,
          behavior: 'smooth'
        });
      }
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [bottomMargin]);

  return { containerRef, bottomElementRef };
};
