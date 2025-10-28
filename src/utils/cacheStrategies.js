import dbManager from './indexedDB';

/**
 * Advanced caching strategies for optimized data fetching
 * Implements various cache patterns from HTTP/2 and service workers
 */

/**
 * Stale-While-Revalidate Pattern
 * Returns cached data immediately, then fetches fresh data in background
 * Best for frequently changing data where stale data is acceptable
 */
export async function staleWhileRevalidate(key, fetchFn, maxAge = 60000) {
  const cached = await dbManager.get('discussions', key);
  
  // Return cached data immediately if available
  if (cached && Date.now() - cached.timestamp < maxAge) {
    // Revalidate in background
    fetchFn().then(freshData => {
      dbManager.put('discussions', {
        ...freshData,
        id: key,
        timestamp: Date.now()
      });
    }).catch(console.error);
    
    return cached;
  }
  
  // No cache or expired, fetch fresh
  const freshData = await fetchFn();
  await dbManager.put('discussions', {
    ...freshData,
    id: key,
    timestamp: Date.now()
  });
  
  return freshData;
}

/**
 * Cache-First Pattern
 * Only fetch from network if cache miss
 * Best for static or rarely changing data
 */
export async function cacheFirst(key, fetchFn) {
  const cached = await dbManager.get('discussions', key);
  
  if (cached) {
    return cached;
  }
  
  const freshData = await fetchFn();
  await dbManager.put('discussions', {
    ...freshData,
    id: key,
    timestamp: Date.now()
  });
  
  return freshData;
}

/**
 * Network-First Pattern
 * Always try network first, fallback to cache
 * Best for real-time data
 */
export async function networkFirst(key, fetchFn) {
  try {
    const freshData = await fetchFn();
    await dbManager.put('discussions', {
      ...freshData,
      id: key,
      timestamp: Date.now()
    });
    return freshData;
  } catch (error) {
    console.warn('Network failed, falling back to cache:', error);
    const cached = await dbManager.get('discussions', key);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * Optimistic UI Updates
 * Update UI immediately, then sync with server
 * Rollback on failure
 */
export async function optimisticUpdate(key, updateFn, rollbackData) {
  // Apply update immediately
  const optimisticData = updateFn(rollbackData);
  await dbManager.put('discussions', {
    ...optimisticData,
    id: key,
    timestamp: Date.now()
  });
  
  try {
    // Sync with server
    const serverData = await fetch(`/api/discussions/${key}`, {
      method: 'PUT',
      body: JSON.stringify(optimisticData)
    }).then(r => r.json());
    
    // Update with server response
    await dbManager.put('discussions', {
      ...serverData,
      id: key,
      timestamp: Date.now()
    });
    
    return serverData;
  } catch (error) {
    // Rollback on failure
    console.error('Optimistic update failed, rolling back:', error);
    await dbManager.put('discussions', {
      ...rollbackData,
      id: key,
      timestamp: Date.now()
    });
    throw error;
  }
}

/**
 * Background Sync Queue
 * Queues failed requests for retry when online
 */
export async function queueForBackgroundSync(action) {
  await dbManager.queueOfflineAction(action);
  
  // Retry immediately if online
  if (navigator.onLine) {
    await processOfflineQueue();
  }
}

export async function processOfflineQueue() {
  const queue = await dbManager.getOfflineQueue();
  
  for (const action of queue) {
    try {
      await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
      });
      
      // Remove from queue on success
      await dbManager.delete('offlineQueue', action.id);
    } catch (error) {
      console.error('Failed to process queued action:', error);
      // Will retry later
    }
  }
}

// Listen for online event to process queue
if (typeof window !== 'undefined') {
  window.addEventListener('online', processOfflineQueue);
}
