/**
 * controllers/userController.js
 * --------------------------------------------------------------------
 * Profile read + update for the LOGGED-IN user only.
 *
 * Important: we strictly whitelist editable fields. Role, status, email,
 * and balance are NOT editable from this route — those would let a user
 * promote themselves to admin or change their identity.
 * (Brief Section 11, rule 24; Section 15 #29.)
 * --------------------------------------------------------------------
 */

const User = require('../models/User');
const { ok, asyncHandler, fail } = require('../utils/response');

// GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res) => {
  return ok(res, { user: req.user.toSafeJSON() });
});

// PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'employerName', 'employmentType', 'monthlyIncome'];        // <-- WHITELIST
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) return fail(res, 'User not found', 404);

  return ok(res, { user: user.toSafeJSON() }, 'Profile updated');
});
