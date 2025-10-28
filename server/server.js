const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./db');
// AI Service removed - no OpenAI quota
// const aiService = require('./ai-service');
const reputationService = require('./reputation-service');
const {
  sanitizeInput,
  isValidUsername,
  isValidPassword,
  getPasswordStrength,
  isValidDiscussionContent,
  isValidTitle
} = require('./utils/security');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

// Session configuration
const SESSION_CONFIG = {
  accessTokenExpiry: '15m',        // Access token expires in 15 minutes
  refreshTokenExpiry: '1h',         // Refresh token expires in 1 hour
  inactivityTimeout: 10 * 60 * 1000, // 10 minutes of inactivity
  maxSessionDuration: 60 * 60 * 1000 // 1 hour maximum session
};

// In-memory session store (for tracking last activity)
// In production, use Redis or similar
const sessionStore = new Map();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
// Security and middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://10.211.22.96:3000',
      process.env.FRONTEND_ORIGIN
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true
};

// Socket.IO Configuration
const io = socketIO(server, {
  cors: corsOptions
});

// Store active users and their socket connections
const activeUsers = new Map(); // userId -> { socketId, username, discussionId }
const typingUsers = new Map(); // discussionId -> Set of usernames

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  
  // User joins platform
  socket.on('user_online', (userData) => {
    activeUsers.set(userData.userId, {
      socketId: socket.id,
      username: userData.username,
      discussionId: null
    });
    
    // Broadcast online status to all connected clients
    io.emit('users_online_count', activeUsers.size);
    console.log(`👤 ${userData.username} is online (Total: ${activeUsers.size})`);
  });
  
  // User joins a specific discussion
  socket.on('join_discussion', (data) => {
    const { discussionId, userId, username } = data;
    
    // Leave previous discussion room if any
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room.startsWith('discussion_')) {
        socket.leave(room);
      }
    });
    
    // Join new discussion room
    const roomName = `discussion_${discussionId}`;
    socket.join(roomName);
    
    // Update user's current discussion
    if (activeUsers.has(userId)) {
      const user = activeUsers.get(userId);
      user.discussionId = discussionId;
      activeUsers.set(userId, user);
    }
    
    // Get list of users in this discussion
    const usersInRoom = Array.from(activeUsers.values())
      .filter(user => user.discussionId === discussionId)
      .map(user => user.username);
    
    // Notify user they joined
    socket.emit('discussion_joined', {
      discussionId,
      usersPresent: usersInRoom.length
    });
    
    // Notify others in room
    socket.to(roomName).emit('user_joined_discussion', {
      username,
      usersPresent: usersInRoom.length
    });
    
    console.log(`💬 ${username} joined discussion ${discussionId} (${usersInRoom.length} users present)`);
  });
  
  // User leaves discussion
  socket.on('leave_discussion', (data) => {
    const { discussionId, username } = data;
    const roomName = `discussion_${discussionId}`;
    
    socket.leave(roomName);
    socket.to(roomName).emit('user_left_discussion', { username });
    
    console.log(`👋 ${username} left discussion ${discussionId}`);
  });
  
  // User is typing
  socket.on('typing_start', (data) => {
    const { discussionId, username } = data;
    const roomName = `discussion_${discussionId}`;
    
    // Add to typing users set
    if (!typingUsers.has(discussionId)) {
      typingUsers.set(discussionId, new Set());
    }
    typingUsers.get(discussionId).add(username);
    
    // Broadcast to others in room (not to sender)
    socket.to(roomName).emit('user_typing', {
      username,
      typingUsers: Array.from(typingUsers.get(discussionId))
    });
  });
  
  // User stopped typing
  socket.on('typing_stop', (data) => {
    const { discussionId, username } = data;
    const roomName = `discussion_${discussionId}`;
    
    // Remove from typing users
    if (typingUsers.has(discussionId)) {
      typingUsers.get(discussionId).delete(username);
      
      // Clean up empty sets
      if (typingUsers.get(discussionId).size === 0) {
        typingUsers.delete(discussionId);
      }
    }
    
    const remaining = typingUsers.has(discussionId) 
      ? Array.from(typingUsers.get(discussionId))
      : [];
    
    socket.to(roomName).emit('user_stopped_typing', {
      username,
      typingUsers: remaining
    });
  });
  
  // New reply posted (server will emit this after saving to DB)
  socket.on('reply_posted', (data) => {
    const { discussionId, reply } = data;
    const roomName = `discussion_${discussionId}`;
    
    // Broadcast new reply to all users in discussion room
    io.to(roomName).emit('new_reply', {
      reply,
      discussionId
    });
    
    console.log(`📝 New reply in discussion ${discussionId} by ${reply.username}`);
  });
  
  // New discussion created
  socket.on('discussion_created', (discussion) => {
    // Broadcast to all users on dashboard
    io.emit('new_discussion', discussion);
    console.log(`🆕 New discussion created: ${discussion.title}`);
  });
  
  // Discussion upvoted/downvoted
  socket.on('vote_changed', (data) => {
    const { discussionId, replyId, voteType, newScore } = data;
    const roomName = `discussion_${discussionId}`;
    
    io.to(roomName).emit('vote_update', {
      discussionId,
      replyId,
      newScore
    });
  });
  
  // User disconnects
  socket.on('disconnect', () => {
    // Find and remove user from active users
    let disconnectedUser = null;
    for (const [userId, userData] of activeUsers.entries()) {
      if (userData.socketId === socket.id) {
        disconnectedUser = userData;
        activeUsers.delete(userId);
        
        // Remove from typing users if present
        if (userData.discussionId && typingUsers.has(userData.discussionId)) {
          typingUsers.get(userData.discussionId).delete(userData.username);
        }
        
        break;
      }
    }
    
    if (disconnectedUser) {
      // Notify discussion room if user was in one
      if (disconnectedUser.discussionId) {
        const roomName = `discussion_${disconnectedUser.discussionId}`;
        io.to(roomName).emit('user_left_discussion', {
          username: disconnectedUser.username
        });
      }
      
      console.log(`❌ ${disconnectedUser.username} disconnected (${socket.id})`);
    } else {
      console.log(`❌ Unknown user disconnected (${socket.id})`);
    }
    
    // Broadcast updated online count
    io.emit('users_online_count', activeUsers.size);
  });
});

