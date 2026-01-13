// Generate Prisma client with env loaded
const { execSync } = require('child_process');
require('dotenv').config();

console.log('Generating Prisma client...');
try {
    execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
    console.log('✅ Prisma client generated!');
} catch (e) {
    console.error('Failed to generate client');
}
