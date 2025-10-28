// Database Diagnostics Script
// Purpose: Inspect MySQL schema objects required by voting and reputation systems
// Safe: Read-only checks (no DDL/DML)

const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const cfg = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  console.log('🔎 DB diagnostics starting...');
  console.log(`DB: ${cfg.host} / ${cfg.database}`);

  const conn = await mysql.createConnection(cfg);
  try {
    const results = {};

    // Current database
    const [[{ db: currentDb }]] = await conn.query('SELECT DATABASE() AS db');

    // Procedures
    const [procs] = await conn.query(
      `SELECT ROUTINE_NAME, ROUTINE_TYPE FROM INFORMATION_SCHEMA.ROUTINES
       WHERE ROUTINE_SCHEMA = ? AND ROUTINE_NAME IN ('calculate_hot_score','update_leaderboard_rankings')
       ORDER BY ROUTINE_NAME`, [currentDb]
    );
    results.procedures = procs;

    // Functions
    const [funcs] = await conn.query(
      `SELECT ROUTINE_NAME, ROUTINE_TYPE FROM INFORMATION_SCHEMA.ROUTINES
       WHERE ROUTINE_SCHEMA = ? AND ROUTINE_NAME IN ('calculate_controversy')
       ORDER BY ROUTINE_NAME`, [currentDb]
    );
    results.functions = funcs;

    // Triggers
    const [triggers] = await conn.query(
      `SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_TIMING
       FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA = ? ORDER BY TRIGGER_NAME`, [currentDb]
    );
    results.triggers = triggers.filter(t => (
      t.TRIGGER_NAME.startsWith('after_discussion') ||
      t.TRIGGER_NAME.startsWith('update_discussion_scores') ||
      t.TRIGGER_NAME.startsWith('update_reply_scores')
    ));

    // Views
    const [views] = await conn.query(`SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW'`);
    results.views = views;

    // Tables existence + columns
    async function describeTable(name) {
      try {
        const [rows] = await conn.query(`DESCRIBE \`${name}\``);
        return rows;
      } catch (e) {
        return { error: e.message };
      }
    }

    results.tables = {};
    for (const t of ['discussions','replies','discussion_votes','reply_votes','user_reputation','badges','user_badges','reputation_history']) {
      results.tables[t] = await describeTable(t);
    }

    // Index existence checks
    async function showIndexes(name) {
      try {
        const [rows] = await conn.query(`SHOW INDEX FROM \`${name}\``);
        return rows;
      } catch (e) {
        return { error: e.message };
      }
    }

    results.indexes = {};
    for (const t of ['discussions','replies']) {
      results.indexes[t] = await showIndexes(t);
    }

    // Print compact summary
    console.log('\n=== Procedures ===');
    for (const p of results.procedures) {
      console.log(`- ${p.ROUTINE_NAME} (${p.ROUTINE_TYPE})`);
    }
    if (!results.procedures.length) console.log('(none)');

    console.log('\n=== Functions ===');
    for (const f of results.functions) {
      console.log(`- ${f.ROUTINE_NAME} (${f.ROUTINE_TYPE})`);
    }
    if (!results.functions.length) console.log('(none)');

    console.log('\n=== Triggers (filtered) ===');
    for (const t of results.triggers) {
      console.log(`- ${t.TRIGGER_NAME} ${t.ACTION_TIMING} ${t.EVENT_MANIPULATION} ON ${t.EVENT_OBJECT_TABLE}`);
    }
    if (!results.triggers.length) console.log('(none)');

    console.log('\n=== Views ===');
    if (results.views.length) {
      for (const row of results.views) {
        const name = Object.values(row)[0];
        console.log(`- ${name}`);
      }
    } else {
      console.log('(none)');
    }

    function hasCol(desc, name) {
      return Array.isArray(desc) && desc.some(c => c.Field === name);
    }

    console.log('\n=== Schema checks ===');
    const D = results.tables;
    // discussions required cols
    const discCols = ['upvotes','downvotes','score','hot_score','controversy_score'];
    const discMissing = Array.isArray(D.discussions) ? discCols.filter(c => !hasCol(D.discussions, c)) : discCols;
    console.log(`discussions missing: ${discMissing.length ? discMissing.join(', ') : 'none'}`);

    // replies required cols
    const repCols = ['upvotes','downvotes','score'];
    const repMissing = Array.isArray(D.replies) ? repCols.filter(c => !hasCol(D.replies, c)) : repCols;
    console.log(`replies missing: ${repMissing.length ? repMissing.join(', ') : 'none'}`);

    // discussion_votes required cols
    const dvCols = ['discussion_id','user_id','vote_type'];
    const dvMissing = Array.isArray(D.discussion_votes) ? dvCols.filter(c => !hasCol(D.discussion_votes, c)) : dvCols;
    console.log(`discussion_votes missing: ${dvMissing.length ? dvMissing.join(', ') : 'none'}`);

    // reply_votes required cols
    const rvCols = ['reply_id','user_id','vote_type'];
    const rvMissing = Array.isArray(D.reply_votes) ? rvCols.filter(c => !hasCol(D.reply_votes, c)) : rvCols;
    console.log(`reply_votes missing: ${rvMissing.length ? rvMissing.join(', ') : 'none'}`);

    // Index hints
    console.log('\n=== Indexes (key ones) ===');
    const discIdx = results.indexes.discussions;
    if (Array.isArray(discIdx)) {
      const idxNames = new Set(discIdx.map(i => i.Key_name));
      console.log(`discussions indexes: ${Array.from(idxNames).join(', ')}`);
    } else { console.log('discussions indexes: (error)'); }

    const repIdx = results.indexes.replies;
    if (Array.isArray(repIdx)) {
      const idxNames = new Set(repIdx.map(i => i.Key_name));
      console.log(`replies indexes: ${Array.from(idxNames).join(', ')}`);
    } else { console.log('replies indexes: (error)'); }

    console.log('\n✅ Diagnostics complete');
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('❌ Diagnostics failed:', err.message);
  process.exit(1);
});