// Rate limiting for write operations
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login/register attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(compression()); // Enable gzip compression
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

// ═══════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT UTILITIES
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate JWT Access Token (short-lived, 15 minutes)
 */
function generateAccessToken(userId, username) {
  return jwt.sign(
    { userId, username, type: 'access' },
    JWT_SECRET,
    { expiresIn: SESSION_CONFIG.accessTokenExpiry }
  );
}

/**
 * Generate JWT Refresh Token (1 hour)
 */
function generateRefreshToken(userId, username, sessionId) {
  return jwt.sign(
    { userId, username, sessionId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: SESSION_CONFIG.refreshTokenExpiry }
  );
}

/**
 * Create session record with activity tracking
 */
function createSession(userId, username) {
  const sessionId = require('crypto').randomBytes(32).toString('hex');
  const now = Date.now();
  
  const session = {
    sessionId,
    userId,
    username,
    createdAt: now,
    lastActivity: now,
    expiresAt: now + SESSION_CONFIG.maxSessionDuration
  };
  
  sessionStore.set(sessionId, session);
  
  // Auto-cleanup expired sessions
  setTimeout(() => {
    sessionStore.delete(sessionId);
  }, SESSION_CONFIG.maxSessionDuration);
  
  return sessionId;
}

/**
 * Update session activity (sliding window)
 */
function updateSessionActivity(sessionId) {
  const session = sessionStore.get(sessionId);
  if (!session) return false;
  
  const now = Date.now();
  const timeSinceLastActivity = now - session.lastActivity;
  
  // Check if session expired due to inactivity
  if (timeSinceLastActivity > SESSION_CONFIG.inactivityTimeout) {
    sessionStore.delete(sessionId);
    return false;
  }
  
  // Check if max session duration exceeded
  if (now > session.expiresAt) {
    sessionStore.delete(sessionId);
    return false;
  }
  
  // Update last activity
  session.lastActivity = now;
  return true;
}

