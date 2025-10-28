/**
 * Comprehensive API Test Suite - Post-Fix Validation
 * Tests all critical endpoints after database collation fixes
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let passCount = 0;
let failCount = 0;

async function test(name, testFn) {
  try {
    await testFn();
    console.log(`${colors.green}✅ PASS${colors.reset} - ${name}`);
    passCount++;
  } catch (error) {
    console.log(`${colors.red}❌ FAIL${colors.reset} - ${name}`);
    console.log(`   Error: ${error.message}`);
    if (error.response?.data) {
      console.log(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    failCount++;
  }
}

async function runTests() {
  console.log(`\n${colors.blue}${'='.repeat(60)}`);
  console.log(`   AGORA PLATFORM - POST-FIX VALIDATION TEST SUITE`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  // =============================================
  // HEALTH CHECKS
  // =============================================
  console.log(`${colors.yellow}📊 Health Checks${colors.reset}`);
  
  await test('GET /health', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.status) throw new Error('Missing status field');
  });

  // =============================================
  // USER ENDPOINTS
  // =============================================
  console.log(`\n${colors.yellow}👤 User Endpoints${colors.reset}`);
  
  await test('GET /user/:userId', async () => {
    const res = await axios.get(`${BASE_URL}/user/AGORA-0001`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.user_id) throw new Error('Missing user data');
  });

  await test('POST /belief (update belief)', async () => {
    const res = await axios.post(`${BASE_URL}/belief`, {
      userId: 'AGORA-0001',
      belief: 'Knowledge through dialogue - Updated via comprehensive test'
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // =============================================
  // DISCUSSION ENDPOINTS
  // =============================================
  console.log(`\n${colors.yellow}💬 Discussion Endpoints${colors.reset}`);
  
  let testDiscussionId;
  await test('POST /discussions (create new)', async () => {
    const res = await axios.post(`${BASE_URL}/discussions`, {
      userId: 'AGORA-0001',
      username: 'test_philosopher',
      title: 'Comprehensive Test Discussion - ' + Date.now(),
      content: 'This discussion was created by the comprehensive test suite to validate the collation fixes.',
      category: 'Philosophy'
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (!res.data.discussionId) throw new Error('Missing discussionId');
    testDiscussionId = res.data.discussionId;
  });

  await test('GET /discussions (list)', async () => {
    const res = await axios.get(`${BASE_URL}/discussions?page=1&limit=5`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.discussions)) throw new Error('Missing discussions array');
  });

  if (testDiscussionId) {
    await test('GET /discussions/:id (single)', async () => {
      const res = await axios.get(`${BASE_URL}/discussions/${testDiscussionId}`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.data.discussion) throw new Error('Missing discussion data');
    });
  }

  // =============================================
  // VOTING ENDPOINTS
  // =============================================
  console.log(`\n${colors.yellow}🗳️  Voting Endpoints${colors.reset}`);
  
  if (testDiscussionId) {
    await test('POST /discussions/:id/vote (upvote)', async () => {
      const res = await axios.post(`${BASE_URL}/discussions/${testDiscussionId}/vote`, {
        userId: 'AGORA-0001',
        voteType: 'upvote'
      });
      if (![200, 201].includes(res.status)) throw new Error(`Expected 200/201, got ${res.status}`);
      if (typeof res.data.score !== 'number') throw new Error('Missing score');
    });

    await test('POST /discussions/:id/vote (toggle off)', async () => {
      const res = await axios.post(`${BASE_URL}/discussions/${testDiscussionId}/vote`, {
        userId: 'AGORA-0001',
        voteType: 'upvote'
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.data.vote !== null) throw new Error('Vote should be removed');
    });

    await test('POST /discussions/:id/vote (downvote)', async () => {
      const res = await axios.post(`${BASE_URL}/discussions/${testDiscussionId}/vote`, {
        userId: 'AGORA-0001',
        voteType: 'downvote'
      });
      if (![200, 201].includes(res.status)) throw new Error(`Expected 200/201, got ${res.status}`);
    });

    await test('GET /discussions/:id/vote/:userId', async () => {
      const res = await axios.get(`${BASE_URL}/discussions/${testDiscussionId}/vote/AGORA-0001`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    });
  }

  // =============================================
  // REPLY ENDPOINTS
  // =============================================
  console.log(`\n${colors.yellow}💭 Reply Endpoints${colors.reset}`);
  
  let testReplyId;
  if (testDiscussionId) {
    await test('POST /replies (create reply)', async () => {
      const res = await axios.post(`${BASE_URL}/replies`, {
        discussionId: testDiscussionId,
        userId: 'AGORA-0001',
        username: 'test_philosopher',
        content: 'This is a test reply created by the comprehensive test suite.'
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      if (!res.data.replyId) throw new Error('Missing replyId');
      testReplyId = res.data.replyId;
    });

    if (testReplyId) {
      await test('POST /replies/:id/vote (upvote reply)', async () => {
        const res = await axios.post(`${BASE_URL}/replies/${testReplyId}/vote`, {
          userId: 'AGORA-0001',
          voteType: 'upvote'
        });
        if (![200, 201].includes(res.status)) throw new Error(`Expected 200/201, got ${res.status}`);
      });
    }
  }

  // =============================================
  // LEADERBOARD & REPUTATION
  // =============================================
  console.log(`\n${colors.yellow}🏆 Leaderboard & Reputation${colors.reset}`);
  
  await test('GET /api/leaderboard', async () => {
    const res = await axios.get(`${BASE_URL}/api/leaderboard?limit=10`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.leaderboard)) throw new Error('Missing leaderboard array');
  });

  await test('GET /user-reputation/:userId', async () => {
    const res = await axios.get(`${BASE_URL}/user-reputation/AGORA-0001`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.reputation) throw new Error('Missing reputation data');
  });

  // =============================================
  // BADGES
  // =============================================
  console.log(`\n${colors.yellow}🏅 Badge Endpoints${colors.reset}`);
  
  await test('GET /badges (all badges)', async () => {
    const res = await axios.get(`${BASE_URL}/badges`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.badges)) throw new Error('Missing badges array');
  });

  await test('GET /user-badges/:userId', async () => {
    const res = await axios.get(`${BASE_URL}/user-badges/AGORA-0001`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // =============================================
  // NOTIFICATIONS
  // =============================================
  console.log(`\n${colors.yellow}🔔 Notification Endpoints${colors.reset}`);
  
  await test('GET /notifications/:userId', async () => {
    const res = await axios.get(`${BASE_URL}/notifications/AGORA-0001`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.notifications)) throw new Error('Missing notifications array');
  });

  await test('POST /notifications (create)', async () => {
    const res = await axios.post(`${BASE_URL}/notifications`, {
      userId: 'AGORA-0001',
      type: 'system',
      message: 'Comprehensive test notification',
      link: '/test'
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  // =============================================
  // SEARCH
  // =============================================
  console.log(`\n${colors.yellow}🔍 Search Endpoints${colors.reset}`);
  
  await test('GET /search/discussions', async () => {
    const res = await axios.get(`${BASE_URL}/search/discussions?q=philosophy`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /search/users', async () => {
    const res = await axios.get(`${BASE_URL}/search/users?q=philosopher`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // =============================================
  // RESULTS SUMMARY
  // =============================================
  console.log(`\n${colors.blue}${'='.repeat(60)}`);
  console.log(`   TEST RESULTS SUMMARY`);
  console.log(`${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${passCount}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`);
  console.log(`${colors.blue}📊 Total:  ${passCount + failCount}${colors.reset}\n`);

  if (failCount === 0) {
    console.log(`${colors.green}🎉 ALL TESTS PASSED! The platform is fully functional.${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed. Review errors above.${colors.reset}\n`);
  }
}

// Run the test suite
runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
