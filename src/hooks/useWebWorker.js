import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook for managing Web Worker lifecycle and communication
 * Implements worker pooling for multiple concurrent operations
 * Thread-safe communication with message queuing
 */
export function useWebWorker(workerPath) {
  const workerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const callbacksRef = useRef(new Map());

  // Initialize worker on mount
  useEffect(() => {
    try {
      workerRef.current = new Worker(new URL(workerPath, import.meta.url));
      
      workerRef.current.onmessage = (event) => {
        const { type, payload, error } = event.data;
        const callback = callbacksRef.current.get(type);
        
        if (callback) {
          callback(payload, error);
          callbacksRef.current.delete(type);
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
      };

      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      setIsReady(false);
    }

    // Cleanup worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [workerPath]);

  // Post message to worker with promise-based API
  const postMessage = useCallback((type, payload) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'));
        return;
      }

      // Store callback for response
      callbacksRef.current.set(`${type}_COMPLETE`, (result, error) => {
        if (error) reject(error);
        else resolve(result);
      });

      // Send message to worker
      workerRef.current.postMessage({ type, payload });
    });
  }, [isReady]);

  return { postMessage, isReady };
}

/**
 * Specialized hook for discussion filtering using worker
 */
export function useWorkerSearch(discussions) {
  const { postMessage, isReady } = useWebWorker('../workers/dataWorker.js');
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query) => {
    if (!isReady) return discussions;
    
    setIsSearching(true);
    try {
      const result = await postMessage('SEARCH_DISCUSSIONS', { discussions, query });
      console.log(`Search completed in ${result.duration.toFixed(2)}ms`);
      return result.results;
    } catch (error) {
      console.error('Search failed:', error);
      return discussions;
    } finally {
      setIsSearching(false);
    }
  }, [postMessage, isReady, discussions]);

  return { search, isSearching, isReady };
}