/**
 * Verify JWT token middleware
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    req.user = decoded;
    next();
  });
}

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
    });
  }
  
  next();
}

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessionStore.entries()) {
    const timeSinceLastActivity = now - session.lastActivity;
    if (timeSinceLastActivity > SESSION_CONFIG.inactivityTimeout || now > session.expiresAt) {
      sessionStore.delete(sessionId);
    }
  }
}, 5 * 60 * 1000);

// Generate unique Agora ID
async function generateAgoraId() {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
    const count = rows[0].count + 1;
    return `AGORA-${String(count).padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating Agora ID:', error);
    throw error;
  }
}

// **REGISTER ENDPOINT**
app.post('/register', authLimiter, async (req, res) => {
  let { username, tagline, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Sanitize inputs
  username = sanitizeInput(username);
  tagline = tagline ? sanitizeInput(tagline) : '';

  // Validate username
  if (!isValidUsername(username)) {
    return res.status(400).json({ 
      message: 'Username must be 3-20 characters, alphanumeric with underscores/hyphens, starting with a letter or number' 
    });
  }

  // Validate password strength
  if (!isValidPassword(password)) {
    return res.status(400).json({ 
      message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
    });
  }

  try {
    // Check if username already exists
    const [existingUsers] = await db.query('SELECT user_id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Generate unique Agora ID
    const userId = await generateAgoraId();

    // Hash password with salt rounds 12 (secure)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user into database
    const query = 'INSERT INTO users (user_id, username, tagline, password) VALUES (?, ?, ?, ?)';
    await db.query(query, [userId, username, tagline, hashedPassword]);

    res.status(201).json({ 
      message: `Registration successful! Your Agora ID is ${userId}`,
      userId: userId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// **TOKEN REFRESH ENDPOINT**
app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ message: 'Invalid token type' });
    }
    
    // Check if session still exists and is active
    const sessionValid = updateSessionActivity(decoded.sessionId);
    
    if (!sessionValid) {
      return res.status(401).json({ 
        message: 'Session expired due to inactivity',
        code: 'SESSION_EXPIRED'
      });
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.userId, decoded.username);
    
    res.status(200).json({
      accessToken: newAccessToken,
      expiresIn: 900 // 15 minutes
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Refresh token expired. Please login again.',
        code: 'REFRESH_EXPIRED'
      });
    }
    console.error('Token refresh error:', error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// **SESSION VALIDATION ENDPOINT**
app.post('/validate-session', async (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID required' });
  }
  
  const session = sessionStore.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ 
      message: 'Session not found',
      valid: false
    });
  }
  
  const now = Date.now();
  const timeSinceLastActivity = now - session.lastActivity;
  
  // Check inactivity timeout
  if (timeSinceLastActivity > SESSION_CONFIG.inactivityTimeout) {
    sessionStore.delete(sessionId);
    return res.status(401).json({ 
      message: 'Session expired due to inactivity',
      valid: false,
      code: 'INACTIVITY_TIMEOUT'
    });
  }
  
  // Check max session duration
  if (now > session.expiresAt) {
    sessionStore.delete(sessionId);
    return res.status(401).json({ 
      message: 'Session expired (maximum duration reached)',
      valid: false,
      code: 'MAX_DURATION_EXCEEDED'
    });
  }
  
  // Update activity and return session info
  session.lastActivity = now;
  
  res.status(200).json({
    valid: true,
    session: {
      userId: session.userId,
      username: session.username,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
      remainingTime: session.expiresAt - now,
      timeSinceActivity: timeSinceLastActivity
    }
  });
});

// **LOGOUT ENDPOINT**
app.post('/logout', async (req, res) => {
  const { sessionId } = req.body;
  
  if (sessionId) {
    sessionStore.delete(sessionId);
  }
  
  res.status(200).json({ message: 'Logged out successfully' });
});


// **LOGIN ENDPOINT**
app.post('/login', authLimiter, async (req, res) => {
  let { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ message: 'User ID and password are required' });
  }

  // Sanitize user ID input
  userId = sanitizeInput(userId);

  try {
    // Find user by userId
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);

    if (rows.length === 0) {
      // Use generic message to prevent user enumeration
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Use generic message to prevent user enumeration
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get user categories
    const [categories] = await db.query(
      'SELECT category_name FROM user_categories WHERE user_id = ?',
      [userId]
    );

    const categoryList = categories.map(c => c.category_name);

    // Create session with activity tracking
    const sessionId = createSession(user.user_id, user.username);
    
    // Generate tokens
    const accessToken = generateAccessToken(user.user_id, user.username);
    const refreshToken = generateRefreshToken(user.user_id, user.username, sessionId);

    res.status(200).json({
      message: 'Login successful',
      user: {
        userId: user.user_id,
        username: user.username,
        tagline: user.tagline,
        belief: user.belief,
        categories: categoryList
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900 // 15 minutes in seconds
      },
      session: {
        sessionId,
        maxDuration: SESSION_CONFIG.maxSessionDuration,
        inactivityTimeout: SESSION_CONFIG.inactivityTimeout
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('SQL Error Code:', error.code);
    console.error('SQL Error Number:', error.errno);
    console.error('SQL Message:', error.sqlMessage);
    console.error('SQL State:', error.sqlState);
    
    // Return detailed error in development
    if (process.env.DEBUG_ERRORS === 'true') {
      return res.status(500).json({ 
        message: 'Error during login',
        error: {
          code: error.code,
          errno: error.errno,
          sqlMessage: error.sqlMessage,
          sqlState: error.sqlState
        }
      });
    }
    
    res.status(500).json({ message: 'Error during login' });
  }
});

// **BELIEF ENDPOINT**
app.post('/belief', async (req, res) => {
  let { userId, belief } = req.body;

  if (!userId || !belief) {
    return res.status(400).json({ message: 'User ID and belief are required' });
  }

  // Sanitize inputs
  userId = sanitizeInput(userId);
  belief = sanitizeInput(belief);

  // Validate belief content length (1-500 characters)
  if (belief.length < 1 || belief.length > 500) {
    return res.status(400).json({ 
      message: 'Belief must be between 1 and 500 characters' 
    });
  }

  try {
    // Update user's belief
    const query = 'UPDATE users SET belief = ? WHERE user_id = ?';
    const [result] = await db.query(query, [belief, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Belief saved successfully' });
  } catch (error) {
    console.error('Belief update error:', error);
    res.status(500).json({ message: 'Error saving belief' });
  }
});

// **CATEGORIES ENDPOINT**
app.post('/categories', async (req, res) => {
  let { userId, categories } = req.body;

  if (!userId || !categories || !Array.isArray(categories)) {
    return res.status(400).json({ message: 'User ID and categories array are required' });
  }

  // Sanitize userId and all category names
  userId = sanitizeInput(userId);
  categories = categories.map(cat => sanitizeInput(cat));

  // Validate categories array (max 10 categories)
  if (categories.length > 10) {
    return res.status(400).json({ message: 'Maximum 10 categories allowed' });
  }

  // Validate each category name (3-50 characters)
  for (const category of categories) {
    if (category.length < 3 || category.length > 50) {
      return res.status(400).json({ 
        message: 'Each category must be between 3 and 50 characters' 
      });
    }
  }

  try {
    // First, verify user exists
    const [userCheck] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [userId]);
    
    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete existing categories for this user
    await db.query('DELETE FROM user_categories WHERE user_id = ?', [userId]);

    // Insert new categories
    if (categories.length > 0) {
      const values = categories.map(category => [userId, category]);
      const query = 'INSERT INTO user_categories (user_id, category_name) VALUES ?';
      await db.query(query, [values]);
    }

    res.status(200).json({ message: 'Categories saved successfully' });
  } catch (error) {
    console.error('Categories update error:', error);
    res.status(500).json({ message: 'Error saving categories' });
  }
});

// **GET USER DATA ENDPOINT** (Optional - for fetching user profile)
app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Get user data
    const [userRows] = await db.query(
      'SELECT user_id, username, tagline, belief, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRows[0];

    // Get user categories
    const [categories] = await db.query(
      'SELECT category_name FROM user_categories WHERE user_id = ?',
      [userId]
    );

    const categoryList = categories.map(c => c.category_name);

    res.status(200).json({
      userId: user.user_id,
      username: user.username,
      tagline: user.tagline,
      belief: user.belief,
      categories: categoryList,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// **GET DISCUSSIONS ENDPOINT** - Fetch all discussions with pagination
app.get('/discussions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const category = req.query.category;

    // Build query based on category filter
    let query = `
      SELECT id, user_id, username, title, content, category, views, replies, created_at 
      FROM discussions 
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM discussions';
    let queryParams = [];
    let countParams = [];

    if (category) {
      query += ' WHERE category = ?';
      countQuery += ' WHERE category = ?';
      queryParams.push(category);
      countParams.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [discussions] = await db.query(query, queryParams);
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.status(200).json({ 
      discussions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ message: 'Error fetching discussions' });
  }
});

// **SEARCH DISCUSSIONS ENDPOINT**
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const category = req.query.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!query || query.trim().length < 2) {
      return res.status(200).json({ 
        discussions: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      });
    }

    // Build search query with LIKE for title and content
    let searchQuery = `
      SELECT id, user_id, username, title, content, category, views, replies, created_at 
      FROM discussions 
      WHERE (title LIKE ? OR content LIKE ?)
    `;
    let countQuery = `
      SELECT COUNT(*) as total FROM discussions 
      WHERE (title LIKE ? OR content LIKE ?)
    `;
    
    const searchTerm = `%${query}%`;
    let queryParams = [searchTerm, searchTerm];
    let countParams = [searchTerm, searchTerm];

    // Add category filter if provided
    if (category && category !== 'all') {
      searchQuery += ' AND category = ?';
      countQuery += ' AND category = ?';
      queryParams.push(category);
      countParams.push(category);
    }

    searchQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [discussions] = await db.query(searchQuery, queryParams);
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.status(200).json({ 
      discussions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching discussions:', error);
    res.status(500).json({ message: 'Error searching discussions' });
  }
});

// AI-POWERED ENDPOINTS REMOVED - No OpenAI quota available
// Semantic search, related discussions, suggestions, and duplicate detection disabled

// **CREATE DISCUSSION ENDPOINT**
app.post('/discussions', writeLimiter, async (req, res) => {
  let { userId, username, title, content, category } = req.body;

  if (!userId || !username || !title || !content) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Sanitize all inputs to prevent XSS
  userId = sanitizeInput(userId);
  username = sanitizeInput(username);
  title = sanitizeInput(title);
  content = sanitizeInput(content);
  category = category ? sanitizeInput(category) : null;

  // Validate title format
  if (!isValidTitle(title)) {
    return res.status(400).json({ 
      message: 'Invalid title. Must be between 5 and 200 characters.' 
    });
  }

  // Validate discussion content
  if (!isValidDiscussionContent(content, false)) {
    return res.status(400).json({ 
      message: 'Invalid discussion content. Must be between 10 and 5000 characters.' 
    });
  }

  try {
    // AI embedding generation removed - no OpenAI quota
    
    // Insert discussion without embedding
    const query = 'INSERT INTO discussions (user_id, username, title, content, category) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [userId, username, title, content, category]);

    const newDiscussion = {
      id: result.insertId,
      user_id: userId,
      username,
      title,
      content,
      category,
      views: 0,
      replies: 0,
      created_at: new Date()
    };

    // Emit WebSocket event for real-time update
    io.emit('new_discussion', newDiscussion);

    res.status(201).json({ 
      message: 'Discussion created successfully',
      discussionId: result.insertId
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    console.error('SQL Error Code:', error.code);
    console.error('SQL Error Number:', error.errno);
    console.error('SQL Message:', error.sqlMessage);
    console.error('SQL State:', error.sqlState);
    
    // Return detailed error in development
    if (process.env.DEBUG_ERRORS === 'true') {
      return res.status(500).json({ 
        message: 'Error creating discussion',
        error: {
          code: error.code,
          errno: error.errno,
          sqlMessage: error.sqlMessage,
          sqlState: error.sqlState
        }
      });
    }
    
    res.status(500).json({ message: 'Error creating discussion' });
  }
});

// **GET SINGLE DISCUSSION ENDPOINT**
app.get('/discussions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [discussion] = await db.query(
      'SELECT * FROM discussions WHERE id = ?',
      [id]
    );

    if (discussion.length === 0) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Increment views
    await db.query('UPDATE discussions SET views = views + 1 WHERE id = ?', [id]);

    // Get replies
    const [replies] = await db.query(
      'SELECT * FROM replies WHERE discussion_id = ? ORDER BY created_at ASC',
      [id]
    );

    res.status(200).json({
      discussion: discussion[0],
      replies
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ message: 'Error fetching discussion' });
  }
});

// **CREATE REPLY ENDPOINT**
app.post('/replies', writeLimiter, async (req, res) => {
  let { discussionId, userId, username, content } = req.body;

  if (!discussionId || !userId || !username || !content) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Sanitize all inputs to prevent XSS
  discussionId = sanitizeInput(discussionId);
  userId = sanitizeInput(userId);
  username = sanitizeInput(username);
  content = sanitizeInput(content);

  // Validate reply content (shorter than discussions)
  if (!isValidDiscussionContent(content, true)) {
    return res.status(400).json({ 
      message: 'Invalid reply content. Must be between 1 and 2000 characters.' 
    });
  }

  try {
    const query = 'INSERT INTO replies (discussion_id, user_id, username, content) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(query, [discussionId, userId, username, content]);

    // Update reply count in discussions table
    await db.query('UPDATE discussions SET replies = replies + 1 WHERE id = ?', [discussionId]);

    const newReply = {
      id: result.insertId,
      discussion_id: discussionId,
      user_id: userId,
      username,
      content,
      created_at: new Date()
    };

    // Emit WebSocket event for real-time update to discussion room
    io.to(`discussion_${discussionId}`).emit('new_reply', {
      reply: newReply,
      discussionId
    });

    res.status(201).json({ 
      message: 'Reply added successfully',
      replyId: result.insertId,
      reply: newReply
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ message: 'Error creating reply' });
  }
});

// **GET NOTIFICATIONS ENDPOINT**
app.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const unreadOnly = req.query.unread === 'true';

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];

    if (unreadOnly) {
      query += ' AND is_read = FALSE';
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [notifications] = await db.query(query, params);

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// **MARK NOTIFICATION AS READ**
app.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// **MARK ALL NOTIFICATIONS AS READ**
app.put('/notifications/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE', [userId]);
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

// **CREATE NOTIFICATION (internal/helper)**
app.post('/notifications', async (req, res) => {
  try {
    const { userId, type, title, message, link } = req.body;
    
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const query = 'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [userId, type, title, message, link || null]);

    res.status(201).json({ 
      message: 'Notification created',
      notificationId: result.insertId
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// VOTING ENDPOINTS - Reddit-style upvote/downvote system
// ═══════════════════════════════════════════════════════════════════

/**
 * Vote on a discussion
 * POST /discussions/:id/vote
 * Body: { userId, voteType: 'upvote' | 'downvote' }
 */
