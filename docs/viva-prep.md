# Viva Preparation

Common questions an examiner will ask, with the file/line where each answer lives. Read this once before your viva so you can point at code rather than recite from memory.

---

## Architecture & stack

**Q: Why MERN?**
M for MongoDB (document model fits user-centric financial records well), E for Express (minimal, well-documented routing), R for React + Vite (fast dev cycle, modern hooks), N for Node (single language across the stack). The brief specifically requested it.

**Q: Why separate `server.js` from `app.js`?**
`app.js` configures the Express application (middleware + routes). `server.js` does the process bootstrap (load env, connect DB, listen). This separation makes `app.js` directly importable by tests without starting a server, which is the recommended pattern.

**Q: How is the response envelope kept consistent?**
`backend/utils/response.js` exports `ok / created / fail / asyncHandler`. Every controller uses these, so every response has shape `{ success, message, data | errors }`. The frontend axios interceptor in `services/api.js` unwraps `data` automatically.

---

## Authentication

**Q: How does login work end-to-end?**
1. Frontend `AuthContext.login()` calls `POST /api/auth/login`.
2. `controllers/authController.js → login` looks up by lowercased email, with `.select('+passwordHash')` (the field is `select:false` by default).
3. `bcrypt.compare(plain, hash)` confirms the password.
4. A JWT signed with `JWT_SECRET` (HS256) is returned along with `user.toSafeJSON()` (which strips `passwordHash` and `__v`).
5. Frontend stores token + user in localStorage.

**Q: Why is "user not found" given the same error as "wrong password"?**
To prevent email enumeration. If the messages differed, an attacker could probe which emails are registered. Both return `401 "Invalid email or password"` (see `authController.login`).

**Q: Where is `req.user` populated?**
`middlewares/auth.js` — verifies the bearer token, then calls `User.findById(decoded.id)` so a freshly-fetched user document is attached. This means a user blocked between requests is rejected on the next request rather than continuing on a stale session.

**Q: Where do you stop a blocked user from transacting?**
Two layers: `middlewares/requireActive.js` is mounted on `/api/wallet/{deposit,withdraw,transfer}`. The auth middleware also rejects blocked users on subsequent requests because it re-loads the user.

---

## Wallet & transactions

**Q: How do you prevent the client from sending a fake new balance?**
Wallet endpoints accept only `{amount}` (and `receiverEmail` for transfer). The new balance is computed in the controller from the database value: `wallet.balance = wallet.balance + amount`. See `controllers/walletController.js`.

**Q: How is overdraft prevented?**
`if (wallet.balance < amount) { ... fail(...); }` — and the failed attempt is recorded as a transaction with `status:'failed'`, so admin can see the attempt.

**Q: How are transfers made atomic without Mongo transactions?**
Transactions on a free-tier single-node Mongo cluster are not available, so we order the writes carefully and add a compensating revert on the sender wallet if the receiver write fails. The transaction record is created last so the audit trail accurately reflects the outcome. This is acknowledged in `docs/architecture.md` as a known production-grade improvement (use a replica set + `session.withTransaction()`).

**Q: How is a transaction ID generated?**
`utils/generateTxnId.js` — `TXN-` prefix + a short random hex string. It is also unique-indexed in the schema, so collisions throw on save (extremely unlikely given the entropy used).

---

## Suspicious-rule engine

**Q: Walk me through the rule engine.**
`utils/suspiciousRules.js` exports `evaluateRules({ user, wallet, amount, type, balanceAfter })`. It applies:
1. **Large amount** — `amount >= SUSPICIOUS_LARGE_AMOUNT` (env-tunable).
2. **Rapid bursts** — counts user's outgoing transactions in the past `SUSPICIOUS_RAPID_WINDOW_MINUTES` minutes; if ≥ `SUSPICIOUS_RAPID_COUNT`, flag.
3. **Drained-to-zero** — heuristic on `balanceAfter`.

Returns `{ suspicious: bool, reasons: [...] }`. The wallet controller uses this **before** saving, so the transaction is recorded with the flag and the user gets both a regular notification and a security notification.

**Q: A flagged transaction is still completed — why?**
Because freezing funds mid-flight would create a worse UX for the (typically benign) user, and the brief calls for a notification + admin review pattern, not blocking. The admin sees the entry in `/admin/flagged` and can take action (block the user, etc.).

---

## Authorization

**Q: How is the admin role gated?**
`middlewares/role.js` exports `requireRole(role)`. `routes/adminRoutes.js` does `router.use(auth, requireRole('admin'))` so EVERY admin route is gated.

**Q: Why can't a user promote themselves to admin?**
Two protections:
1. `controllers/authController.register` hard-codes `role:'user'` regardless of input.
2. `controllers/userController.updateProfile` whitelists only `name` and `phone` from `req.body`. Sending `{role:'admin'}` is silently dropped.
3. Admin can only be created via the seed script (`utils/seed.js`).

