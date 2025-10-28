const mysql = require('mysql2/promise');
require('dotenv').config();

async function addBeliefColumn() {
  console.log('🔧 Adding belief column to users table...\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Check if belief column exists
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM users LIKE 'belief'
    `);

    if (columns.length === 0) {
      // Add belief column
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN belief VARCHAR(100)
      `);
      console.log('✅ Belief column added successfully!\n');
    } else {
      console.log('✅ Belief column already exists!\n');
    }

    
    await connection.end();
    console.log('Database updated. You can now use the belief feature!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addBeliefColumn();
