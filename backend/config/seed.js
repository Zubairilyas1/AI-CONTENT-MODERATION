const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Policy = require('../models/Policy');
const { CATEGORIES } = require('../models/Policy');

async function seedDatabase() {
  const adminExists = await User.findOne({ email: 'admin@platform.com' });
  if (!adminExists) {
    const adminHash = await bcrypt.hash('Admin123', 10);
    await User.create({
      name: 'Platform Admin',
      email: 'admin@platform.com',
      password_hash: adminHash,
      role: 'admin',
    });
    console.log('Seeded admin account: admin@platform.com / Admin123');
  }

  const userExists = await User.findOne({ email: 'user@platform.com' });
  if (!userExists) {
    const userHash = await bcrypt.hash('User123', 10);
    await User.create({
      name: 'Demo User',
      email: 'user@platform.com',
      password_hash: userHash,
      role: 'user',
    });
    console.log('Seeded user account: user@platform.com / User123');
  }

  for (const category of CATEGORIES) {
    const exists = await Policy.findOne({ category });
    if (!exists) {
      await Policy.create({
        category,
        is_enabled: true,
        confidence_threshold: 70,
        enforcement_behavior: 'Flag for Review',
      });
    }
  }

  const policyCount = await Policy.countDocuments();
  if (policyCount === CATEGORIES.length) {
    console.log('All 6 moderation policies seeded.');
  }
}

module.exports = seedDatabase;
