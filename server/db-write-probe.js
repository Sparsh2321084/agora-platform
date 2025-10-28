const db = require('./db');

async function run() {
  console.log('🔧 Write probes starting...');
  try {
    const [r1] = await db.query('UPDATE users SET belief = ? WHERE user_id = ?',[ 'Probe belief at '+new Date().toISOString(), 'AGORA-0001']);
    console.log('✅ UPDATE users ok:', r1.affectedRows);
  } catch (e) {
    console.error('❌ UPDATE users failed:', { code: e.code, errno: e.errno, sqlState: e.sqlState, sqlMessage: e.sqlMessage });
  }

  try {
    const [r2] = await db.query('INSERT INTO notifications (user_id, type, title, message) VALUES (?,?,?,?)',[ 'AGORA-0001','test','Probe','Message']);
    console.log('✅ INSERT notifications ok:', r2.insertId);
  } catch (e) {
    console.error('❌ INSERT notifications failed:', { code: e.code, errno: e.errno, sqlState: e.sqlState, sqlMessage: e.sqlMessage });
  }

  try {
    const [r3] = await db.query('INSERT INTO discussions (user_id, username, title, content, category) VALUES (?,?,?,?,?)',[ 'AGORA-0001','sparsh trivedi','Probe discussion','Body','Ethics']);
    console.log('✅ INSERT discussions ok:', r3.insertId);
  } catch (e) {
    console.error('❌ INSERT discussions failed:', { code: e.code, errno: e.errno, sqlState: e.sqlState, sqlMessage: e.sqlMessage });
  }
}

run().then(()=>process.exit(0)).catch(err=>{ console.error(err); process.exit(1); });
