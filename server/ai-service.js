/**
 * AI SERVICE - OpenAI Integration
 * Provides semantic search, embeddings, and AI-powered features
 * 
 * AI FEATURES DISABLED: Set ENABLE_AI=true in .env to enable
 */

const OpenAI = require('openai');

// AI Feature Toggle
const AI_ENABLED = process.env.ENABLE_AI === 'true' && process.env.OPENAI_API_KEY;

// Initialize OpenAI client only if enabled
const openai = AI_ENABLED ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Log AI status on startup
if (AI_ENABLED) {
  console.log('🤖 AI Features: ENABLED (OpenAI)');
} else {
  console.log('🚫 AI Features: DISABLED (Using fallback search)');
  console.log('   To enable: Set ENABLE_AI=true and add OPENAI_API_KEY in .env');
}

/**
 * Generate embeddings for text using OpenAI's text-embedding-3-small model
 * Embeddings are 1536-dimensional vectors representing semantic meaning
 * 
 * @param {string} text - Text to generate embedding for
 * @returns {Promise<Array<number>>} - Vector embedding
 */
async function generateEmbedding(text) {
  // Return null if AI is disabled
  if (!AI_ENABLED) {
    return null;
  }

  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // Latest embedding model (Jan 2024)
      input: text.substring(0, 8000), // Limit to 8000 chars for token limits
      encoding_format: 'float'
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    
    // Fallback: return null if API fails
    if (error.message.includes('quota')) {
      console.warn('⚠️  OpenAI quota exceeded. AI features disabled.');
    } else if (error.message.includes('API key')) {
      console.warn('⚠️  OpenAI API key not configured. Set OPENAI_API_KEY in .env');
    }
    
    return null;
  }
}

/**
 * Calculate cosine similarity between two vectors
 * Returns value between -1 (opposite) and 1 (identical)
 * 
 * Algorithm: cos(θ) = (A · B) / (||A|| * ||B||)
 * Complexity: O(n) where n = vector dimension
 * 
 * @param {Array<number>} vecA - First vector
 * @param {Array<number>} vecB - Second vector
 * @returns {number} - Similarity score (0-1)
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  // Dot product: A · B
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  // Calculate magnitudes: ||A|| and ||B||
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  // Avoid division by zero
  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Semantic search: Find discussions similar to query
 * Uses vector similarity instead of keyword matching
 * 
 * @param {string} query - Search query
 * @param {Array<Object>} discussions - Discussions with embeddings
 * @param {number} limit - Max results to return
 * @returns {Promise<Array<Object>>} - Ranked results
 */
async function semanticSearch(query, discussions, limit = 10) {
  try {
    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);
    
    if (!queryEmbedding) {
      // Fallback to basic text search if embeddings fail
      return discussions
        .filter(d => 
          d.title?.toLowerCase().includes(query.toLowerCase()) ||
          d.content?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit);
    }

    // Calculate similarity scores
    const results = discussions
      .map(discussion => {
        // Parse embedding from JSON string if needed
        let embedding = discussion.embedding;
        if (typeof embedding === 'string') {
          try {
            embedding = JSON.parse(embedding);
          } catch (e) {
            return { ...discussion, similarity: 0 };
          }
        }

        // Skip if no embedding
        if (!embedding || !Array.isArray(embedding)) {
          return { ...discussion, similarity: 0 };
        }

        const similarity = cosineSimilarity(queryEmbedding, embedding);
        return {
          ...discussion,
          similarity
        };
      })
      .filter(d => d.similarity > 0.5) // Threshold: 50% similarity
      .sort((a, b) => b.similarity - a.similarity) // Sort by relevance
      .slice(0, limit);

    return results;
  } catch (error) {
    console.error('Semantic search error:', error.message);
    return [];
  }
}

