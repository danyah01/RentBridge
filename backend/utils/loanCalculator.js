const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Expense = require('../models/Expense');

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

const creditBandForScore = (score) => {
  if (score >= 750) return 'excellent';
  if (score >= 650) return 'good';
  return 'bad';
};

const buildAmortizationSchedule = ({ monthlyRent, leaseMonths = 12, markupRate = 12.5 }) => {
  const rent = Number(monthlyRent);
  const months = Number(leaseMonths);
  const rate = Number(markupRate);

  if (!Number.isFinite(rent) || rent <= 0) {
    const err = new Error('monthlyRent must be a positive number');
    err.status = 400;
    throw err;
  }
  if (!Number.isInteger(months) || months < 3 || months > 60) {
    const err = new Error('leaseMonths must be an integer between 3 and 60');
    err.status = 400;
    throw err;
  }
  if (!Number.isFinite(rate) || rate < 0 || rate > 50) {
    const err = new Error('markupRate must be between 0 and 50');
    err.status = 400;
    throw err;
  }

  const advanceMonths = 3;
  const securityMonths = 1;
  const depositMonths = advanceMonths + securityMonths;
  const financedAmount = round2(rent * depositMonths);
  const totalMarkup = round2((financedAmount * rate) / 100);
  const totalRepay = round2(financedAmount + totalMarkup);
  const monthlyPrincipal = round2(financedAmount / months);
  const monthlyMarkup = round2(totalMarkup / months);
  const monthlyInstallment = round2(totalRepay / months);

  let remaining = financedAmount;
  const schedule = [];

  for (let month = 1; month <= months; month += 1) {
    const openingBalance = round2(remaining);
    const principal = month === months ? round2(openingBalance) : monthlyPrincipal;
    const interest = month === months
      ? round2(totalMarkup - monthlyMarkup * (months - 1))
      : monthlyMarkup;
    const payment = round2(principal + interest);
    remaining = round2(Math.max(0, openingBalance - principal));

    schedule.push({
      month,
      openingBalance,
      principal,
      interest,
      payment,
      closingBalance: remaining,
    });
  }

  return {
    monthlyRent: round2(rent),
    leaseMonths: months,
    markupRate: rate,
    advanceMonths,
    securityMonths,
    depositMonths,
    financedAmount,
    totalMarkup,
    totalRepay,
    monthlyPrincipal,
    monthlyMarkup,
    monthlyInstallment,
    schedule,
  };
};

const buildCreditAnalysis = async (user) => {
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);

  const [wallet, incomeAgg, expenseAgg, flaggedCount, incomeCount] = await Promise.all([
    Wallet.findOne({ userId: user._id }),
    Transaction.aggregate([
      {
        $match: {
          receiverId: user._id,
          type: { $in: ['deposit', 'transfer'] },
          status: { $in: ['successful', 'flagged'] },
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
    Expense.aggregate([
      { $match: { userId: user._id, date: { $gte: since } } },
      {
        $group: {
          _id: { y: { $year: '$date' }, m: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
    ]),
    Transaction.countDocuments({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
      suspiciousFlag: true,
    }),
    Transaction.countDocuments({
      receiverId: user._id,
      type: { $in: ['deposit', 'transfer'] },
      status: { $in: ['successful', 'flagged'] },
      createdAt: { $gte: since },
    }),
  ]);

  const totalIncome = incomeAgg.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const monthlyIncome = Number(user.monthlyIncome) > 0
    ? Number(user.monthlyIncome)
    : totalIncome > 0
      ? totalIncome / 6
      : 0;
  const monthlyExpense = expenseAgg.reduce((sum, row) => sum + Number(row.total || 0), 0) / 6;
  const expenseRatio = monthlyIncome > 0 ? monthlyExpense / monthlyIncome : 1;
  const balanceToIncome = monthlyIncome > 0 && wallet ? Number(wallet.balance || 0) / monthlyIncome : 0;
  const accountAgeMonths = Math.max(0, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)));

  let score = 300;
  const reasons = [];

  const incomeScore = monthlyIncome >= 200000 ? 220 : monthlyIncome >= 120000 ? 180 : monthlyIncome >= 60000 ? 130 : monthlyIncome >= 30000 ? 80 : monthlyIncome > 0 ? 35 : 0;
  score += incomeScore;
  if (monthlyIncome > 0) {
    reasons.push(`Estimated monthly income considered at ${Math.round(monthlyIncome).toLocaleString('en-US')}.`);
  } else {
    reasons.push('Monthly income is not set; analysis falls back to account activity.');
  }

  const employmentType = user.employmentType || 'unspecified';
  const employmentScoreMap = { salaried: 70, contract: 50, self_employed: 45, student: 20, other: 30, unspecified: 15 };
  score += employmentScoreMap[employmentType] || 15;

  const ageScore = accountAgeMonths >= 24 ? 80 : accountAgeMonths >= 12 ? 65 : accountAgeMonths >= 6 ? 45 : accountAgeMonths >= 3 ? 25 : 10;
  score += ageScore;

  const regularityScore = incomeCount >= 5 ? 80 : incomeCount >= 3 ? 55 : incomeCount >= 1 ? 30 : 0;
  score += regularityScore;

  const balanceScore = balanceToIncome >= 1 ? 60 : balanceToIncome >= 0.5 ? 45 : balanceToIncome >= 0.25 ? 25 : balanceToIncome > 0 ? 10 : 0;
  score += balanceScore;

  const expenseScore = expenseRatio <= 0.35 ? 80 : expenseRatio <= 0.5 ? 55 : expenseRatio <= 0.7 ? 25 : 0;
  score += expenseScore;

  if (flaggedCount > 0) {
    score -= Math.min(100, flaggedCount * 35);
    reasons.push(`${flaggedCount} suspicious transaction${flaggedCount === 1 ? '' : 's'} found.`);
  } else {
    reasons.push('No suspicious transactions found.');
  }

  if (user.status === 'blocked') {
    score -= 160;
    reasons.push('Account is blocked, so the loan cannot be approved.');
  }

  score = clamp(Math.round(score), 300, 850);
  const band = creditBandForScore(score);
  const eligible = user.status === 'active' && score >= 650 && expenseRatio <= 0.7 && flaggedCount < 3;

  return {
    score,
    band,
    eligible,
    decision: eligible ? 'Eligible for review' : 'Not eligible yet',
    reasons,
    metrics: {
      monthlyIncome: round2(monthlyIncome),
      monthlyExpense: round2(monthlyExpense),
      expenseRatio: round2(expenseRatio),
      balanceToIncome: round2(balanceToIncome),
      accountAgeMonths,
      flaggedCount,
      incomeMonths: incomeCount,
      walletBalance: round2(wallet ? wallet.balance : 0),
      currency: wallet ? wallet.currency : 'PKR',
      employmentType,
      employerName: user.employerName || '',
    },
  };
};

module.exports = {
  buildAmortizationSchedule,
  buildCreditAnalysis,
  creditBandForScore,
};