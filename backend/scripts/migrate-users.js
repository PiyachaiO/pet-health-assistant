const { supabase } = require('../config/supabase')
const fs = require('fs')
const path = require('path')

async function migrateUsers() {
  try {
    console.log('Starting users table migration...')
    
    // Read migration SQL
    const migrationPath = path.join(__dirname, '../../database/migrations/fix_users_table.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('Migration SQL:', migrationSQL)
    
    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    })
    
    if (error) {
      console.error('Migration error:', error)
      return
    }
    
    console.log('Migration result:', data)
    console.log('Users table migration completed successfully!')
    
    // Test the migration by querying users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, is_active, last_login')
      .limit(3)
    
    if (usersError) {
      console.error('Test query error:', usersError)
      return
    }
    
    console.log('Test query result:', users)
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrateUsers()