/**
 * Find related discussions using embeddings
 * Uses vector similarity to find semantically similar content
 * 
 * @param {number} discussionId - Current discussion ID
 * @param {Array<Object>} allDiscussions - All discussions with embeddings
 * @param {number} limit - Number of related items to return
 * @returns {Array<Object>} - Related discussions
 */
function findRelated(discussionId, allDiscussions, limit = 5) {
  const current = allDiscussions.find(d => d.id === discussionId);
  
  if (!current || !current.embedding) {
    return [];
  }

  // Parse embedding if string
  let currentEmbedding = current.embedding;
  if (typeof currentEmbedding === 'string') {
    try {
      currentEmbedding = JSON.parse(currentEmbedding);
    } catch (e) {
      return [];
    }
  }

  // Calculate similarity with all other discussions
  const related = allDiscussions
    .filter(d => d.id !== discussionId) // Exclude current
    .map(discussion => {
      let embedding = discussion.embedding;
      if (typeof embedding === 'string') {
        try {
          embedding = JSON.parse(embedding);
        } catch (e) {
          return { ...discussion, similarity: 0 };
        }
      }

      if (!embedding || !Array.isArray(embedding)) {
        return { ...discussion, similarity: 0 };
      }

      const similarity = cosineSimilarity(currentEmbedding, embedding);
      return {
        ...discussion,
        similarity
      };
    })
    .filter(d => d.similarity > 0.6) // Higher threshold for "related"
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return related;
}

/**
 * Generate AI suggestions for improving discussion content
 * Uses GPT-4 for quality enhancement
 * 
 * @param {string} title - Discussion title
 * @param {string} content - Discussion content
 * @returns {Promise<Object>} - Suggestions
 */
async function getSuggestions(title, content) {
  // Return generic suggestions if AI is disabled
  if (!AI_ENABLED) {
    return {
      suggestions: '💡 AI suggestions are currently disabled. To enable smart suggestions, add OpenAI credits and set ENABLE_AI=true in .env',
      model: 'fallback',
      enabled: false
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a Socratic philosopher helping improve philosophical discussions. Provide brief, constructive suggestions for clarity, depth, and engagement. Use a wise, encouraging tone.'
        },
        {
          role: 'user',
          content: `Analyze this discussion and provide 3 brief suggestions to improve it:\n\nTitle: ${title}\n\nContent: ${content}`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return {
      suggestions: response.choices[0].message.content,
      model: 'gpt-4',
      enabled: true
    };
  } catch (error) {
    console.error('Error getting suggestions:', error.message);
    return {
      suggestions: 'Unable to generate suggestions at this time.',
      error: error.message
    };
  }
}

/**
 * Detect duplicate or very similar discussions
 * Prevents redundant content
 * 
 * @param {string} title - New discussion title
 * @param {string} content - New discussion content
 * @param {Array<Object>} existingDiscussions - Existing discussions with embeddings
 * @returns {Promise<Array<Object>>} - Potential duplicates
 */
async function detectDuplicates(title, content, existingDiscussions) {
  // Return empty array if AI is disabled - allow all posts
  if (!AI_ENABLED) {
    return [];
  }

  const text = `${title} ${content}`;
  const embedding = await generateEmbedding(text);

  if (!embedding) {
    return [];
  }

  // Find discussions with >85% similarity
  const duplicates = existingDiscussions
    .map(discussion => {
      let existingEmbedding = discussion.embedding;
      if (typeof existingEmbedding === 'string') {
        try {
          existingEmbedding = JSON.parse(existingEmbedding);
        } catch (e) {
          return null;
        }
      }

      if (!existingEmbedding) return null;

      const similarity = cosineSimilarity(embedding, existingEmbedding);
      return similarity > 0.85 ? { ...discussion, similarity } : null;
    })
    .filter(d => d !== null)
    .sort((a, b) => b.similarity - a.similarity);

  return duplicates;
}

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  semanticSearch,
  findRelated,
  getSuggestions,
  detectDuplicates
};
