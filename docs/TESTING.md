# Testing — Manual Test Evidence

Use this document as a template; replace each *Result* row with what you actually observed during your demo run.

## 1. Auth

| Case | Steps | Expected | Result |
|---|---|---|---|
| Register success | POST /api/auth/register with new email + valid password | 201, returns `token` + `user` | |
| Register duplicate | POST same email again | 409 "Email already registered" | |
| Login success | POST /api/auth/login with seeded credentials | 200, token returned | |
| Login wrong pw | POST with wrong password | 401 "Invalid email or password" | |
| Login wrong email | POST with unknown email | 401 *same message* (no enumeration) | |
| /me without token | GET /api/auth/me | 401 | |
| /me with token | GET /api/auth/me with `Authorization: Bearer …` | 200, user object | |
| Change pw success | PUT /api/auth/change-password old=correct new=valid | 200 | |
| Change pw wrong old | wrong old password | 400 | |

## 2. Wallet

| Case | Steps | Expected |
|---|---|---|
| Get wallet | GET /api/wallet | 200, balance + currency |
| Deposit positive | POST /api/wallet/deposit `{amount: 1000}` | 201, txn `successful`, balance += 1000 |
| Deposit zero | `{amount: 0}` | 400 |
| Deposit negative | `{amount: -10}` | 400 |
| Withdraw within balance | `{amount: 100}` (where balance ≥ 100) | 201, balance -= 100 |
| Withdraw insufficient | `{amount: balance + 1}` | 400, txn recorded as `failed` |
| Transfer to active user | `{receiverEmail, amount}` | 201, both wallets updated |
| Transfer to self | own email | 400 |
| Transfer to blocked user | block, then transfer | 403 |
| Transfer with insufficient balance | larger than balance | 400, txn `failed` |
| Large deposit (>SUSPICIOUS_LARGE_AMOUNT) | e.g. 200000 | 201, txn status `flagged`, security notification created |

## 3. Expenses

| Case | Steps | Expected |
|---|---|---|
| Create | POST /api/expenses | 201, recomputed budget if any |
| Update someone else's | PUT /api/expenses/:id with stranger's id | 403 Forbidden |
| Delete | DELETE | 200 |
| Monthly summary | GET /api/expenses/summary/monthly | 200, aggregated |

## 4. Budgets

| Case | Steps | Expected |
|---|---|---|
| Create | POST /api/budgets `{month, totalLimit}` | 201 |
| Duplicate month | POST same month again | 409 |
| Status updates | log expenses up to nearLimit/exceeded thresholds | budget.status updates accordingly |

## 5. Notifications

| Case | Expected |
|---|---|
| After register | "Welcome to RentBridge" notification |
| After deposit | "Deposit successful" notification |
| After flagged deposit | additional "Transaction flagged for review" notification |
| Mark all read | GET notifications shows readStatus:true |

## 6. Admin

| Case | Steps | Expected |
|---|---|---|
| Non-admin GET /api/admin/* | with regular user token | 403 |
| Block user | PATCH /api/admin/users/:id/block | user.status = blocked, audit log entry, notification to user |
| Block admin | try blocking another admin | 403 "Cannot block another admin" |
| Flagged list | GET /api/admin/transactions/flagged after a flagged deposit | shows it |
| Audit log | GET /api/admin/audit-logs after block | block entry appears |

## 7. Security / negative cases

| Case | Expected |
|---|---|
| Many rapid /api/auth/login | rate-limited (`429 Too Many Requests`) |
| Many rapid /api/wallet/deposit | rate-limited |
| Modify role via PUT /api/users/profile { role: 'admin' } | role unchanged (whitelist) |
| Modify email via PUT /api/users/profile { email: 'x@y' } | email unchanged |
