// pages/user/Dashboard.jsx
// --------------------------------------------------------------------
// Top-level user landing. Pulls /api/reports/user-dashboard and renders:
//   - Wallet balance KPI
//   - Quick action buttons (deposit / withdraw / transfer)
//   - Monthly expense area chart
//   - Recent transactions list
// --------------------------------------------------------------------

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { Loader, Empty, ErrorBox, StatusBadge } from '../../components/ui/States.jsx';
import { AreaSeries } from '../../components/charts/Charts.jsx';
import { fmtMoney, fmtDateTime, monthLabel, truncate } from '../../utils/format';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.reports.userDashboard()
      .then((d) => { if (alive) setData(d); })
      .catch((e) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <Loader label="Loading your dashboard…" />;
  if (error) return <ErrorBox message={error} />;

  const chartData = (data?.monthlyExpenses || []).map((m) => ({
    label: monthLabel(m._id.y, m._id.m),
    total: m.total,
  }));

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5)  return 'Late night';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div>
      <PageHeader
        eyebrow={greeting}
        title={`Welcome, ${user?.name?.split(' ')[0] || 'there'}.`}
        subtitle="A quick view of your wallet, recent activity, and how the month is shaping up."
      />

      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        <KpiCard
          eyebrow="Wallet balance"
          value={fmtMoney(data.walletBalance, data.currency)}
          link="/wallet"
          accent
        />
        <KpiCard
          eyebrow="Transactions"
          value={data.transactionCount}
          link="/transactions"
        />
        <KpiCard
          eyebrow="Currency"
          value={data.currency || 'PKR'}
        />
        <KpiCard
          eyebrow="Account"
          value={user?.status === 'active' ? 'Active' : 'Blocked'}
        />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 22, marginBottom: 28 }}>
        <div className="card">
          <div className="row between" style={{ marginBottom: 10 }}>
            <h3 className="card-title">Rent financing</h3>
            <span className="badge info">new</span>
          </div>
          <p className="muted" style={{ marginBottom: 14 }}>
            Estimate the 3 months advance + 1 month security deposit, then view the full amortization schedule.
          </p>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <Link to="/reports" className="btn btn-primary btn-sm">Open planner</Link>
            <Link to="/reports" className="btn btn-ghost btn-sm">See breakdown</Link>
          </div>
        </div>

        <div className="card">
          <div className="row between" style={{ marginBottom: 10 }}>
            <h3 className="card-title">Loan readiness</h3>
            <span className="badge muted">profile based</span>
          </div>
          <p className="muted" style={{ marginBottom: 14 }}>
            Keep your employer and monthly income updated so your credit analysis stays accurate for admin review.
          </p>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <Link to="/profile" className="btn btn-ghost btn-sm">Update profile</Link>
            <Link to="/reports" className="btn btn-ghost btn-sm">View reports</Link>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 22, marginBottom: 28 }}>
        <div className="card">
          <div className="row between" style={{ marginBottom: 8 }}>
            <h3 className="card-title">Monthly outflow</h3>
            <span className="tiny muted">last 6 months</span>
          </div>
          {chartData.length ? (
            <AreaSeries data={chartData} xKey="label" areaKey="total" color="#0b1620" height={220} />
          ) : (
            <Empty title="No expense activity yet" hint="Record an expense to see your monthly trend." />
          )}
        </div>

        <div className="card">
          <h3 className="card-title">Quick actions</h3>
          <div className="stack" style={{ gap: 10 }}>
            <Link to="/wallet/deposit"  className="btn btn-primary"  style={{ justifyContent: 'space-between' }}>
              <span>Deposit funds</span><span>→</span>
            </Link>
            <Link to="/wallet/withdraw" className="btn btn-ghost"    style={{ justifyContent: 'space-between' }}>
              <span>Withdraw</span><span>→</span>
            </Link>
            <Link to="/wallet/transfer" className="btn btn-ghost"    style={{ justifyContent: 'space-between' }}>
              <span>Send to a user</span><span>→</span>
            </Link>
            <Link to="/expenses"        className="btn btn-ghost"    style={{ justifyContent: 'space-between' }}>
              <span>Log an expense</span><span>→</span>
            </Link>
            <Link to="/budgets"         className="btn btn-ghost"    style={{ justifyContent: 'space-between' }}>
              <span>Manage budgets</span><span>→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row between" style={{ marginBottom: 12 }}>
          <h3 className="card-title">Recent activity</h3>
          <Link to="/transactions" className="tiny" style={{ color: 'var(--brass)', fontWeight: 600 }}>View all →</Link>
        </div>
        {data.recentTransactions?.length ? (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((t) => (
                  <tr key={t._id}>
                    <td><span className="badge muted">{t.type}</span></td>
                    <td>{truncate(t.description || t.transactionId, 40)}</td>
                    <td className="tiny muted">{fmtDateTime(t.createdAt)}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="right num">{fmtMoney(t.amount, data.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No transactions yet" hint="Make your first deposit to get started." />
        )}
      </div>
    </div>
  );
}

function KpiCard({ eyebrow, value, link, accent }) {
  const inner = (
    <div className={'kpi-card' + (accent ? ' accent' : '')}>
      <div className="kpi-label">{eyebrow}</div>
      <div className="kpi" style={{ fontSize: '1.9rem' }}>{value}</div>
      {link && <span className="tiny" style={{ color: 'var(--brass)' }}>View →</span>}
      <style>{`
        .kpi-card {
          background: var(--surface);
          border: 1px solid var(--line);
          padding: 22px;
          border-radius: 18px;
          transition: all .15s var(--ease);
        }
        .kpi-card .kpi { color: var(--ink); }
        .kpi-card.accent {
          background: linear-gradient(180deg, #111a2d 0%, #08111f 100%);
          color: var(--ink);
          border-color: rgba(77,227,255,.16);
          box-shadow: 0 18px 36px -20px rgba(0,0,0,.65), 0 0 0 1px rgba(77,227,255,.08);
        }
        .kpi-card.accent .kpi { color: #f4fbff; }
        .kpi-card.accent .kpi-label { color: rgba(237,244,255,.6); }
        .kpi-card.accent .tiny { color: var(--brass); }
        .kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-2); }
      `}</style>
    </div>
  );
  return link ? <Link to={link}>{inner}</Link> : inner;
}