app.post('/discussions/:id/vote', writeLimiter, async (req, res) => {
  const { id } = req.params;
  let { userId, voteType } = req.body;

  if (!userId || !voteType) {
    return res.status(400).json({ message: 'User ID and vote type are required' });
  }

  if (!['upvote', 'downvote'].includes(voteType)) {
    return res.status(400).json({ message: 'Vote type must be "upvote" or "downvote"' });
  }

  // Sanitize inputs
  userId = sanitizeInput(userId);

  try {
    // Check if user already voted
    const [existingVote] = await db.query(
      'SELECT * FROM discussion_votes WHERE discussion_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingVote.length > 0) {
      const currentVote = existingVote[0];

      // If same vote type, remove vote (toggle off)
      if (currentVote.vote_type === voteType) {
        await db.query(
          'DELETE FROM discussion_votes WHERE discussion_id = ? AND user_id = ?',
          [id, userId]
        );

        // Manually update scores since DELETE doesn't trigger our INSERT trigger
        await recalculateDiscussionScores(id);

        const [updated] = await db.query(
          'SELECT score, upvotes, downvotes FROM discussions WHERE id = ?',
          [id]
        );

        // Emit WebSocket update
        io.to(`discussion_${id}`).emit('vote_update', {
          discussionId: id,
          score: updated[0].score,
          upvotes: updated[0].upvotes,
          downvotes: updated[0].downvotes
        });

        return res.status(200).json({
          message: 'Vote removed',
          vote: null,
          score: updated[0].score,
          upvotes: updated[0].upvotes,
          downvotes: updated[0].downvotes
        });
      } else {
        // Change vote (upvote → downvote or vice versa)
        await db.query(
          'UPDATE discussion_votes SET vote_type = ?, updated_at = NOW() WHERE discussion_id = ? AND user_id = ?',
          [voteType, id, userId]
        );

        const [updated] = await db.query(
          'SELECT score, upvotes, downvotes FROM discussions WHERE id = ?',
          [id]
        );

        // Emit WebSocket update
        io.to(`discussion_${id}`).emit('vote_update', {
          discussionId: id,
          score: updated[0].score,
          upvotes: updated[0].upvotes,
          downvotes: updated[0].downvotes
        });

        return res.status(200).json({
          message: 'Vote updated',
          vote: voteType,
          score: updated[0].score,
          upvotes: updated[0].upvotes,
          downvotes: updated[0].downvotes
        });
      }
    }

    // New vote
    await db.query(
      'INSERT INTO discussion_votes (discussion_id, user_id, vote_type) VALUES (?, ?, ?)',
      [id, userId, voteType]
    );

    // Triggers will automatically update scores
    const [updated] = await db.query(
      'SELECT score, upvotes, downvotes FROM discussions WHERE id = ?',
      [id]
    );

    // Emit WebSocket update
    io.to(`discussion_${id}`).emit('vote_update', {
      discussionId: id,
      score: updated[0].score,
      upvotes: updated[0].upvotes,
      downvotes: updated[0].downvotes
    });

    res.status(201).json({
      message: 'Vote recorded',
      vote: voteType,
      score: updated[0].score,
      upvotes: updated[0].upvotes,
      downvotes: updated[0].downvotes
    });
  } catch (error) {
    console.error('Error voting on discussion:', error);
    console.error('SQL Error Code:', error.code);
    console.error('SQL Error Number:', error.errno);
    console.error('SQL Message:', error.sqlMessage);
    console.error('SQL State:', error.sqlState);
    
    // Return detailed error in development
    if (process.env.DEBUG_ERRORS === 'true') {
      return res.status(500).json({ 
        message: 'Error processing vote',
        error: {
          code: error.code,
          errno: error.errno,
          sqlMessage: error.sqlMessage,
          sqlState: error.sqlState
        }
      });
    }
    
    res.status(500).json({ message: 'Error processing vote' });
  }
});