**Q: Can an admin block another admin?**
No. `adminController.blockUser` checks `if (user.role === 'admin') return fail(...,'Cannot block another admin', 403)`.

---

## Data ownership

**Q: How do you ensure a user only sees their own expenses?**
Every list query filters by `userId: req.user._id`. Every mutating route (`PUT/DELETE /api/expenses/:id`) loads the document and checks `expense.userId.equals(req.user._id)` before allowing the change.

**Q: Same question for transactions?**
`/api/transactions` filters by `$or: [{senderId}, {receiverId}]`. The single-transaction endpoint (`/api/transactions/:id`) enforces ownership in code (`isOwner` check) and allows admins to read any.

---

## Database design

**Q: Why is `passwordHash` set to `select:false`?**
So that ANY query returning users (including `User.find({})` in admin list) implicitly omits the hash. This is defense-in-depth: even if a future controller forgets `.toSafeJSON()`, the hash never leaks.

**Q: Why is wallet 1:1 with user?**
A unique index on `userId` enforces it at the database level. The brief specifies one wallet per user.

**Q: Why store `totalDeposits / totalWithdrawals / ...` on Wallet directly?**
For O(1) summary queries. Recomputing them by aggregating Transaction would work too, but is more expensive on every wallet read. The trade-off is that they must be updated on every successful operation.

---

## Frontend

**Q: Where is the JWT attached?**
`services/api.js` request interceptor: reads `localStorage['rentbridge_token']` and adds `Authorization: Bearer …` to every outgoing request.

**Q: What happens on 401?**
The response interceptor clears the stored token, fires a `rentbridge:unauthorized` window event, and rejects the promise. `AuthContext` listens for that event and clears its state, so the UI immediately drops back to /login.

**Q: How is the route map protected?**
`App.jsx` defines three guards:
- `BootGate` — waits for `/auth/me` verification before rendering anything that depends on auth.
- `ProtectedRoute` — redirects to /login if not authenticated; supports `adminOnly`.
- `PublicOnly` — keeps logged-in users out of /login and /register.

**Q: How are charts implemented?**
`recharts` via thin wrappers in `components/charts/Charts.jsx` (`LineSeries / AreaSeries / BarSeries / CategoryPie`). The wrappers fix theme colors and tooltip styling so chart styling doesn't leak into pages.

---

## Security checklist

| Concern | Where it's addressed |
|---|---|
| Brute-force login | `middlewares/rateLimiter.js → authLimiter` on `/api/auth/login,register` |
| Brute-force wallet ops | `walletLimiter` on /deposit, /withdraw, /transfer |
| SQL/NoSQL injection | We never build queries from raw strings; only Mongoose helpers. `email` is `.toLowerCase()` then matched. |
| XSS | React escapes JSX content by default. We don't use `dangerouslySetInnerHTML` anywhere. |
| CSRF | The API uses a Bearer-token scheme — not cookie-based — so CSRF is not applicable. |
| Open CORS | `CORS_ORIGIN` env is an allow-list. `*` is acceptable for local dev only. |
| Secret leakage | `.env` is gitignored; `JWT_SECRET` is read from env. The example file uses a placeholder. |
| Password handling | bcrypt with `BCRYPT_SALT_ROUNDS` (default 10). `select:false`. |
| Mass-assignment | Profile update whitelists allowed fields. Register hard-codes `role`. |
| Privileged-action audit | `AuditLog` writes on every admin block/unblock and category create. |

---

## Likely "gotcha" questions

**Q: What is `asyncHandler`?**
`utils/response.js` — a tiny wrapper that catches async errors from controllers and forwards them to Express's centralized `errorHandler` middleware so we don't need try/catch in every controller.

**Q: Why don't you use `useEffect` cleanup with abort signals on every fetch?**
Most components use a small `let alive = true` flag because the codebase is small enough that AbortController + axios cancellation tokens added complexity without enough payoff. In production I'd consider migrating to `AbortController` to also cancel inflight requests.

**Q: What is the difference between `.failed` and `.flagged` transactions?**
`failed` = the operation did NOT happen (e.g. insufficient balance). The wallet was not modified. `flagged` = the operation DID happen, but the rule engine considers it suspicious and the admin should review.

**Q: How do you handle email case sensitivity?**
The User schema sets `lowercase: true` on email, and login/register both `.toLowerCase()` before lookup. So `Ali@x.com` and `ali@x.com` are the same account.

**Q: What's the strongest part of this project?**
The clean separation of concerns — controllers don't know how validation works (middleware does it), don't know how rate limiting works (middleware does it), don't know how the response envelope is shaped (utils/response.js does it). Each piece is small and replaceable.

**Q: What's the weakest?**
Two things: (1) Transfer atomicity isn't enforced by Mongo transactions, only by careful code ordering — fragile under high concurrency. (2) There is no automated test suite; testing is manual via Postman.
