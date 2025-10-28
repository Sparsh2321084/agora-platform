const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  console.log('🔧 Setting up Agora database...\n');

  try {
    // Connect without selecting a database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('✅ Connected to MySQL server\n');

    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS agora_db');
    console.log('✅ Database "agora_db" created\n');

    // Use the database
    await connection.query('USE agora_db');

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(20) UNIQUE NOT NULL,
        username VARCHAR(100) NOT NULL,
        tagline VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        belief VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "users" created');

    // Create categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      )
    `);
    console.log('✅ Table "categories" created');

    // Create user_categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL,
        category_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (category_name) REFERENCES categories(name) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table "user_categories" created\n');

    // Insert default categories
    const categories = [
      'Ethics',
      'Free Will',
      'Consciousness',
      'Morality',
      'Metaphysics',
      'Political Philosophy',
      'Logic & Reasoning',
      'Existentialism'
    ];

    for (const category of categories) {
      await connection.query(
        'INSERT IGNORE INTO categories (name) VALUES (?)',
        [category]
      );
    }
    console.log('✅ Default categories inserted (8 categories)\n');

    await connection.end();

    console.log('🎉 Database setup complete!\n');
    console.log('You can now start the server with: node server.js\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
