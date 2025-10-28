/**
 * REPUTATION & BADGE SERVICE
 * Handles user reputation calculations, badge awards, and leaderboard rankings
 */

const db = require('./db');

/**
 * Get user reputation data
 * @param {string} userId - User ID
 * @returns {Object} Reputation data with badges
 */
async function getUserReputation(userId) {
  try {
    // Get reputation data
    const [reputation] = await db.query(`
      SELECT * FROM user_reputation WHERE user_id = ?
    `, [userId]);

    if (reputation.length === 0) {
      // Initialize reputation for new user
      return {
        user_id: userId,
        points: 0,
        level: 'Novice',
        leaderboard_rank: 0,
        posts_count: 0,
        upvotes_received: 0,
        downvotes_received: 0,
        badges: [],
        progress: {}
      };
    }

    // Get user badges
    const [badges] = await db.query(`
      SELECT b.*, ub.earned_at, ub.progress
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ?
      ORDER BY b.tier DESC, ub.earned_at DESC
    `, [userId]);

    // Get badge progress for unearn badges
    const progress = await getBadgeProgress(userId, reputation[0]);

    return {
      ...reputation[0],
      badges,
      progress
    };
  } catch (error) {
    console.error('Error getting user reputation:', error);
    throw error;
  }
}

/**
 * Calculate progress towards unearned badges
 * @param {string} userId - User ID
 * @param {Object} reputation - Current reputation data
 * @returns {Object} Progress for each badge category
 */
async function getBadgeProgress(userId, reputation) {
  try {
    const [allBadges] = await db.query(`
      SELECT * FROM badges WHERE is_active = TRUE
    `);

    const [earnedBadges] = await db.query(`
      SELECT badge_id FROM user_badges WHERE user_id = ?
    `, [userId]);

    const earnedIds = new Set(earnedBadges.map(b => b.badge_id));
    const progress = {};

    for (const badge of allBadges) {
      if (earnedIds.has(badge.id)) continue;

      const current = reputation[badge.requirement_type] || 0;
      const required = badge.requirement_value;
      const percentage = Math.min(Math.round((current / required) * 100), 100);

      if (percentage > 0) {
        progress[badge.name] = {
          current,
          required,
          percentage,
          badge: {
            id: badge.id,
            name: badge.display_name,
            icon: badge.icon,
            tier: badge.tier
          }
        };
      }
    }

    return progress;
  } catch (error) {
    console.error('Error calculating badge progress:', error);
    return {};
  }
}

/**
 * Award points to a user
 * @param {string} userId - User ID
 * @param {number} points - Points to award
 * @param {string} action - Action that earned points
 * @param {string} reason - Reason for awarding points
 * @param {string} contentType - Type of content (discussion, reply, etc.)
 * @param {number} contentId - ID of related content
 */
async function awardPoints(userId, points, action, reason, contentType = 'manual', contentId = null) {
  try {
    // Update user reputation
    await db.query(`
      INSERT INTO user_reputation (user_id, points)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        points = points + ?,
        updated_at = CURRENT_TIMESTAMP
    `, [userId, points, points]);

    // Log in history
    await db.query(`
      INSERT INTO reputation_history 
      (user_id, action, points_change, reason, related_content_type, related_content_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, action, points, reason, contentType, contentId]);

    // Check for new badges
    await checkAndAwardBadges(userId);

    return { success: true, points };
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
}

/**
 * Check if user has earned any new badges and award them
 * @param {string} userId - User ID
 */
async function checkAndAwardBadges(userId) {
  try {
    // Get current reputation
    const [reputation] = await db.query(`
      SELECT * FROM user_reputation WHERE user_id = ?
    `, [userId]);

    if (reputation.length === 0) return;

    const userRep = reputation[0];

    // Get all badges user hasn't earned yet
    const [badges] = await db.query(`
      SELECT b.*
      FROM badges b
      LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = ?
      WHERE ub.id IS NULL AND b.is_active = TRUE
    `, [userId]);

    // Check each badge requirement
    for (const badge of badges) {
      const currentValue = userRep[badge.requirement_type] || 0;
      
      if (currentValue >= badge.requirement_value) {
        // Award badge
        await db.query(`
          INSERT INTO user_badges (user_id, badge_id, progress)
          VALUES (?, ?, ?)
        `, [userId, badge.id, 100]);

        // Award bonus points for earning badge
        if (badge.points_awarded > 0) {
          await db.query(`
            UPDATE user_reputation
            SET points = points + ?
            WHERE user_id = ?
          `, [badge.points_awarded, userId]);

          await db.query(`
            INSERT INTO reputation_history 
            (user_id, action, points_change, reason, related_content_type, related_content_id)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            userId, 
            'badge_earned', 
            badge.points_awarded, 
            `Earned badge: ${badge.display_name}`, 
            'badge', 
            badge.id
          ]);
        }

        console.log(`🏆 User ${userId} earned badge: ${badge.display_name}`);
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
}

