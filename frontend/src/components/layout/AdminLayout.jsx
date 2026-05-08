// components/layout/AdminLayout.jsx
// --------------------------------------------------------------------
// Admin shell. Same skeleton as UserLayout but with admin nav and a
// red "Admin" eyebrow so the surface is unmistakably distinct.
// --------------------------------------------------------------------

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Brand from '../ui/Brand.jsx';

const NAV = [
  { to: '/admin',                label: 'Overview' },
  { to: '/admin/users',          label: 'Users' },
  { to: '/admin/wallets',        label: 'Wallets' },
  { to: '/admin/transactions',   label: 'Transactions' },
  { to: '/admin/flagged',        label: 'Flagged' },
  { to: '/admin/categories',     label: 'Categories' },
  { to: '/admin/reports',        label: 'Reports' },
  { to: '/admin/audit-logs',     label: 'Audit Logs' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <Brand mark="admin" />
        </div>
        <nav className="adm-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => 'adm-link' + (isActive ? ' active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="adm-foot">
          <div className="tiny" style={{ color: '#d4a574' }}>Administrator</div>
          <div className="tiny" style={{ color: 'rgba(255,255,255,.5)' }}>{user?.email}</div>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <div>
            <span className="eyebrow" style={{ color: 'var(--bad)' }}>Admin Console</span>
            <span style={{ marginLeft: 12, fontWeight: 600 }}>{user?.name}</span>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>User view</button>
            <button className="btn btn-primary btn-sm" onClick={onLogout}>Sign out</button>
          </div>
        </header>
        <main className="adm-page">
          <Outlet />
        </main>
      </div>

      <style>{`
        .adm-shell { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
        .adm-sidebar {
          background: linear-gradient(180deg, #101a32 0%, #050816 100%);
          color: var(--ink); padding: 26px 18px 22px;
          display: flex; flex-direction: column; gap: 22px;
          position: sticky; top: 0; height: 100vh;
          border-right: 1px solid rgba(77,227,255,.16);
        }
        .adm-brand { padding: 0 6px 8px; border-bottom: 1px solid rgba(255,255,255,.06); }
        .adm-nav { display: flex; flex-direction: column; gap: 1px; flex: 1; }
        .adm-link {
          padding: 10px 12px; color: rgba(237,244,255,.72); font-size: 14px;
          font-weight: 500; border-radius: 12px;
          transition: all .15s var(--ease); border-left: 2px solid transparent;
        }
        .adm-link:hover { color: #fff; background: rgba(77,227,255,.06); }
        .adm-link.active { color: #fff; background: rgba(77,227,255,.12); border-left-color: var(--brass-2); }
        .adm-foot { padding-top: 14px; border-top: 1px solid rgba(255,255,255,.06); }
        .adm-main { display: flex; flex-direction: column; min-width: 0; }
        .adm-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px; background: rgba(5,8,22,.72); backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(77,227,255,.12); position: sticky; top: 0; z-index: 10;
        }
        .adm-page { padding: 28px 32px 80px; min-width: 0; }
        @media (max-width: 800px) {
          .adm-shell { grid-template-columns: 1fr; }
          .adm-sidebar { position: static; height: auto; flex-direction: row; padding: 14px; overflow-x: auto; }
          .adm-brand { border: 0; padding: 0 12px 0 0; }
          .adm-nav { flex-direction: row; gap: 2px; flex: 1; }
          .adm-link { padding: 8px 12px; white-space: nowrap; }
          .adm-foot { display: none; }
          .adm-page { padding: 18px 16px 60px; }
        }
      `}</style>
    </div>
  );
}
