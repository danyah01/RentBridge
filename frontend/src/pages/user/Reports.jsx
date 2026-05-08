// pages/user/Reports.jsx
// Income vs outflow chart + budget usage list + transaction monthly summary + rent plan.

import { useEffect, useState } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { Loader, Empty, ErrorBox, StatusBadge } from '../../components/ui/States.jsx';
import { LineSeries, BarSeries } from '../../components/charts/Charts.jsx';
import { fmtMoney, fmtMonth, monthLabel } from '../../utils/format';

export default function Reports() {
  const [io, setIo] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [txnMonthly, setTxnMonthly] = useState([]);
  const [loanInputs, setLoanInputs] = useState({ monthlyRent: 60000, leaseMonths: 12, markupRate: 12.5 });
  const [loanPlan, setLoanPlan] = useState(null);
  const [planError, setPlanError] = useState('');
  const [planLoading, setPlanLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const generatePlan = async (payload = loanInputs) => {
    setPlanLoading(true);
    setPlanError('');
    try {
      const d = await api.reports.loanPlan(payload);
      setLoanPlan(d.plan);
    } catch (e) {
      setPlanError(e.message);
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.reports.incomeVsExpense(),
      api.reports.budgetUsage(),
      api.transactions.monthlySummary(),
    ]).then(([a, b, c]) => {
      if (!alive) return;
      setIo(a);
      setBudgets(b.budgets || []);
      setTxnMonthly(c.summary || []);
    }).catch((e) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    generatePlan();
    return () => { alive = false; };
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} />;

  // Build income vs outflow chart data
  const ioData = (() => {
    const map = {};
    (io?.income || []).forEach((x) => {
      const k = `${x._id.y}-${String(x._id.m).padStart(2, '0')}`;
      map[k] = map[k] || { label: monthLabel(x._id.y, x._id.m), income: 0, outflow: 0 };
      map[k].income += x.total;
    });
    (io?.outflow || []).forEach((x) => {
      const k = `${x._id.y}-${String(x._id.m).padStart(2, '0')}`;
      map[k] = map[k] || { label: monthLabel(x._id.y, x._id.m), income: 0, outflow: 0 };
      map[k].outflow += x.total;
    });
    return Object.keys(map).sort().map((k) => map[k]);
  })();

  // Build txn monthly data — group by month, summing across types
  const txnData = (() => {
    const map = {};
    (txnMonthly || []).forEach((x) => {
      const k = `${x._id.y}-${String(x._id.m).padStart(2, '0')}`;
      map[k] = map[k] || { label: monthLabel(x._id.y, x._id.m), deposit: 0, withdrawal: 0, transfer: 0 };
      if (map[k][x._id.type] !== undefined) map[k][x._id.type] = x.total;
    });
    return Object.keys(map).sort().map((k) => map[k]);
  })();

  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        subtitle="How your money has moved this year, and how your budgets are tracking."
      />

      <div className="card" style={{ marginBottom: 22 }}>
        <h3 className="card-title">Income vs outflow</h3>
        {ioData.length ? (
          <LineSeries
            data={ioData} xKey="label"
            lines={[
              { key: 'income',  name: 'Income',  color: '#2f6f4e' },
              { key: 'outflow', name: 'Outflow', color: '#a3322a' },
            ]}
            height={260}
          />
        ) : <Empty title="Not enough data yet" hint="Make a few transactions to see your income vs outflow." />}
      </div>

      <div className="grid grid-2" style={{ gap: 22 }}>
        <div className="card">
          <h3 className="card-title">Transactions by type</h3>
          {txnData.length ? (
            <BarSeries
              data={txnData} xKey="label"
              bars={[
                { key: 'deposit',    name: 'Deposit',    color: '#2f6f4e' },
                { key: 'withdrawal', name: 'Withdrawal', color: '#a3322a' },
                { key: 'transfer',   name: 'Transfer',   color: '#b8893d' },
              ]}
            />
          ) : <Empty title="No transactions yet" />}
        </div>

        <div className="card">
          <h3 className="card-title">Budget usage</h3>
          {budgets.length ? (
            <div className="stack" style={{ gap: 12 }}>
              {budgets.map((b) => {
                const pct = Math.min(100, ((b.spentAmount || 0) / (b.totalLimit || 1)) * 100);
                const color = pct >= 100 ? 'var(--bad)' : pct >= 80 ? 'var(--warn)' : 'var(--ok)';
                return (
                  <div key={b._id}>
                    <div className="row between">
                      <div className="bold tiny">{fmtMonth(b.month)}</div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-alt)', borderRadius: 999, marginTop: 6 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color }} />
                    </div>
                    <div className="row between" style={{ marginTop: 4 }}>
                      <span className="tiny muted">{fmtMoney(b.spentAmount)} of {fmtMoney(b.totalLimit)}</span>
                      <span className="tiny muted mono">{Math.round(pct)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <Empty title="No budgets set" hint="Create a budget on the Budgets page." />}
        </div>
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <div className="row between" style={{ marginBottom: 14 }}>
          <div>
            <h3 className="card-title" style={{ marginBottom: 4 }}>Rent financing planner</h3>
            <div className="tiny muted">3 months advance + 1 month security, amortized across the lease term.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => generatePlan()} disabled={planLoading}>
            {planLoading ? <span className="spinner" /> : 'Recalculate'}
          </button>
        </div>

        <div className="grid grid-3" style={{ gap: 16, marginBottom: 18 }}>
          <div className="field">
            <label>Monthly rent</label>
            <input className="input" type="number" min="1" step="500"
              value={loanInputs.monthlyRent}
              onChange={(e) => setLoanInputs({ ...loanInputs, monthlyRent: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Lease months</label>
            <input className="input" type="number" min="3" step="1"
              value={loanInputs.leaseMonths}
              onChange={(e) => setLoanInputs({ ...loanInputs, leaseMonths: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label>Markup rate %</label>
            <input className="input" type="number" min="0" max="50" step="0.1"
              value={loanInputs.markupRate}
              onChange={(e) => setLoanInputs({ ...loanInputs, markupRate: Number(e.target.value) })} />
          </div>
        </div>

        {planError ? <ErrorBox message={planError} /> : null}

        {loanPlan ? (
          <>
            <div className="grid grid-4" style={{ gap: 16, marginBottom: 20 }}>
              <Metric label="Financed amount" value={fmtMoney(loanPlan.financedAmount)} />
              <Metric label="Total markup" value={fmtMoney(loanPlan.totalMarkup)} />
              <Metric label="Total repayable" value={fmtMoney(loanPlan.totalRepay)} />
              <Metric label="Monthly installment" value={fmtMoney(loanPlan.monthlyInstallment)} />
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="right">Opening balance</th>
                    <th className="right">Principal</th>
                    <th className="right">Interest</th>
                    <th className="right">Payment</th>
                    <th className="right">Closing balance</th>
                  </tr>
                </thead>
                <tbody>
                  {loanPlan.schedule.map((row) => (
                    <tr key={row.month}>
                      <td className="bold">{row.month}</td>
                      <td className="right num">{fmtMoney(row.openingBalance)}</td>
                      <td className="right num">{fmtMoney(row.principal)}</td>
                      <td className="right num">{fmtMoney(row.interest)}</td>
                      <td className="right num">{fmtMoney(row.payment)}</td>
                      <td className="right num">{fmtMoney(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <Empty title="Generating schedule…" hint="The planner will show the amortization breakdown once it loads." />
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="card flat" style={{ padding: 16 }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi" style={{ fontSize: '1.4rem' }}>{value}</div>
    </div>
  );
}
