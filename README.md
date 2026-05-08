# RentBridge

A full-stack wallet & expense-tracking application built for **FAST University Islamabad — Semester 6, FinTech / Web Engineering**.

The system models a small fintech in miniature: secure authentication, a per-user wallet, peer-to-peer transfers, expense and budget tracking, monthly reports, an automated suspicious-activity rule engine, and a full administrator console with audit logs.

> Demo project. **No real funds are processed.** Wallet balances are sandbox numbers used to demonstrate financial-systems concepts.

---

## Quick start

```bash
# 1. Backend
cd RentBridge/backend
cp env.example .env          # then edit .env (set MONGO_URI + JWT_SECRET)
npm install
npm run seed                 # seeds 1 admin + 3 users + categories
npm run dev                  # starts on http://localhost:5000

# 2. Frontend (in a second terminal)
cd RentBridge/frontend
cp .env.example .env         # leave VITE_API_BASE blank for local dev
npm install
npm run dev                  # starts on http://localhost:5173
```

Open <http://localhost:5173> and sign in with one of the seeded credentials below.

### Seeded credentials

| Role  | Email                       | Password   |
| ----- | --------------------------- | ---------- |
| Admin | `admin@rentbridge.test`     | `Admin@123` |
| User  | `ali@rentbridge.test`       | `Demo@123`  |
| User  | `sara@rentbridge.test`      | `Demo@123`  |
| User  | `bilal@rentbridge.test`     | `Demo@123`  |

---

## Architecture

```
RentBridge/
├── backend/                  Express + Mongoose + JWT API
│   ├── server.js             entry point — loads env, connects DB, listens
│   ├── app.js                Express app (middleware + routes)
│   ├── package.json
│   ├── env.example
│   ├── config/db.js          Mongo connection
│   ├── controllers/          one per domain (auth, wallet, expense …)
│   ├── routes/               route definitions
│   ├── middlewares/          auth, role, rate-limiter, body validator …
│   ├── models/               Mongoose schemas (8 collections)
│   ├── validations/          reusable validation rule sets
│   ├── utils/                response helpers, txn-id generator, suspicious-rules engine, seed.js
│   └── ...
│
└── frontend/                 React + Vite SPA
    ├── index.html
    ├── vite.config.js        proxies /api/* to backend in dev
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx          providers + router
        ├── App.jsx           route map + guards
        ├── styles/global.css design system
        ├── services/api.js   single axios instance, full backend surface
        ├── context/          AuthContext, ToastContext
        ├── components/       layout, ui, charts
        └── pages/            landing + auth + 13 user + 9 admin + 404
```

---

## API surface (high level)

| Group | Endpoints |
|---|---|
| **Auth**          | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `PUT /api/auth/change-password` |
| **Profile**       | `GET /api/users/profile`, `PUT /api/users/profile` |
| **Wallet**        | `GET /api/wallet`, `GET /api/wallet/summary`, `POST /api/wallet/{deposit,withdraw,transfer}` |
| **Transactions**  | `GET /api/transactions`, `GET /api/transactions/:id`, `GET /api/transactions/:id/receipt`, `GET /api/transactions/summary/monthly` |
| **Expenses**      | `GET/POST /api/expenses`, `PUT/DELETE /api/expenses/:id`, `GET /api/expenses/summary/{monthly,categories}` |
| **Budgets**       | `GET/POST /api/budgets`, `GET /api/budgets/current`, `PUT/DELETE /api/budgets/:id` |
| **Categories**    | `GET /api/categories` (active only) |
| **Notifications** | `GET /api/notifications`, `PATCH /api/notifications/read-all`, `PATCH /api/notifications/:id/read` |
| **Reports**       | `GET /api/reports/{user-dashboard,income-expense,budget-usage}` |
| **Admin**         | dashboard / reports / users / wallets / transactions / flagged / categories / audit-logs (all admin-gated) |

A ready-to-import **Postman collection** is provided in `docs/RentBridge.postman_collection.json`.

Every API response uses the same envelope:

```json
{ "success": true,  "message": "...", "data": { ... } }
{ "success": false, "message": "...", "errors": [...] }
```

---

## Security & integrity highlights

- Passwords are hashed with **bcrypt** (`select: false` on the field — they never leave the DB).
- JWT (HS256, 7-day default) sent as `Authorization: Bearer <token>`.
- Rate-limiting on `/api/auth/*` (anti-brute-force) and on wallet mutations.
- **All balance arithmetic happens server-side** from the database value — the client cannot send a "new balance".
- A separate **suspicious-rule engine** (`utils/suspiciousRules.js`) runs before each transaction is finalised; large amounts and rapid-fire bursts are flagged and surfaced both to the user (notification) and the admin (Flagged page).
- Admin actions (block/unblock, category create) are recorded in **AuditLog** with actor, target, and IP.
- A whitelist on profile updates prevents users from escalating themselves to admin.

---

## Deployment

- **Backend** → any Node host (Render, Railway, Fly). The repo includes `render.yaml` you can use as a starting point.
- **Frontend** → Vercel / Netlify. The frontend uses `import.meta.env.VITE_API_BASE` — set it to your deployed backend URL in the host's env settings.
- **Database** → MongoDB Atlas (free tier is sufficient).

Set `CORS_ORIGIN` on the backend to your frontend's deployed URL.

---

## Documentation

The `docs/` folder contains:

- `BRIEF.md`           — project brief notes & objective mapping
- `TESTING.md`         — manual test evidence template
- `RentBridge.postman_collection.json`
- `architecture.md`    — request-flow diagrams
- `viva-prep.md`       — common questions & where the answer lives in the code

---

## License

Academic submission — FAST University Islamabad, Semester 6.
