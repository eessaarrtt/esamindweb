// Helper script to generate bcrypt hash for ADMIN_PASSWORD_HASH
// Usage: node scripts/hash-password.js your-password

const bcrypt = require('bcryptjs')

const password = process.argv[2]

if (!password) {
  console.error('Usage: node scripts/hash-password.js <password>')
  process.exit(1)
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('Password hash:', hash)
  console.log('Add this to your .env file as ADMIN_PASSWORD_HASH')
})