/**
 * Get user's vote on a discussion
 * GET /discussions/:id/vote/:userId
 */
app.get('/discussions/:id/vote/:userId', async (req, res) => {
  const { id, userId } = req.params;

  try {
    const [vote] = await db.query(
      'SELECT vote_type FROM discussion_votes WHERE discussion_id = ? AND user_id = ?',
      [id, userId]
    );

    res.status(200).json({
      vote: vote.length > 0 ? vote[0].vote_type : null
    });
  } catch (error) {
    console.error('Error fetching vote:', error);
    res.status(500).json({ message: 'Error fetching vote' });
  }
});

/**
 * Vote on a reply
 * POST /replies/:id/vote
 */
app.post('/replies/:id/vote', writeLimiter, async (req, res) => {
  const { id } = req.params;
  let { userId, voteType, discussionId } = req.body;

  if (!userId || !voteType) {
    return res.status(400).json({ message: 'User ID and vote type are required' });
  }

  if (!['upvote', 'downvote'].includes(voteType)) {
    return res.status(400).json({ message: 'Vote type must be "upvote" or "downvote"' });
  }

  userId = sanitizeInput(userId);

  try {
    const [existingVote] = await db.query(
      'SELECT * FROM reply_votes WHERE reply_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingVote.length > 0) {
      const currentVote = existingVote[0];

      if (currentVote.vote_type === voteType) {
        // Remove vote
        await db.query(
          'DELETE FROM reply_votes WHERE reply_id = ? AND user_id = ?',
          [id, userId]
        );

        await recalculateReplyScores(id);

        const [updated] = await db.query(
          'SELECT score, upvotes, downvotes FROM replies WHERE id = ?',
          [id]
        );

        // Emit WebSocket update
        if (discussionId) {
          io.to(`discussion_${discussionId}`).emit('vote_update', {
            replyId: id,
            discussionId,
            score: updated[0].score,
            upvotes: updated[0].upvotes,
            downvotes: updated[0].downvotes
          });
        }

        return res.status(200).json({
          message: 'Vote removed',
          vote: null,
          score: updated[0].score,
          upvotes: updated[0].upvotes,
          downvotes: updated[0].downvotes
        });
      } else {
        // Change vote
        await db.query(
          'UPDATE reply_votes SET vote_type = ?, updated_at = NOW() WHERE reply_id = ? AND user_id = ?',
          [voteType, id, userId]
        );

        const [updated] = await db.query(
          'SELECT score, upvotes, downvotes FROM replies WHERE id = ?',
          [id]
        );

        if (discussionId) {
          io.to(`discussion_${discussionId}`).emit('vote_update', {
            replyId: id,
            discussionId,
            score: updated[0].score,
            upvotes: updated[0].upvotes,
            downvotes: updated[0].downvotes
          });
        }

        return res.status(200).json({
          message: 'Vote updated',
          vote: voteType,
          score: updated[0].score,
          upvotes: updated[0].upvotes,
          downvotes: updated[0].downvotes
        });
      }
    }

    // New vote
    await db.query(
      'INSERT INTO reply_votes (reply_id, user_id, vote_type) VALUES (?, ?, ?)',
      [id, userId, voteType]
    );

    const [updated] = await db.query(
      'SELECT score, upvotes, downvotes FROM replies WHERE id = ?',
      [id]
    );

    if (discussionId) {
      io.to(`discussion_${discussionId}`).emit('vote_update', {
        replyId: id,
        discussionId,
        score: updated[0].score,
        upvotes: updated[0].upvotes,
        downvotes: updated[0].downvotes
      });
    }

    res.status(201).json({
      message: 'Vote recorded',
      vote: voteType,
      score: updated[0].score,
      upvotes: updated[0].upvotes,
      downvotes: updated[0].downvotes
    });
  } catch (error) {
    console.error('Error voting on reply:', error);
    res.status(500).json({ message: 'Error processing vote' });
  }
});

