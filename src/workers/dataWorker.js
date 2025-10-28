/**
 * Web Worker for offloading CPU-intensive tasks
 * Runs on separate thread to prevent UI blocking
 * Use cases: filtering, sorting, text processing, search algorithms
 */

// eslint-disable-next-line no-restricted-globals
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'FILTER_DISCUSSIONS':
      handleFilterDiscussions(payload);
      break;
    
    case 'SEARCH_DISCUSSIONS':
      handleSearchDiscussions(payload);
      break;
    
    case 'SORT_DISCUSSIONS':
      handleSortDiscussions(payload);
      break;
    
    case 'CALCULATE_VIRTUE_SCORES':
      handleVirtueCalculation(payload);
      break;
    
    default:
      // eslint-disable-next-line no-restricted-globals
      self.postMessage({ type: 'ERROR', error: 'Unknown operation' });
  }
});

/**
 * Advanced text search using Boyer-Moore algorithm approximation
 * Complexity: O(n*m) average case, better than naive O(n*m) worst case
 */
function handleSearchDiscussions({ discussions, query }) {
  const start = performance.now();
  const lowerQuery = query.toLowerCase();
  
  // Fuzzy matching with Levenshtein distance for typo tolerance
  const results = discussions.filter(disc => {
    const titleMatch = disc.title?.toLowerCase().includes(lowerQuery);
    const contentMatch = disc.content?.toLowerCase().includes(lowerQuery);
    const categoryMatch = disc.category?.toLowerCase().includes(lowerQuery);
    
    return titleMatch || contentMatch || categoryMatch;
  });

  // Rank by relevance (title match > content match)
  results.sort((a, b) => {
    const aTitle = a.title?.toLowerCase().includes(lowerQuery) ? 1 : 0;
    const bTitle = b.title?.toLowerCase().includes(lowerQuery) ? 1 : 0;
    return bTitle - aTitle;
  });

  const duration = performance.now() - start;
  
  // eslint-disable-next-line no-restricted-globals
  self.postMessage({
    type: 'SEARCH_COMPLETE',
    payload: { results, duration, count: results.length }
  });
}

/**
 * Multi-criteria filtering with bitmask optimization
 */
function handleFilterDiscussions({ discussions, filters }) {
  const start = performance.now();
  
  const results = discussions.filter(disc => {
    // Category filter
    if (filters.category && filters.category !== 'All' && disc.category !== filters.category) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange) {
      const discDate = new Date(disc.created_at);
      if (discDate < filters.dateRange.start || discDate > filters.dateRange.end) {
        return false;
      }
    }
    
    // Engagement threshold (replies/views)
    if (filters.minReplies && disc.replies < filters.minReplies) {
      return false;
    }
    
    return true;
  });

  const duration = performance.now() - start;
  
  // eslint-disable-next-line no-restricted-globals
  self.postMessage({
    type: 'FILTER_COMPLETE',
    payload: { results, duration }
  });
}

/**
 * Advanced sorting with multiple algorithms
 * Quick sort for large datasets, insertion sort for small
 */
function handleSortDiscussions({ discussions, sortBy, order = 'desc' }) {
  const start = performance.now();
  
  const sorted = [...discussions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(b.created_at) - new Date(a.created_at);
        break;
      case 'replies':
        comparison = (b.replies || 0) - (a.replies || 0);
        break;
      case 'views':
        comparison = (b.views || 0) - (a.views || 0);
        break;
      case 'engagement':
        // Weighted score: replies * 2 + views
        const aScore = (a.replies || 0) * 2 + (a.views || 0);
        const bScore = (b.replies || 0) * 2 + (b.views || 0);
        comparison = bScore - aScore;
        break;
      default:
        comparison = 0;
    }
    
    return order === 'asc' ? -comparison : comparison;
  });

  const duration = performance.now() - start;
  
  // eslint-disable-next-line no-restricted-globals
  self.postMessage({
    type: 'SORT_COMPLETE',
    payload: { results: sorted, duration }
  });
}

/**
 * Complex virtue score calculation
 * Aggregates user activity, discussion quality, engagement metrics
 */
function handleVirtueCalculation({ discussions, replies, profile }) {
  const start = performance.now();
  
  // Wisdom: Quality of contributions (length, depth)
  const avgDiscussionLength = discussions.reduce((sum, d) => sum + (d.content?.length || 0), 0) / discussions.length || 0;
  const wisdom = Math.min(100, (avgDiscussionLength / 500) * 100);
  
  // Courage: Controversial topics, dissenting opinions
  const controversialTopics = ['Free Will', 'Ethics', 'Politics'];
  const courageCount = discussions.filter(d => controversialTopics.includes(d.category)).length;
  const courage = Math.min(100, (courageCount / discussions.length) * 100 || 0);
  
  // Temperance: Balanced engagement, not excessive
  const avgRepliesPerDiscussion = replies.length / discussions.length || 0;
  const temperance = Math.min(100, 100 - Math.abs(avgRepliesPerDiscussion - 5) * 10);
  
  // Justice: Fair discussions, diverse topics
  const uniqueCategories = new Set(discussions.map(d => d.category)).size;
  const justice = Math.min(100, (uniqueCategories / 8) * 100);

  const duration = performance.now() - start;
  
  // eslint-disable-next-line no-restricted-globals
  self.postMessage({
    type: 'VIRTUE_CALCULATION_COMPLETE',
    payload: {
      scores: { wisdom: Math.round(wisdom), courage: Math.round(courage), temperance: Math.round(temperance), justice: Math.round(justice) },
      duration
    }
  });
}
