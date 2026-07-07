const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('./models/User');

const demoUsers = [
  {
    name: 'Admin Chief',
    email: 'admin@janvikas.ai',
    password: 'password123',
    role: 'admin',
    phone: '9876543210',
    isActive: true
  },
  {
    name: 'District Officer',
    email: 'officer@janvikas.ai',
    password: 'password123',
    role: 'officer',
    phone: '9876543211',
    isActive: true
  },
  {
    name: 'Public Works Dept',
    email: 'dept@janvikas.ai',
    password: 'password123',
    role: 'department',
    phone: '9876543212',
    isActive: true
  },
  {
    name: 'Helping Hands NGO',
    email: 'ngo@janvikas.ai',
    password: 'password123',
    role: 'ngo',
    phone: '9876543213',
    isActive: true
  },
  {
    name: 'Rahul Citizen',
    email: 'citizen@janvikas.ai',
    password: 'password123',
    role: 'citizen',
    phone: '9876543214',
    isActive: true
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/janvikas_ai';
    console.log('Connecting to MongoDB at:', mongoUri.substring(0, 30) + '...');
    await mongoose.connect(mongoUri);
    
    console.log('Clearing old demo accounts...');
    const emails = demoUsers.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });

    console.log('Creating role-based demo accounts...');
    for (const u of demoUsers) {
      await User.create(u);
      console.log(`✓ Created [${u.role}] -> Email: ${u.email} | Pass: password123`);
    }

    console.log('\nDemo database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
