/**
 * controllers/reportController.js
 * --------------------------------------------------------------------
 * User-side analytics for the dashboard:
 *   - User dashboard summary
 *   - Income vs expense (last 6 months)
 *   - Budget usage
 *   - Rent financing amortization schedule
 *
 * Admin reports live in adminController.js.
 * --------------------------------------------------------------------
 */

const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { buildAmortizationSchedule } = require('../utils/loanCalculator');
const { ok, asyncHandler } = require('../utils/response');

// GET /api/reports/user-dashboard
exports.userDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const wallet = await Wallet.findOne({ userId });

  const recentTxns = await Transaction.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  })
    .sort({ createdAt: -1 })
    .limit(5);

  const txnCount = await Transaction.countDocuments({
    $or: [{ senderId: userId }, { receiverId: userId }],
  });

  // Monthly expense totals (last 6 months) for the chart.
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);

  const monthlyExpenses = await Expense.aggregate([
    { $match: { userId, date: { $gte: since } } },
    {
      $group: {
        _id: { y: { $year: '$date' }, m: { $month: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ]);

  return ok(res, {
    walletBalance: wallet ? wallet.balance : 0,
    currency: wallet ? wallet.currency : 'PKR',
    transactionCount: txnCount,
    recentTransactions: recentTxns,
    monthlyExpenses,
  });
});

// GET /api/reports/loan-plan?monthlyRent=...&leaseMonths=...&markupRate=...
exports.loanPlan = asyncHandler(async (req, res) => {
  const plan = buildAmortizationSchedule({
    monthlyRent: req.query.monthlyRent,
    leaseMonths: req.query.leaseMonths || 12,
    markupRate: req.query.markupRate || 12.5,
  });

  return ok(res, { plan });
});

// GET /api/reports/income-expense
exports.incomeVsExpense = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // "Income" = deposits + transfers received (status successful).
  const incomeAgg = await Transaction.aggregate([
    {
      $match: {
        $or: [
          { receiverId: userId, type: { $in: ['deposit', 'transfer'] } },
        ],
        status: { $in: ['successful', 'flagged'] },
      },
    },
    {
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
        total: { $sum: '$amount' },
      },
    },
  ]);

  // "Expense" = withdrawals + transfers out + recorded expenses.
  const outAgg = await Transaction.aggregate([
    {
      $match: {
        senderId: userId,
        type: { $in: ['withdrawal', 'transfer'] },
        status: { $in: ['successful', 'flagged'] },
      },
    },
    {
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
        total: { $sum: '$amount' },
      },
    },
  ]);

  return ok(res, { income: incomeAgg, outflow: outAgg });
});

// GET /api/reports/budget-usage
exports.budgetUsage = asyncHandler(async (req, res) => {
  const budgets = await Budget.find({ userId: req.user._id }).sort({ month: -1 }).limit(12);
  return ok(res, { budgets });
});