/**
 * Get leaderboard (top users by points)
 * @param {number} limit - Number of users to return
 * @param {number} offset - Offset for pagination
 * @returns {Array} Top users with reputation data
 */
async function getLeaderboard(limit = 100, offset = 0) {
  try {
    // Update rankings first
    await db.query('CALL update_leaderboard_rankings()');

    // Get top users
    const [users] = await db.query(`
      SELECT 
        ur.*,
        COUNT(DISTINCT ub.badge_id) as badge_count,
        GROUP_CONCAT(DISTINCT b.icon ORDER BY b.tier DESC SEPARATOR ' ') as top_badges
      FROM user_reputation ur
      LEFT JOIN user_badges ub ON ur.user_id = ub.user_id
      LEFT JOIN badges b ON ub.badge_id = b.id
      GROUP BY ur.user_id
      ORDER BY ur.leaderboard_rank ASC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    return users;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}

/**
 * Get reputation history for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of records to return
 * @returns {Array} Reputation history
 */
async function getReputationHistory(userId, limit = 50) {
  try {
    const [history] = await db.query(`
      SELECT * FROM reputation_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `, [userId, limit]);

    return history;
  } catch (error) {
    console.error('Error getting reputation history:', error);
    throw error;
  }
}

/**
 * Check if user has a specific privilege
 * @param {string} userId - User ID
 * @param {string} privilegeName - Privilege to check
 * @returns {boolean} Whether user has the privilege
 */
async function hasPrivilege(userId, privilegeName) {
  try {
    const [reputation] = await db.query(`
      SELECT points, level FROM user_reputation WHERE user_id = ?
    `, [userId]);

    if (reputation.length === 0) {
      // New users have basic privileges
      const basicPrivileges = ['comment', 'create_discussion'];
      return basicPrivileges.includes(privilegeName);
    }

    const [privilege] = await db.query(`
      SELECT required_points, required_level FROM user_privileges
      WHERE privilege_name = ? AND is_active = TRUE
    `, [privilegeName]);

    if (privilege.length === 0) return false;

    const userPoints = reputation[0].points;
    const requiredPoints = privilege[0].required_points;

    return userPoints >= requiredPoints;
  } catch (error) {
    console.error('Error checking privilege:', error);
    return false;
  }
}

/**
 * Get all available badges
 * @returns {Array} All badges grouped by category
 */
async function getAllBadges() {
  try {
    const [badges] = await db.query(`
      SELECT * FROM badges 
      WHERE is_active = TRUE
      ORDER BY category, tier, requirement_value ASC
    `);

    // Group by category
    const grouped = badges.reduce((acc, badge) => {
      if (!acc[badge.category]) acc[badge.category] = [];
      acc[badge.category].push(badge);
      return acc;
    }, {});

    return grouped;
  } catch (error) {
    console.error('Error getting badges:', error);
    throw error;
  }
}

/**
 * Get user's rank relative to all users
 * @param {string} userId - User ID
 * @returns {Object} Rank info (rank, total users, percentile)
 */
async function getUserRank(userId) {
  try {
    const [reputation] = await db.query(`
      SELECT leaderboard_rank, points FROM user_reputation WHERE user_id = ?
    `, [userId]);

    if (reputation.length === 0) {
      return { rank: 0, total: 0, percentile: 0 };
    }

    const [total] = await db.query(`
      SELECT COUNT(*) as total FROM user_reputation
    `);

    const rank = reputation[0].leaderboard_rank;
    const totalUsers = total[0].total;
    const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);

    return {
      rank,
      total: totalUsers,
      percentile,
      points: reputation[0].points
    };
  } catch (error) {
    console.error('Error getting user rank:', error);
    throw error;
  }
}

module.exports = {
  getUserReputation,
  awardPoints,
  checkAndAwardBadges,
  getLeaderboard,
  getReputationHistory,
  hasPrivilege,
  getAllBadges,
  getUserRank,
  getBadgeProgress
};
