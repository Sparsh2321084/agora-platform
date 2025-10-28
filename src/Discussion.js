import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Discussion-Greek.css';
import Toast from './components/Toast';
import ScrollProgress from './components/ScrollProgress';
import AnimatedCounter from './components/AnimatedCounter';
import VoteButton from './components/VoteButton';
import config from './config';
import socketService from './utils/socket';

// Memoized Reply Card Component
const ReplyCard = memo(({ reply, index, userId, discussionId }) => (
  <div 
    className="reply-card scroll-reveal" 
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="reply-vote-section">
      <VoteButton
        itemId={reply.id}
        itemType="reply"
        initialScore={reply.score || 0}
        initialUpvotes={reply.upvotes || 0}
        initialDownvotes={reply.downvotes || 0}
        initialUserVote={reply.userVote || null}
        userId={userId}
        discussionId={discussionId}
      />
    </div>
    <div className="reply-main-content">
      <div className="reply-header">
        <span className="reply-author">👤 {reply.username}</span>
        <span className="reply-date">{new Date(reply.created_at).toLocaleDateString()}</span>
      </div>
      <p className="reply-content">{reply.content}</p>
    </div>
  </div>
));

ReplyCard.displayName = 'ReplyCard';

function Discussion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [usersPresent, setUsersPresent] = useState(0);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const user = JSON.parse(localStorage.getItem('agoraUser') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('agoraUser');
    navigate('/login');
  };

  const fetchDiscussion = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/discussions/${id}`);
      const data = await res.json();

      if (res.ok) {
        setDiscussion(data.discussion);
        setReplies(data.replies || []);
      } else {
        setToast({ message: 'Discussion not found', type: 'error' });
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      console.error('Error fetching discussion:', error);
      setToast({ message: 'Network error', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    // Connect socket if not already connected
    if (!socketService.isSocketConnected()) {
      socketService.connect(user);
    }

    // Join discussion room
    if (id && user.userId) {
      socketService.joinDiscussion(id, user.userId, user.username);
    }

    // Listen for new replies
    const handleNewReply = (data) => {
      if (data.discussionId === parseInt(id)) {
        setReplies(prevReplies => [...prevReplies, data.reply]);
        setToast({ message: `New reply from ${data.reply.username}`, type: 'success' });
        
        // Update reply count in discussion
        setDiscussion(prev => prev ? { ...prev, replies: (prev.replies || 0) + 1 } : prev);
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data) => {
      setTypingUsers(data.typingUsers.filter(u => u !== user.username));
    };

    const handleUserStoppedTyping = (data) => {
      setTypingUsers(data.typingUsers.filter(u => u !== user.username));
    };

    // Listen for users joining/leaving
    const handleDiscussionJoined = (data) => {
      setUsersPresent(data.usersPresent);
    };

    const handleUserJoined = (data) => {
      setUsersPresent(data.usersPresent);
      setToast({ message: `${data.username} joined the discussion`, type: 'info' });
    };

    const handleUserLeft = (data) => {
      setToast({ message: `${data.username} left the discussion`, type: 'info' });
    };

    // Register event listeners
    socketService.on('new_reply', handleNewReply);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('user_stopped_typing', handleUserStoppedTyping);
    socketService.on('discussion_joined', handleDiscussionJoined);
    socketService.on('user_joined_discussion', handleUserJoined);
    socketService.on('user_left_discussion', handleUserLeft);

    // Cleanup on unmount
    return () => {
      if (id && user.username) {
        socketService.leaveDiscussion(id, user.username);
      }
      
      socketService.off('new_reply', handleNewReply);
      socketService.off('user_typing', handleUserTyping);
      socketService.off('user_stopped_typing', handleUserStoppedTyping);
      socketService.off('discussion_joined', handleDiscussionJoined);
      socketService.off('user_joined_discussion', handleUserJoined);
      socketService.off('user_left_discussion', handleUserLeft);
    };
  }, [id, user.userId, user.username]);

  useEffect(() => {
    fetchDiscussion();
  }, [fetchDiscussion]);

  const handleReplySubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newReply.trim()) {
      setToast({ message: 'Reply cannot be empty', type: 'error' });
      return;
    }

    if (!user.userId) {
      setToast({ message: 'Please login to reply', type: 'error' });
      return;
    }

    // Stop typing indicator
    if (isTypingRef.current) {
      socketService.typingStop(id, user.username);
      isTypingRef.current = false;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${config.API_URL}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discussionId: id,
          userId: user.userId,
          username: user.username,
          content: newReply
        })
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ message: 'Reply added successfully!', type: 'success' });
        setNewReply('');
        // No need to fetchDiscussion() - WebSocket will handle the update
      } else {
        setToast({ message: data.message || 'Failed to add reply', type: 'error' });
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      setToast({ message: 'Network error', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [id, user.userId, user.username, newReply]);

  // Handle typing indicator
  const handleReplyChange = useCallback((e) => {
    const value = e.target.value;
    setNewReply(value);

    // Emit typing start if not already typing
    if (value && !isTypingRef.current) {
      socketService.typingStart(id, user.username);
      isTypingRef.current = true;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        socketService.typingStop(id, user.username);
        isTypingRef.current = false;
      }
    }, 2000);

    // If user cleared the text, stop typing immediately
    if (!value && isTypingRef.current) {
      socketService.typingStop(id, user.username);
      isTypingRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [id, user.username]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ScrollProgress />
      
      <div className="discussion-page">
        <div className="discussion-container">
          <div className="discussion-header-section">
            <div className="discussion-category-tag">{discussion.category || 'General'}</div>
            <h1 className="discussion-title">{discussion.title}</h1>
            <div className="discussion-meta-info">
              <span className="meta-item">👤 {discussion.username}</span>
              <span className="meta-item">📅 {formatDate(discussion.created_at)}</span>
              <span className="meta-item">👁️ {discussion.views} views</span>
              <span className="meta-item">💬 {replies.length} replies</span>
              {usersPresent > 0 && (
                <span className="meta-item live-indicator" title={`${usersPresent} ${usersPresent === 1 ? 'person' : 'people'} viewing this discussion`}>
                  🟢 {usersPresent} online
                </span>
              )}
            </div>
          </div>

          <div className="discussion-content-section">
            <div className="original-post">
              <div className="post-author">
                <div className="author-avatar">👤</div>
                <div className="author-info">
                  <div className="author-name">{discussion.username}</div>
                  <div className="author-date">{formatDate(discussion.created_at)}</div>
                </div>
              </div>
              <div className="post-content">
                {discussion.content}
              </div>
            </div>

            {/* Replies Section */}
            <div className="replies-section scroll-reveal">
              <h2 className="replies-heading">
                💬 <AnimatedCounter end={replies.length} /> {replies.length === 1 ? 'Reply' : 'Replies'}
              </h2>

              {replies.length === 0 ? (
                <div className="no-replies">
                  <p>No replies yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                <div className="replies-list">
                  {replies.map((reply, index) => (
                    <ReplyCard 
                      key={index} 
                      reply={reply} 
                      index={index} 
                      userId={user.userId}
                      discussionId={id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Reply Form */}
            <div className="reply-form-section scroll-reveal">
              <h3>Add Your Reply</h3>
              
              {/* Typing indicators */}
              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  <span className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                  <span className="typing-text">
                    {typingUsers.length === 1 
                      ? `${typingUsers[0]} is typing...`
                      : typingUsers.length === 2
                      ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                      : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`
                    }
                  </span>
                </div>
              )}
              
              <form onSubmit={handleReplySubmit}>
                <textarea
                  placeholder="Share your thoughts on this discussion..."
                  value={newReply}
                  onChange={handleReplyChange}
                  rows={5}
                  disabled={submitting || loading}
                  minLength={1}
                  maxLength={2000}
                  aria-label="Reply content"
                  aria-required="true"
                />
                <small className="char-count" aria-live="polite">
                  {newReply.length}/2000 characters
                </small>
                <button 
                  type="submit" 
                  className="reply-submit-btn ripple-button" 
                  disabled={submitting || loading}
                  aria-label="Post your reply"
                >
                  {submitting ? 'Posting...' : '📤 Post Reply'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Discussion;
