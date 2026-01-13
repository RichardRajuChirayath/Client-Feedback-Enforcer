const { execSync } = require('child_process');
require('dotenv').config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

try {
    execSync('npx prisma migrate dev --name add_user_role', { stdio: 'inherit', env: process.env });
} catch (e) {
    console.error('Migration failed');
    process.exit(1);
}
