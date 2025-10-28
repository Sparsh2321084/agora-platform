/**
 * Database Migration Runner
 * Executes SQL migration files
 * Usage: node run-migration.js <migration-file>
 */

const fs = require('fs');
const path = require('path');
const db = require('./db');

async function runMigration() {
  // Get migration file from command line argument
  const migrationFile = process.argv[2] || 'migrations/add-voting-system.sql';
  console.log(`🗄️  Starting database migration: ${migrationFile}\n`);

  try {
    // Read the migration SQL file
    const migrationPath = path.isAbsolute(migrationFile) 
      ? migrationFile 
      : path.join(__dirname, migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    let sql = fs.readFileSync(migrationPath, 'utf8');

    // Remove comments but preserve newlines
    sql = sql.replace(/--[^\n]*/g, '');
    sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');

    // Split by DELIMITER commands and handle stored procedures separately
    const parts = sql.split(/DELIMITER\s+(\S+)/i);
    const statements = [];

    for (let i = 0; i < parts.length; i++) {
      if (i === 0) {
        // Normal SQL statements (before first DELIMITER)
        const stmts = parts[i]
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 10);
        statements.push(...stmts);
      } else if (parts[i].trim() === '//') {
        // Inside DELIMITER // block - stored procedure
        i++; // Move to next part which contains the procedure
        if (i < parts.length) {
          const procStmts = parts[i]
            .split('//')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 10);
          statements.push(...procStmts);
        }
      }
    }

    console.log(`📜 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty lines
      if (statement.startsWith('/*') || statement.length < 5) continue;

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        // Log first 100 chars of statement for debugging
        const preview = statement.substring(0, 100).replace(/\s+/g, ' ');
        console.log(`   ${preview}${statement.length > 100 ? '...' : ''}`);
        
        await db.query(statement);
        console.log(`✅ Statement ${i + 1} completed\n`);
      } catch (error) {
        // Check if error is "table already exists" (which is OK)
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.errno === 1050) {
          console.log(`⚠️  Table already exists (skipping statement ${i + 1})\n`);
          continue;
        }
        
        // Check if error is "trigger already exists" (which is OK)
        if (error.code === 'ER_TRG_ALREADY_EXISTS' || error.errno === 1359) {
          console.log(`⚠️  Trigger already exists (skipping statement ${i + 1})\n`);
          continue;
        }

        // Check if error is "function already exists" (which is OK)
        if (error.code === 'ER_SP_ALREADY_EXISTS' || error.errno === 1304) {
          console.log(`⚠️  Function/Procedure already exists (skipping statement ${i + 1})\n`);
          continue;
        }

        // Check if error is "duplicate column" (which is OK)
        if (error.code === 'ER_DUP_FIELDNAME' || error.errno === 1060) {
          console.log(`⚠️  Column already exists (skipping statement ${i + 1})\n`);
          continue;
        }

        // Check if error is "can't drop field/key" (index doesn't exist - which is OK)
        if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY' || error.errno === 1091 || error.errno === 1553) {
          console.log(`⚠️  Index/Field doesn't exist (skipping statement ${i + 1})\n`);
          continue;
        }

        // Check if syntax error on DROP INDEX IF EXISTS (MySQL version issue)
        if (error.message.includes('DROP INDEX') || error.message.includes('IF EXISTS')) {
          console.log(`⚠️  Syntax not supported or index doesn't exist (skipping statement ${i + 1})\n`);
          continue;
        }

        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        console.error(`   SQL: ${statement.substring(0, 200)}\n`);
        throw error;
      }
    }

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Verifying tables...');

    // Verify tables were created
    const [tables] = await db.query("SHOW TABLES LIKE '%votes%'");
    console.log(`   Found ${tables.length} voting tables:`, tables.map(t => Object.values(t)[0]));

    console.log('\n🎉 Voting system is ready!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
runMigration();
