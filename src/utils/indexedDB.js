/**
 * IndexedDB Manager - Advanced client-side storage
 * Provides persistent storage with better performance than localStorage
 * Supports large datasets, structured queries, and transactions
 * 
 * Advantages over localStorage:
 * - No 5MB limit (can store gigabytes)
 * - Asynchronous (non-blocking)
 * - Structured data with indexes
 * - Transaction support (ACID properties)
 */

const DB_NAME = 'AgoraPlatform';
const DB_VERSION = 1;

class IndexedDBManager {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  /**
   * Initialize database with schema
   * Creates object stores (tables) and indexes
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      // Schema migration
      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Discussions store with indexes
        if (!db.objectStoreNames.contains('discussions')) {
          const discussionStore = db.createObjectStore('discussions', { keyPath: 'id' });
          discussionStore.createIndex('category', 'category', { unique: false });
          discussionStore.createIndex('username', 'username', { unique: false });
          discussionStore.createIndex('created_at', 'created_at', { unique: false });
          discussionStore.createIndex('views', 'views', { unique: false });
        }

        // Replies store
        if (!db.objectStoreNames.contains('replies')) {
          const replyStore = db.createObjectStore('replies', { keyPath: 'id', autoIncrement: true });
          replyStore.createIndex('discussionId', 'discussionId', { unique: false });
          replyStore.createIndex('username', 'username', { unique: false });
        }

        // User profile cache
        if (!db.objectStoreNames.contains('userProfile')) {
          db.createObjectStore('userProfile', { keyPath: 'userId' });
        }

        // Offline queue for failed requests
        if (!db.objectStoreNames.contains('offlineQueue')) {
          const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Generic get operation with index support
   * Complexity: O(log n) with B-tree index
   */
  async get(storeName, key) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Batch get all items from store
   * Returns cursor for efficient iteration
   */
  async getAll(storeName, limit = 100) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll(null, limit);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Indexed query for fast lookups
   * Example: getByIndex('discussions', 'category', 'Ethics')
   */
  async getByIndex(storeName, indexName, value) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Put operation with upsert semantics
   */
  async put(storeName, data) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Batch insert with transaction
   * Ensures atomicity - all succeed or all fail
   */
  async putBatch(storeName, dataArray) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      dataArray.forEach(data => store.put(data));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Delete operation
   */
  async delete(storeName, key) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear entire store
   */
  async clear(storeName) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add to offline queue for background sync
   */
  async queueOfflineAction(action) {
    await this.put('offlineQueue', {
      ...action,
      timestamp: Date.now(),
      retries: 0
    });
  }

  /**
   * Get pending offline actions
   */
  async getOfflineQueue() {
    return this.getAll('offlineQueue');
  }
}

// Singleton instance
const dbManager = new IndexedDBManager();
export default dbManager;