/**
 * Helper function to recalculate discussion scores (for DELETE operations)
 */
async function recalculateDiscussionScores(discussionId) {
  const [votes] = await db.query(
    'SELECT vote_type FROM discussion_votes WHERE discussion_id = ?',
    [discussionId]
  );

  const upvotes = votes.filter(v => v.vote_type === 'upvote').length;
  const downvotes = votes.filter(v => v.vote_type === 'downvote').length;
  const score = upvotes - downvotes;

  await db.query(
    'UPDATE discussions SET upvotes = ?, downvotes = ?, score = ? WHERE id = ?',
    [upvotes, downvotes, score, discussionId]
  );

  // Recalculate hot score using stored procedure
  await db.query('CALL calculate_hot_score(?)', [discussionId]);
}

/**
 * Helper function to recalculate reply scores
 */
async function recalculateReplyScores(replyId) {
  const [votes] = await db.query(
    'SELECT vote_type FROM reply_votes WHERE reply_id = ?',
    [replyId]
  );

  const upvotes = votes.filter(v => v.vote_type === 'upvote').length;
  const downvotes = votes.filter(v => v.vote_type === 'downvote').length;
  const score = upvotes - downvotes;

  await db.query(
    'UPDATE replies SET upvotes = ?, downvotes = ?, score = ? WHERE id = ?',
    [upvotes, downvotes, score, replyId]
  );
}

