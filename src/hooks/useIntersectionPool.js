import { useEffect, useRef, useState } from 'react';

/**
 * Advanced Intersection Observer with object pooling
 * Reuses observer instances to reduce memory overhead
 * Implements singleton pattern for shared observer
 */

// Singleton observer instance (shared across all components)
let observerInstance = null;
const observedElements = new Map();

function getObserverInstance(callback, options) {
  if (!observerInstance) {
    observerInstance = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const cb = observedElements.get(entry.target);
        if (cb) cb(entry);
      });
    }, options);
  }
  return observerInstance;
}

/**
 * Hook for efficient intersection observation with pooling
 * Complexity: O(1) for observe/unobserve operations
 * Memory: O(n) where n = number of observed elements (shared pool)
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    };

    const callback = (entry) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    };

    // Add to pool
    observedElements.set(element, callback);
    const observer = getObserverInstance(callback, defaultOptions);
    observer.observe(element);

    // Cleanup: remove from pool
    return () => {
      observedElements.delete(element);
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return { elementRef, isIntersecting, hasIntersected };
}

/**
 * Advanced lazy loading hook with progressive enhancement
 */
export function useLazyLoad(threshold = 0.01) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { elementRef, hasIntersected } = useIntersectionObserver({ threshold });

  useEffect(() => {
    if (hasIntersected && !isLoaded) {
      setIsLoaded(true);
    }
  }, [hasIntersected, isLoaded]);

  return { elementRef, isLoaded };
}
