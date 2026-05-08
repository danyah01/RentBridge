// pages/Landing.jsx
// --------------------------------------------------------------------
// The public homepage. Editorial fintech: large display headline,
// generous whitespace, a small mock account preview, and a clear CTA.
// --------------------------------------------------------------------

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Brand from '../components/ui/Brand.jsx';

export default function Landing() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const goApp = () => navigate(isAdmin ? '/admin' : '/dashboard');

  return (
    <div className="lp">
      {/* --- nav --- */}
      <nav className="lp-nav">
        <Brand />
        <div className="row" style={{ gap: 14 }}>
          <Link to="/login" className="lp-link">Sign in</Link>
          {!isAuthenticated ? (
            <Link to="/register" className="btn btn-primary btn-sm">Open account</Link>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={goApp}>Go to app</button>
          )}
        </div>
      </nav>

      {/* --- hero --- */}
      <section className="lp-hero container">
        <div className="hero-text fade-up">
          <div className="eyebrow">A wallet for the way you actually spend</div>
          <h1>
            Move money with<br/>
            <em style={{ fontStyle: 'italic', color: 'var(--brass)' }}>quiet confidence.</em>
          </h1>
          <p style={{ fontSize: '1.08rem', maxWidth: '54ch', color: 'var(--ink-2)' }}>
            RentBridge brings together your wallet, transfers, expenses, and budgets
            into a single secure account — designed for residents and small renters
            who want fewer surprises and clearer numbers.
          </p>
          <div className="row" style={{ gap: 12, marginTop: 18 }}>
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Open an account</Link>
                <Link to="/login" className="btn btn-ghost btn-lg">I have one →</Link>
              </>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={goApp}>Go to app →</button>
            )}
          </div>
          <div className="trust-row">
            <span>JWT-secured sessions</span>
            <span>·</span>
            <span>Bcrypt password hashing</span>
            <span>·</span>
            <span>Audited admin actions</span>
          </div>
        </div>

        {/* Mock account card */}
        <div className="hero-card fade-up delay-2" aria-hidden="true">
          <div className="mc-head">
            <div>
              <div className="kpi-label">Wallet balance</div>
              <div className="kpi">PKR 84,520<span className="kpi-dec">.50</span></div>
            </div>
            <span className="badge ok">active</span>
          </div>
          <div className="mc-row">
            <div>
              <div className="tiny muted">Deposits, this month</div>
              <div className="mono bold">+ 42,000.00</div>
            </div>
            <div>
              <div className="tiny muted">Outflow, this month</div>
              <div className="mono bold">− 18,440.00</div>
            </div>
          </div>
          <div className="mc-tx">
            <div className="mc-tx-row">
              <span className="dot ok"/>
              <span>Rent — March</span>
              <span className="mono">−25,000</span>
            </div>
            <div className="mc-tx-row">
              <span className="dot info"/>
              <span>From: Sara Khan</span>
              <span className="mono">+8,000</span>
            </div>
            <div className="mc-tx-row">
              <span className="dot warn"/>
              <span>Utility bill</span>
              <span className="mono">−4,200</span>
            </div>
            <div className="mc-tx-row">
              <span className="dot ok"/>
              <span>Salary deposit</span>
              <span className="mono">+34,000</span>
            </div>
          </div>
          <div className="mc-foot">
            <div className="tiny muted">Latest activity</div>
            <div className="tiny mono">TXN-9F2A1C…</div>
          </div>
        </div>
      </section>

      {/* --- features --- */}
      <section className="lp-feat container">
        <div className="feat fade-up">
          <span className="feat-num">01</span>
          <h3>Wallet, expenses, budgets — one account</h3>
          <p>Deposit, withdraw, and transfer to anyone with a RentBridge account.
            Categorize expenses and set monthly limits that warn you before you overshoot.</p>
        </div>
        <div className="feat fade-up delay-1">
          <span className="feat-num">02</span>
          <h3>Suspicious-activity protection</h3>
          <p>Unusually large transfers and rapid bursts are flagged automatically for
            review — every event is logged and visible in your account history.</p>
        </div>
        <div className="feat fade-up delay-2">
          <span className="feat-num">03</span>
          <h3>Reports you can actually read</h3>
          <p>Income vs. outflow, monthly summaries, budget usage, and exportable
            transaction receipts. Numbers, not noise.</p>
        </div>
      </section>

      {/* --- close --- */}
      <section className="lp-close container">
        <div className="close-card">
          <div>
            <h2>Set up an account in under a minute.</h2>
            <p className="muted">Demo project — FAST University Islamabad, Semester 6 FinTech.</p>
          </div>
          {!isAuthenticated ? (
            <Link to="/register" className="btn btn-accent btn-lg">Open an account →</Link>
          ) : (
            <button className="btn btn-accent btn-lg" onClick={goApp}>Go to app →</button>
          )}
        </div>
      </section>

      <footer className="lp-foot container">
        <div className="row between">
          <Brand size="sm" />
          <div className="tiny muted">© RentBridge — academic demo only. No real money is moved.</div>
        </div>
      </footer>

      <style>{`
        .lp { min-height: 100vh; }
        .lp-nav {
          display: flex; justify-content: space-between; align-items: center;
          max-width: 1240px; margin: 0 auto; padding: 22px 28px;
        }
        .lp-link { font-weight: 500; font-size: 14px; color: var(--ink-2); }
        .lp-link:hover { color: var(--ink); }

        .lp-hero {
          display: grid; grid-template-columns: 1.2fr 1fr;
          gap: 56px; align-items: center;
          padding-top: 60px; padding-bottom: 100px;
        }
        .hero-text h1 { margin: 12px 0 22px; }
        .hero-text h1 em { font-style: italic; }
        .trust-row {
          margin-top: 38px;
          display: flex; gap: 12px; flex-wrap: wrap;
          font-size: 12.5px; color: var(--ink-3);
          font-family: var(--mono);
        }

        .hero-card {
          /* Dark glass card with neon accent */
          background: linear-gradient(180deg, rgba(13,20,36,0.60), rgba(8,12,22,0.45));
          backdrop-filter: blur(8px) saturate(120%);
          -webkit-backdrop-filter: blur(8px) saturate(120%);
          color: var(--ink);
          padding: 28px;
          border-radius: 14px;
          border: 1px solid rgba(77,227,255,0.06);
          box-shadow: 0 28px 80px -30px rgba(0,0,0,.7), 0 0 0 1px rgba(77,227,255,.02);
          position: relative;
          overflow: hidden;
        }
        .hero-card::before {
          /* gentle holographic glow */
          content: '';
          position: absolute; top: -30%; right: -18%;
          width: 360px; height: 360px;
          background: radial-gradient(circle at 30% 30%, rgba(77,227,255,0.08), transparent 35%),
                      radial-gradient(circle at 80% 70%, rgba(157,151,255,0.04), transparent 30%);
          filter: blur(10px);
          pointer-events: none;
        }
        .mc-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 22px; padding-bottom: 22px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .mc-head .kpi-label { color: rgba(237,244,255,.65); }
        .mc-head .kpi { color: var(--ink); font-size: 2rem; }
        .kpi-dec { color: var(--brass-2); font-size: 1.1rem; }
        .mc-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 18px;
          margin-bottom: 22px;
        }
        .mc-row .muted { color: rgba(237,244,255,.6); }
        .mc-row .bold { color: var(--ink); font-size: 16px; }
        .mc-tx { display: flex; flex-direction: column; gap: 10px; }
        .mc-tx-row {
          display: grid; grid-template-columns: 14px 1fr auto;
          align-items: center; gap: 12px;
          font-size: 13px; color: rgba(255,255,255,.85);
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,.05);
        }
        .mc-tx-row:last-child { border-bottom: 0; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.ok { background: #4faf81; }
        .dot.info { background: #67a3ce; }
        .dot.warn { background: var(--brass-2); }
        .mc-foot {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 18px; padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,.08);
        }
        .mc-foot .muted, .mc-foot .mono { color: rgba(255,255,255,.5); font-size: 11px; }

        .lp-feat {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 36px;
          padding: 80px 28px;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }
        .feat { padding-right: 12px; }
        .feat-num {
          display: inline-block;
          font-family: var(--mono); font-size: 11px;
          color: var(--brass); font-weight: 600;
          letter-spacing: .15em; margin-bottom: 14px;
        }
        .feat h3 { font-size: 1.2rem; margin-bottom: 10px; }
        .feat p { color: var(--ink-3); }

        .lp-close { padding: 90px 28px 60px; }
        .close-card {
          background: var(--surface);
          border: 1px solid var(--line);
          padding: 40px 44px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 30px; flex-wrap: wrap;
          box-shadow: var(--shadow-2);
        }
        .close-card h2 { font-size: 1.7rem; margin-bottom: 4px; }

        .lp-foot { padding: 28px; border-top: 1px solid var(--line); }

        @media (max-width: 900px) {
          .lp-hero { grid-template-columns: 1fr; padding-top: 30px; padding-bottom: 60px; gap: 36px; }
          .lp-feat { grid-template-columns: 1fr; gap: 28px; padding: 50px 28px; }
        }
      `}</style>
    </div>
  );
}