// Test endpoint
app.get('/', (req, res) => {
  res.send('Agora Platform API is running!');
});

// Health endpoint for load balancers / uptime checks
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// ═══════════════════════════════════════════════════════════════════
// REPUTATION & BADGE SYSTEM ENDPOINTS 🏆
// ═══════════════════════════════════════════════════════════════════

// **GET USER REPUTATION**
app.get('/api/reputation/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const reputation = await reputationService.getUserReputation(userId);
    res.status(200).json(reputation);
  } catch (error) {
    console.error('❌ Error getting reputation:', error);
    res.status(500).json({ message: 'Failed to get reputation data' });
  }
});

// **GET LEADERBOARD**
app.get('/api/leaderboard', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const leaderboard = await reputationService.getLeaderboard(limit, offset);
    res.status(200).json({ leaderboard, limit, offset });
  } catch (error) {
    console.error('❌ Error getting leaderboard:', error);
    res.status(500).json({ message: 'Failed to get leaderboard' });
  }
});

// **GET REPUTATION HISTORY**
app.get('/api/reputation/:userId/history', async (req, res) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  try {
    const history = await reputationService.getReputationHistory(userId, limit);
    res.status(200).json({ history });
  } catch (error) {
    console.error('❌ Error getting reputation history:', error);
    res.status(500).json({ message: 'Failed to get reputation history' });
  }
});

