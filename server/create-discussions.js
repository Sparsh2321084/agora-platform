const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDiscussionsTable() {
  console.log('🔧 Creating discussions table...\n');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Create discussions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS discussions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL,
        username VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100),
        views INT DEFAULT 0,
        replies INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table "discussions" created');

    // Create replies table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        discussion_id INT NOT NULL,
        user_id VARCHAR(20) NOT NULL,
        username VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table "replies" created\n');

    // Insert sample discussions
    const sampleDiscussions = [
      {
        user_id: 'AGORA-0001',
        username: 'Philosopher',
        title: 'Is Free Will an Illusion?',
        content: 'Many argue that our choices are predetermined by prior causes. What do you think about determinism vs free will?',
        category: 'Free Will'
      },
      {
        user_id: 'AGORA-0001',
        username: 'Thinker',
        title: 'Ethics in Modern Society',
        content: 'How should we approach moral questions in an increasingly complex world? Share your thoughts on contemporary ethics.',
        category: 'Ethics'
      },
      {
        user_id: 'AGORA-0001',
        username: 'Seeker',
        title: 'The Nature of Consciousness',
        content: 'What is consciousness? Is it purely physical or something more? Join the discussion on the hard problem of consciousness.',
        category: 'Consciousness'
      }
    ];

    for (const disc of sampleDiscussions) {
      await connection.query(
        'INSERT INTO discussions (user_id, username, title, content, category) VALUES (?, ?, ?, ?, ?)',
        [disc.user_id, disc.username, disc.title, disc.content, disc.category]
      );
    }
    console.log('✅ Sample discussions inserted\n');

    await connection.end();
    console.log('🎉 Discussions feature setup complete!\n');

  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      console.log('⚠️  Note: Sample discussions require user AGORA-0001 to exist\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

createDiscussionsTable();
