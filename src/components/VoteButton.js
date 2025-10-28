import React, { useState, useEffect } from 'react';
import './VoteButton.css';
import config from '../config';

/**
 * VOTE BUTTON COMPONENT
 * Reddit-style upvote/downvote with animations
 */
function VoteButton({ 
  itemId, 
  itemType, // 'discussion' or 'reply'
  initialScore = 0,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialUserVote = null,
  userId,
  discussionId = null, // needed for reply votes
  onVoteChange = null,
  disabled = false
}) {
  const [score, setScore] = useState(initialScore);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(initialUserVote); // 'upvote', 'downvote', or null
  const [isVoting, setIsVoting] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setScore(initialScore);
    setUpvotes(initialUpvotes);
    setDownvotes(initialDownvotes);
    setUserVote(initialUserVote);
  }, [initialScore, initialUpvotes, initialDownvotes, initialUserVote]);

  const handleVote = async (voteType) => {
    if (!userId) {
      alert('Please login to vote');
      return;
    }

    if (isVoting || disabled) return;

    setIsVoting(true);
    setAnimating(true);

    try {
      const endpoint = itemType === 'discussion' 
        ? `${config.API_URL}/discussions/${itemId}/vote`
        : `${config.API_URL}/replies/${itemId}/vote`;

      const body = itemType === 'discussion'
        ? { userId, voteType }
        : { userId, voteType, discussionId };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        setScore(data.score);
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
        setUserVote(data.vote);

        if (onVoteChange) {
          onVoteChange({
            score: data.score,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            userVote: data.vote
          });
        }
      } else {
        console.error('Vote error:', data.message);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  const formatScore = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getScoreColor = () => {
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className={`vote-container ${animating ? 'animating' : ''}`}>
      <button
        className={`vote-btn upvote-btn ${userVote === 'upvote' ? 'active' : ''} ${isVoting ? 'voting' : ''}`}
        onClick={() => handleVote('upvote')}
        disabled={isVoting || disabled}
        title={`Upvote (${upvotes})`}
        aria-label="Upvote"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="vote-icon">
          <path d="M12 4L4 12h5v8h6v-8h5z" fill="currentColor" />
        </svg>
      </button>

      <div className={`vote-score ${getScoreColor()}`}>
        <span className="score-number">{formatScore(score)}</span>
        {Math.abs(score) > 0 && (
          <div className="score-breakdown" title={`${upvotes} upvotes, ${downvotes} downvotes`}>
            <span className="breakdown-text">
              {((upvotes / (upvotes + downvotes || 1)) * 100).toFixed(0)}% upvoted
            </span>
          </div>
        )}
      </div>

      <button
        className={`vote-btn downvote-btn ${userVote === 'downvote' ? 'active' : ''} ${isVoting ? 'voting' : ''}`}
        onClick={() => handleVote('downvote')}
        disabled={isVoting || disabled}
        title={`Downvote (${downvotes})`}
        aria-label="Downvote"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="vote-icon">
          <path d="M12 20L4 12h5V4h6v8h5z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}

export default VoteButton;
