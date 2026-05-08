/**
 * routes/reportRoutes.js
 * --------------------------------------------------------------------
 * User dashboard analytics.
 * --------------------------------------------------------------------
 */

const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const auth = require('../middlewares/auth');

router.get('/user-dashboard',   auth, ctrl.userDashboard);
router.get('/loan-plan',        auth, ctrl.loanPlan);
router.get('/income-expense',   auth, ctrl.incomeVsExpense);
router.get('/budget-usage',     auth, ctrl.budgetUsage);

module.exports = router;
