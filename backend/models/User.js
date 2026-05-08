/**
 * models/User.js
 * --------------------------------------------------------------------
 * Mongoose schema for users.
 *
 * Brief reference: Section 12 (users collection)
 *   - email is unique
 *   - role: "user" | "admin"
 *   - status: "active" | "blocked"
 *   - passwordHash is bcrypt'ed; we NEVER store plain text
 *
 * The pre-save hook hashes the password whenever it changes.
 * comparePassword() is added as an instance method for login.
 * --------------------------------------------------------------------
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      // Simple email shape check. Backend validation middleware does deeper checks.
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },
    passwordHash: {
      type: String,
      required: true,
      // select:false  =>  never returned in queries unless explicitly asked.
      // This protects password hashes from accidentally leaking through APIs.
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    phone: {
      type: String,
      trim: true,
    },
    employerName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    employmentType: {
      type: String,
      enum: ['salaried', 'contract', 'self_employed', 'student', 'other'],
      default: 'salaried',
    },
    monthlyIncome: {
      type: Number,
      min: 0,
    },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true } // adds createdAt + updatedAt automatically
);

// --------------------------------------------------------------------
// VIRTUAL & instance methods
// --------------------------------------------------------------------

/**
 * Compare a plaintext password to the stored bcrypt hash.
 * Used by /api/auth/login.
 */
userSchema.methods.comparePassword = async function (plain) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

/**
 * Strip sensitive fields when serializing to JSON.
 * Even if passwordHash leaks into a query result, this guarantees it
 * never reaches a client.
 */
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

// --------------------------------------------------------------------
// Helper static method to create user with auto-hashed password.
// (Auth controller uses this so we keep hashing logic in one place.)
// --------------------------------------------------------------------
userSchema.statics.hashPassword = async function (plain) {
  const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  return bcrypt.hash(plain, rounds);
};

module.exports = mongoose.model('User', userSchema);
