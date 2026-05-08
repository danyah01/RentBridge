# Architecture

## Request lifecycle

```
[Browser]
   │
   ▼
[React + Vite — services/api.js]
   │  attaches "Authorization: Bearer <jwt>" from localStorage
   ▼
[Express] app.js
   ├─ helmet  (sec headers)
   ├─ cors    (allow-list from CORS_ORIGIN)
   ├─ express.json
   ├─ morgan  (logging)
   │
   ├─ /api/auth      ─► routes/authRoutes.js     (rate-limited)
   │                    ├─ middlewares/validateBody.js
   │                    └─ controllers/authController.js
   │
   ├─ /api/wallet    ─► routes/walletRoutes.js
   │                    ├─ middlewares/auth.js          (verifies JWT, loads req.user)
   │                    ├─ middlewares/requireActive.js (rejects blocked users)
   │                    ├─ middlewares/rateLimiter.js   (walletLimiter)
   │                    ├─ middlewares/validateBody.js
   │                    └─ controllers/walletController.js
   │                          ├─ utils/suspiciousRules.js  (evaluates BEFORE save)
   │                          ├─ utils/generateTxnId.js
   │                          ├─ models/Wallet, Transaction, Notification
   │                          └─ utils/response.js (envelope helpers)
   │
   ├─ /api/expenses  ─► (auth) controllers/expenseController.js
   │                          └─ recomputes affected Budget after every mutation
   │
   ├─ /api/admin     ─► (auth + role:'admin') controllers/adminController.js
   │                          └─ writes to AuditLog on privileged actions
   │
   ├─ middlewares/notFound  (404)
   └─ middlewares/errorHandler  (500 / Mongoose validation / etc.)
```

## Response envelope

Every endpoint returns:

```json
{ "success": true,  "message": "...", "data": { ... } }
{ "success": false, "message": "...", "errors": [ { "field": "amount", "msg": "must be > 0" } ] }
```

On the frontend, the axios response interceptor unwraps `data` so page components write `const { wallet } = await api.wallet.get()` without ceremony.

## Suspicious-rule engine

`backend/utils/suspiciousRules.js` exports `evaluateRules({ user, wallet, amount, type, balanceAfter })`. Walked rules:

1. **Large amount** — `amount >= SUSPICIOUS_LARGE_AMOUNT` (env-tunable; default 100,000).
2. **Rapid bursts** — same user, ≥ `SUSPICIOUS_RAPID_COUNT` outgoing transactions inside `SUSPICIOUS_RAPID_WINDOW_MINUTES`.
3. **Balance drained close to zero post-tx** — heuristic, configurable per business policy.

If any rule trips, the transaction is **still applied** but recorded with `status: 'flagged'` and reasons listed in `suspiciousReasons`. A security notification is created for the user, and the entry appears in `/admin/flagged`.

## Atomicity considerations (transfer)

A real production system would use a Mongo replica-set transaction (session). For this demo on a single-node Mongo:

1. Sender wallet decremented + saved.
2. Receiver wallet incremented + saved (in a try/catch).
3. On step-2 failure, sender is reverted (compensating write).
4. Transaction record is created last, recording final outcome.

This is documented in `controllers/walletController.js` and acknowledged as a known limitation in viva.

## Frontend state

- **AuthContext** — token + user + bootLoading + isAdmin; persists token/user in `localStorage`; verifies `/auth/me` on first mount; listens for the global `rentbridge:unauthorized` event from the API layer to logout cleanly on 401.
- **ToastContext** — `toast.ok / bad / warn / info`. Auto-dismisses after 3.5s.
- Route guards in `App.jsx`: `BootGate` (waits for `/me` verify), `ProtectedRoute` (redirects to /login), `PublicOnly` (keeps logged-in users out of /login and /register).

## CSS / design system

A single `src/styles/global.css` defines the design tokens:

- Background: warm parchment with two faint radial gradients
- Ink: deep navy-black text and dark surfaces
- Accent: warm brass (#b8893d / #d4a574)
- Display font: Fraunces (serif), Body: Inter Tight, Mono: JetBrains Mono

Components are intentionally low on rounded corners (2–3 px) for an editorial fintech feel. Status colors map directly onto badges in `States.jsx`.
