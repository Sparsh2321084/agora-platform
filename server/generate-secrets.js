// Generate secure JWT secrets for Railway deployment
const crypto = require('crypto');

console.log('='.repeat(60));
console.log('🔐 JWT SECRET GENERATOR FOR RAILWAY DEPLOYMENT');
console.log('='.repeat(60));
console.log('\nCopy these values to Railway environment variables:\n');

console.log('JWT_SECRET=');
console.log(crypto.randomBytes(32).toString('hex'));

console.log('\nJWT_REFRESH_SECRET=');
console.log(crypto.randomBytes(32).toString('hex'));

console.log('\n' + '='.repeat(60));
console.log('✅ Done! Paste these into Railway Variables tab');
console.log('='.repeat(60));
