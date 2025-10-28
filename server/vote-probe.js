const db = require('./db');
(async ()=>{
  try{
    let [r] = await db.query('INSERT INTO discussion_votes (discussion_id,user_id,vote_type) VALUES (?,?,?)',[9,'AGORA-0002','upvote']);
    console.log('OK vote id', r.insertId);
  }catch(e){
    console.error('ERR VOTE', { code:e.code, errno:e.errno, sqlState:e.sqlState, sqlMessage:e.sqlMessage });
  } finally {
    process.exit(0);
  }
})();