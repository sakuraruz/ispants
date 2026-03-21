import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number;
  overscan?: number;
  containerRef: React.RefObject<HTMLElement>;
  totalItems: number;
}

export function useVirtualScroll({
  itemHeight,
  overscan = 5,
  containerRef,
  totalItems
}: UseVirtualScrollOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };
    
    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };
    
    handleScroll();
    updateHeight();
    
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateHeight);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateHeight);
    };
  }, [containerRef]);
  
  const totalHeight = totalItems * itemHeight;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = endIndex - startIndex;
  const offsetY = startIndex * itemHeight;
  
  const getVirtualItems = useCallback(() => {
    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight,
        height: itemHeight
      });
    }
    return items;
  }, [startIndex, endIndex, itemHeight]);
  
  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    const targetScrollTop = index * itemHeight;
    container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
  }, [containerRef, itemHeight]);
  
  return {
    totalHeight,
    offsetY,
    visibleItems,
    startIndex,
    endIndex,
    getVirtualItems,
    scrollToIndex
  };
}