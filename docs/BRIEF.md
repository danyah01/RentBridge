# Project Brief — Mapping

This file maps the project brief's requirements to where each one is implemented.

## 8 collections (Section 12 of the brief)

| Collection | File |
|---|---|
| users           | `backend/models/User.js` |
| wallets         | `backend/models/Wallet.js` |
| transactions    | `backend/models/Transaction.js` |
| expenses        | `backend/models/Expense.js` |
| budgets         | `backend/models/Budget.js` |
| categories      | `backend/models/Category.js` |
| notifications   | `backend/models/Notification.js` |
| auditLogs       | `backend/models/AuditLog.js` |

## Key brief rules

| Rule | Where |
|---|---|
| Passwords hashed (bcrypt), `select:false` | `models/User.js` |
| Email enumeration prevented (same error on bad email vs bad pw) | `controllers/authController.js` (`login`) |
| Wallet auto-created on register | `controllers/authController.js` (`register`) |
| Public registration is always `role:'user'` | same |
| Balance never trusted from client; backend computes from DB | `controllers/walletController.js` |
| Self-transfer blocked | `walletController.js` (`transfer`) |
| Receiver must be active | same |
| Insufficient-balance attempts logged | same |
| Compensating revert on transfer failure | same |
| Suspicious-rules engine (large amount, rapid bursts) | `utils/suspiciousRules.js` |
| Notifications fired on flagged events | `controllers/walletController.js` |
| Profile updates whitelisted (no role/email/balance) | `controllers/userController.js` |
| Admin cannot block another admin | `controllers/adminController.js` |
| Audit log on privileged actions | `controllers/adminController.js` |
| Rate limit on auth + wallet routes | `middlewares/rateLimiter.js` |

## Frontend pages (~22)

| Page | Route | File |
|---|---|---|
| Landing       | `/`                            | `pages/Landing.jsx` |
| Login         | `/login`                       | `pages/auth/Login.jsx` |
| Register      | `/register`                    | `pages/auth/Register.jsx` |
| Dashboard     | `/dashboard`                   | `pages/user/Dashboard.jsx` |
| Wallet        | `/wallet`                      | `pages/user/Wallet.jsx` |
| Deposit       | `/wallet/deposit`              | `pages/user/Deposit.jsx` |
| Withdraw      | `/wallet/withdraw`             | `pages/user/Withdraw.jsx` |
| Transfer      | `/wallet/transfer`             | `pages/user/Transfer.jsx` |
| Transactions  | `/transactions`                | `pages/user/Transactions.jsx` |
| Transaction   | `/transactions/:id`            | `pages/user/TransactionDetail.jsx` |
| Receipt       | `/transactions/:id/receipt`    | `pages/user/Receipt.jsx` |
| Expenses      | `/expenses`                    | `pages/user/Expenses.jsx` |
| Budgets       | `/budgets`                     | `pages/user/Budgets.jsx` |
| Reports       | `/reports`                     | `pages/user/Reports.jsx` |
| Notifications | `/notifications`               | `pages/user/Notifications.jsx` |
| Profile       | `/profile`                     | `pages/user/Profile.jsx` |
| Admin home    | `/admin`                       | `pages/admin/AdminDashboard.jsx` |
| Admin users   | `/admin/users`                 | `pages/admin/AdminUsers.jsx` |
| Admin user    | `/admin/users/:id`             | `pages/admin/AdminUserDetail.jsx` |
| Admin wallets | `/admin/wallets`               | `pages/admin/AdminWallets.jsx` |
| Admin txns    | `/admin/transactions`          | `pages/admin/AdminTransactions.jsx` |
| Flagged       | `/admin/flagged`               | `pages/admin/AdminFlagged.jsx` |
| Categories    | `/admin/categories`            | `pages/admin/AdminCategories.jsx` |
| Reports       | `/admin/reports`               | `pages/admin/AdminReports.jsx` |
| Audit logs    | `/admin/audit-logs`            | `pages/admin/AdminAuditLogs.jsx` |
| 404           | `*`                            | `pages/NotFound.jsx` |
