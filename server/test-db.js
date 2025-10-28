const db = require('./db');

async function testConnection() {
  console.log('🔍 Testing MySQL Database Connection...\n');

  try {
    // Test basic connection
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    console.log('✅ Database connection successful!');
    console.log(`   Test query result: ${rows[0].result}\n`);

    // Check if database exists
    const [databases] = await db.query('SHOW DATABASES LIKE "agora_db"');
    if (databases.length > 0) {
      console.log('✅ Database "agora_db" exists\n');
    } else {
      console.log('❌ Database "agora_db" NOT FOUND');
      console.log('   Please run the database.sql script first!\n');
      process.exit(1);
    }

    // Check if tables exist
    const [tables] = await db.query('SHOW TABLES FROM agora_db');
    console.log('📊 Tables in database:');
    if (tables.length > 0) {
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
      });
      console.log('');
    } else {
      console.log('   ⚠️  No tables found. Run database.sql script!\n');
    }

    // Check categories
    const [categories] = await db.query('SELECT COUNT(*) as count FROM categories');
    console.log(`✅ Categories loaded: ${categories[0].count} categories available\n`);

    // Check users
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Total users registered: ${users[0].count}\n`);

    console.log('🎉 All checks passed! Database is ready to use.\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure MySQL is running');
    console.log('   2. Check credentials in .env file');
    console.log('   3. Run database.sql script to create database');
    console.log('   4. Verify MySQL is running on port 3306\n');
    process.exit(1);
  }
}

testConnection();
