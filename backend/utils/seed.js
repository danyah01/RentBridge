/**
 * utils/seed.js
 * --------------------------------------------------------------------
 * One-shot seed script. Run with: `npm run seed`
 *
 * Creates:
 *   - 1 admin   (admin@rentbridge.test / Admin@123)
 *   - 3 demo users (ali@rentbridge.test, sara@..., bilal@... / Demo@123)
 *   - default categories
 *   - a couple of starter transactions per user
 *
 * Safe to re-run: it WIPES the test users/wallets/etc. beforehand.
 * --------------------------------------------------------------------
 */

require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const generateTxnId = require('./generateTxnId');

const run = async () => {
  await connectDB();
  console.log('🌱 Seeding RentBridge demo data...');

  // Wipe demo accounts (DOES NOT TOUCH non-test users).
  const testEmails = ['admin@rentbridge.test', 'ali@rentbridge.test', 'sara@rentbridge.test', 'bilal@rentbridge.test'];
  const oldUsers = await User.find({ email: { $in: testEmails } });
  const oldIds = oldUsers.map((u) => u._id);
  await Wallet.deleteMany({ userId: { $in: oldIds } });
  await Transaction.deleteMany({ $or: [{ senderId: { $in: oldIds } }, { receiverId: { $in: oldIds } }] });
  await Notification.deleteMany({ userId: { $in: oldIds } });
  await User.deleteMany({ email: { $in: testEmails } });

  // Create admin.
  const adminHash = await User.hashPassword('Admin@123');
  const admin = await User.create({
    name: 'RentBridge Admin',
    email: 'admin@rentbridge.test',
    passwordHash: adminHash,
    role: 'admin',
    status: 'active',
  });
  await Wallet.create({ userId: admin._id, balance: 0 });
  console.log('   👤 admin@rentbridge.test / Admin@123');

  // Create demo users.
  const userHash = await User.hashPassword('Demo@123');
  const seedUsers = [
    { name: 'Ali Khan',   email: 'ali@rentbridge.test',   balance: 50000, monthlyIncome: 160000, employerName: 'TechNova', employmentType: 'salaried' },
    { name: 'Sara Ahmed', email: 'sara@rentbridge.test',  balance: 35000, monthlyIncome: 115000, employerName: 'GrowthSoft', employmentType: 'contract' },
    { name: 'Bilal Riaz', email: 'bilal@rentbridge.test', balance: 12000, monthlyIncome: 48000, employerName: 'Freelance', employmentType: 'self_employed' },
  ];

  for (const u of seedUsers) {
    const user = await User.create({
      name: u.name,
      email: u.email,
      passwordHash: userHash,
      role: 'user',
      status: 'active',
      monthlyIncome: u.monthlyIncome,
      employerName: u.employerName,
      employmentType: u.employmentType,
    });
    await Wallet.create({
      userId: user._id,
      balance: u.balance,
      totalDeposits: u.balance,
    });
    await Transaction.create({
      transactionId: generateTxnId(),
      receiverId: user._id,
      amount: u.balance,
      type: 'deposit',
      status: 'successful',
      description: 'Initial demo balance',
    });
    await Notification.create({
      userId: user._id,
      title: 'Welcome to RentBridge',
      message: 'Your demo wallet is ready.',
      type: 'system',
    });
    console.log(`   👤 ${u.email} / Demo@123  (balance ${u.balance})`);
  }

  // Default categories.
  const cats = [
    { name: 'Food',          type: 'expense',     description: 'Groceries, dining, snacks' },
    { name: 'Rent',          type: 'expense',     description: 'Monthly rent and utilities' },
    { name: 'Transport',     type: 'expense',     description: 'Fuel, ride-hailing, public transit' },
    { name: 'Utilities',     type: 'expense',     description: 'Electricity, gas, internet' },
    { name: 'Entertainment', type: 'expense',     description: 'Movies, subscriptions, outings' },
    { name: 'Salary',        type: 'transaction', description: 'Income deposits' },
    { name: 'Transfer',      type: 'transaction', description: 'Peer-to-peer transfers' },
    { name: 'Personal',      type: 'budget',      description: 'Personal monthly budget' },
  ];
  await Category.deleteMany({});
  for (const c of cats) {
    await Category.create({ ...c, createdBy: admin._id });
  }
  console.log(`   🏷  ${cats.length} categories created`);

  console.log('✅ Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
