// pages/admin/AdminReports.jsx
// GET /api/admin/reports/transaction-volume + /system-balance

import { useEffect, useState } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { Loader, Empty, ErrorBox } from '../../components/ui/States.jsx';
import { BarSeries, CategoryPie } from '../../components/charts/Charts.jsx';
import { fmtMoney, monthLabel } from '../../utils/format';

export default function AdminReports() {
  const [vol, setVol] = useState([]);
  const [bal, setBal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([api.admin.transactionVolume(), api.admin.systemBalance()])
      .then(([a, b]) => { if (!alive) return; setVol(a.data || []); setBal(b.wallets || []); })
      .catch((e) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  // Roll up transaction-volume by month
  const volChartData = (() => {
    const map = {};
    vol.forEach((x) => {
      const k = `${x._id.y}-${String(x._id.m).padStart(2, '0')}`;
      map[k] = map[k] || { label: monthLabel(x._id.y, x._id.m), deposit: 0, withdrawal: 0, transfer: 0 };
      if (map[k][x._id.type] !== undefined) map[k][x._id.type] = x.total;
    });
    return Object.keys(map).sort().map((k) => map[k]);
  })();

  const balData = bal.map((b) => ({ name: b._id || 'unknown', value: b.total }));

  return (
    <div>
      <PageHeader eyebrow="Administrator · reports" title="System reports"
        subtitle="Volume by month, balance by wallet status." />

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 className="card-title">Transaction volume by month & type</h3>
        {volChartData.length ? (
          <BarSeries data={volChartData} xKey="label"
            bars={[
              { key: 'deposit',    name: 'Deposit',    color: '#2f6f4e' },
              { key: 'withdrawal', name: 'Withdrawal', color: '#a3322a' },
              { key: 'transfer',   name: 'Transfer',   color: '#b8893d' },
            ]}
            height={280}
          />
        ) : <Empty title="No data yet" />}
      </div>

      <div className="grid grid-2" style={{ gap: 22 }}>
        <div className="card">
          <h3 className="card-title">System balance by wallet status</h3>
          {balData.length ? <CategoryPie data={balData} height={260} /> : <Empty title="No wallet data" />}
        </div>
        <div className="card">
          <h3 className="card-title">Wallet status counts</h3>
          {bal.length ? (
            <div className="stack" style={{ gap: 10 }}>
              {bal.map((b) => (
                <div key={b._id} className="row between" style={{
                  padding: '10px 14px', background: 'var(--surface-2)', border: '1px solid var(--line)',
                }}>
                  <div className="bold">{b._id}</div>
                  <div className="row" style={{ gap: 14 }}>
                    <span className="tiny muted">{b.count} wallets</span>
                    <span className="num bold">{fmtMoney(b.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty title="No data" />}
        </div>
      </div>
    </div>
  );
}
