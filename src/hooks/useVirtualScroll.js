import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Virtual Scrolling (Windowing) Implementation
 * Only renders visible items + buffer for smooth scrolling
 * Complexity: O(k) where k = visible items (constant regardless of total items)
 * Memory: O(k) instead of O(n) for full list
 * 
 * Algorithm: Binary search to find visible range, sliding window technique
 */
export function useVirtualScroll({
  items = [],
  itemHeight = 100,
  containerHeight = 600,
  overscan = 3, // Extra items to render above/below viewport
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // Calculate visible range using sliding window
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Only render visible items
  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    ...item,
    index: startIndex + index,
    offsetTop: (startIndex + index) * itemHeight,
  }));

  // Throttled scroll handler using RAF (Request Animation Frame)
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      requestAnimationFrame(() => {
        setScrollTop(containerRef.current.scrollTop);
      });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return {
    containerRef,
    visibleItems,
    totalHeight: items.length * itemHeight,
    startIndex,
    endIndex,
  };
}

/**
 * Infinite scroll hook with lazy loading
 * Uses intersection observer for efficient detection
 */
export function useInfiniteScroll(fetchMore, { threshold = 0.8, enabled = true } = {}) {
  const [isFetching, setIsFetching] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching) {
          setIsFetching(true);
          fetchMore()
            .then(() => setIsFetching(false))
            .catch(() => setIsFetching(false));
        }
      },
      { threshold }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchMore, threshold, enabled, isFetching]);

  return { sentinelRef, isFetching };
}
