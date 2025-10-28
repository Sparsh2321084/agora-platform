const db = require('./db');
(async ()=>{
  try {
    // Check if username column exists in user_reputation
    const [schema] = await db.query('DESCRIBE user_reputation');
    console.log('user_reputation columns:', schema.map(s => s.Field));
    
    // Try to manually insert with the trigger
    console.log('\nTrying INSERT with trigger active...');
    const [r] = await db.query(
      'INSERT INTO discussions (user_id, username, title, content, category) VALUES (?,?,?,?,?)',
      ['AGORA-0001','sparsh trivedi','API test','Content','Ethics']
    );
    console.log('✅ SUCCESS! Discussion ID:', r.insertId);
    
    // Check if reputation updated
    const [rep] = await db.query('SELECT * FROM user_reputation WHERE user_id = ?', ['AGORA-0001']);
    console.log('Reputation after insert:', rep[0]);
  } catch (e) {
    console.error('❌ FAILED:', {
      code: e.code,
      errno: e.errno,
      sqlState: e.sqlState,
      sqlMessage: e.sqlMessage
    });
  } finally {
    process.exit(0);
  }
})();