// Direct database migration script
const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check if Role enum exists
        const enumCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'Role'
      );
    `);

        if (!enumCheck.rows[0].exists) {
            console.log('Creating Role enum...');
            await client.query(`CREATE TYPE "Role" AS ENUM ('AGENCY', 'CLIENT');`);
            console.log('✅ Role enum created');
        } else {
            console.log('ℹ️ Role enum already exists');
        }

        // Check if role column exists on User table
        const userRoleCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'role'
      );
    `);

        if (!userRoleCheck.rows[0].exists) {
            console.log('Adding role column to User table...');
            await client.query(`ALTER TABLE "User" ADD COLUMN "role" "Role" DEFAULT 'AGENCY';`);
            console.log('✅ Role column added to User table');
        } else {
            console.log('ℹ️ Role column already exists on User table');
        }

        // Check if role column exists on MagicToken table
        const tokenRoleCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'MagicToken' AND column_name = 'role'
      );
    `);

        if (!tokenRoleCheck.rows[0].exists) {
            console.log('Adding role column to MagicToken table...');
            await client.query(`ALTER TABLE "MagicToken" ADD COLUMN "role" TEXT;`);
            console.log('✅ Role column added to MagicToken table');
        } else {
            console.log('ℹ️ Role column already exists on MagicToken table');
        }

        console.log('\n🎉 Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await client.end();
    }
}

migrate();