// **GET ALL BADGES**
app.get('/api/badges', async (req, res) => {
  try {
    const badges = await reputationService.getAllBadges();
    res.status(200).json({ badges });
  } catch (error) {
    console.error('❌ Error getting badges:', error);
    res.status(500).json({ message: 'Failed to get badges' });
  }
});

// **GET USER RANK**
app.get('/api/reputation/:userId/rank', async (req, res) => {
  const { userId } = req.params;

  try {
    const rankInfo = await reputationService.getUserRank(userId);
    res.status(200).json(rankInfo);
  } catch (error) {
    console.error('❌ Error getting user rank:', error);
    res.status(500).json({ message: 'Failed to get user rank' });
  }
});

// **CHECK PRIVILEGE**
app.get('/api/reputation/:userId/privilege/:privilegeName', async (req, res) => {
  const { userId, privilegeName } = req.params;

  try {
    const hasAccess = await reputationService.hasPrivilege(userId, privilegeName);
    res.status(200).json({ hasPrivilege: hasAccess, privilegeName });
  } catch (error) {
    console.error('❌ Error checking privilege:', error);
    res.status(500).json({ message: 'Failed to check privilege' });
  }
});

// **AWARD POINTS (Admin/System only)**
app.post('/api/reputation/:userId/award', async (req, res) => {
  const { userId } = req.params;
  const { points, action, reason, contentType, contentId } = req.body;

  if (!points || !action || !reason) {
    return res.status(400).json({ message: 'Points, action, and reason are required' });
  }

  try {
    await reputationService.awardPoints(userId, points, action, reason, contentType, contentId);
    res.status(200).json({ success: true, message: `Awarded ${points} points` });
  } catch (error) {
    console.error('❌ Error awarding points:', error);
    res.status(500).json({ message: 'Failed to award points' });
  }
});

// Centralized error handler (fallback)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server with Socket.IO
server.listen(PORT, () => {
  console.log(`🏛️  Agora Platform Server`);
  console.log(`📡 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`);
  console.log(`✨ Real-time features enabled!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
