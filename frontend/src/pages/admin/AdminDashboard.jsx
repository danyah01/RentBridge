// pages/admin/AdminDashboard.jsx
// GET /api/admin/dashboard

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { Loader, ErrorBox } from '../../components/ui/States.jsx';
import { fmtMoney, fmtNumber } from '../../utils/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api.admin.dashboard()
      .then((d) => { if (alive) setStats(d); })
      .catch((e) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  const cards = [
    { label: 'Total users',         value: fmtNumber(stats.totalUsers),         link: '/admin/users' },
    { label: 'Active users',        value: fmtNumber(stats.activeUsers) },
    { label: 'Blocked users',       value: fmtNumber(stats.blockedUsers),       danger: stats.blockedUsers > 0 },
    { label: 'Transactions',        value: fmtNumber(stats.totalTransactions),  link: '/admin/transactions' },
    { label: 'Flagged transactions', value: fmtNumber(stats.flaggedTransactions), link: '/admin/flagged', danger: stats.flaggedTransactions > 0 },
    { label: 'Transaction volume',  value: fmtMoney(stats.transactionVolume) },
    { label: 'System balance',      value: fmtMoney(stats.systemBalance),       link: '/admin/wallets' },
    { label: 'Loan eligibility',    value: 'Review users',                      link: '/admin/users' },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Administrator console"
        title="Overview"
        subtitle="System-wide health, users, and transaction signals."
      />
      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        {cards.map((c) => {
          const inner = (
            <div className="card" style={{
              borderLeft: c.danger ? '3px solid var(--bad)' : '3px solid var(--brass)',
              transition: 'all .15s ease',
            }}>
              <div className="kpi-label">{c.label}</div>
              <div className="kpi" style={{ fontSize: '1.7rem' }}>{c.value}</div>
              {c.link && <span className="tiny" style={{ color: 'var(--brass)' }}>View →</span>}
            </div>
          );
          return c.link ? <Link key={c.label} to={c.link}>{inner}</Link> : <div key={c.label}>{inner}</div>;
        })}
      </div>

      <div className="grid grid-3" style={{ gap: 18 }}>
        <Link to="/admin/users"        className="card flat"><h4>Users</h4><p className="muted">Search, view, block / unblock.</p></Link>
        <Link to="/admin/transactions" className="card flat"><h4>Transactions</h4><p className="muted">Browse the entire ledger.</p></Link>
        <Link to="/admin/flagged"      className="card flat"><h4>Flagged</h4><p className="muted">Review suspicious activity.</p></Link>
        <Link to="/admin/categories"   className="card flat"><h4>Categories</h4><p className="muted">Manage taxonomy.</p></Link>
        <Link to="/admin/reports"      className="card flat"><h4>Reports</h4><p className="muted">Volume & balance over time.</p></Link>
        <Link to="/admin/users"        className="card flat"><h4>Loan eligibility</h4><p className="muted">Open a user to see credit score and approval status.</p></Link>
        <Link to="/admin/audit-logs"   className="card flat"><h4>Audit logs</h4><p className="muted">Privileged action history.</p></Link>
      </div>
    </div>
  );
}
