// components/layout/UserLayout.jsx
// --------------------------------------------------------------------
// Authenticated app shell for regular users:
//   - Left: vertical navigation
//   - Top:  thin bar with user info + logout
//   - Main: <Outlet/> for the route's page
// --------------------------------------------------------------------

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api';
import Brand from '../ui/Brand.jsx';

const NAV = [
  { to: '/dashboard',     label: 'Dashboard' },
  { to: '/wallet',        label: 'Wallet' },
  { to: '/transactions',  label: 'Transactions' },
  { to: '/expenses',      label: 'Expenses' },
  { to: '/budgets',       label: 'Budgets' },
  { to: '/reports',       label: 'Reports' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile',       label: 'Profile' },
];

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  // Tiny notification badge — fetches once on mount.
  useEffect(() => {
    let alive = true;
    api.notifications.list().then((data) => {
      if (!alive) return;
      const c = (data.notifications || []).filter((n) => !n.readStatus).length;
      setUnread(c);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Brand />
        </div>
        <nav className="side-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) => 'side-link' + (isActive ? ' active' : '')}
            >
              <span>{item.label}</span>
              {item.to === '/notifications' && unread > 0 && (
                <span className="nav-pill">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="tiny muted">FAST University · Semester 6</div>
          <div className="tiny muted">RentBridge v1.0</div>
        </div>
      </aside>

      <div className="main-col">
        <header className="topbar">
          <div className="topbar-left">
            <span className="eyebrow">Account</span>
            <span className="topbar-user">{user?.name}</span>
            <span className="muted tiny">· {user?.email}</span>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>Profile</button>
            <button className="btn btn-primary btn-sm" onClick={onLogout}>Sign out</button>
          </div>
        </header>

        <main className="page">
          <Outlet />
        </main>
      </div>

      <style>{`
        .shell {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: 100vh;
        }
        .sidebar {
          background: linear-gradient(180deg, #0c1324 0%, #050816 100%);
          color: var(--ink);
          padding: 26px 18px 22px;
          display: flex;
          flex-direction: column;
          gap: 22px;
          position: sticky;
          top: 0;
          height: 100vh;
          border-right: 1px solid rgba(77,227,255,.12);
        }
        .sidebar-brand {
          padding: 0 6px 8px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .side-nav {
          display: flex; flex-direction: column; gap: 1px;
          flex: 1;
        }
        .side-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px;
          color: rgba(237,244,255,.72);
          font-size: 14px;
          font-weight: 500;
          letter-spacing: .005em;
          border-radius: 12px;
          transition: all .15s var(--ease);
          border-left: 2px solid transparent;
        }
        .side-link:hover {
          color: #fff;
          background: rgba(77,227,255,.06);
        }
        .side-link.active {
          color: #fff;
          background: rgba(77,227,255,.12);
          border-left-color: var(--brass-2);
        }
        .nav-pill {
          background: rgba(77,227,255,.16);
          color: var(--ink);
          font-size: 10.5px;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 999px;
          letter-spacing: 0;
        }
        .sidebar-foot {
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,.06);
          color: rgba(237,244,255,.48);
        }
        .sidebar-foot .muted { color: rgba(237,244,255,.42); }
        .main-col {
          display: flex;
          flex-direction: column;
          min-width: 0; /* allow children to shrink */
        }
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px;
          background: rgba(5,8,22,.72);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(77,227,255,.12);
          position: sticky; top: 0; z-index: 10;
        }
        .topbar-left { display: flex; align-items: baseline; gap: 12px; }
        .topbar-user { font-weight: 600; font-size: 14px; }
        .page { padding: 28px 32px 80px; min-width: 0; }

        @media (max-width: 800px) {
          .shell { grid-template-columns: 1fr; }
          .sidebar {
            position: static; height: auto;
            flex-direction: row; align-items: center;
            padding: 14px;
            overflow-x: auto;
          }
          .sidebar-brand { border: 0; padding: 0 12px 0 0; }
          .side-nav { flex-direction: row; flex: 1; gap: 2px; }
          .side-link { padding: 8px 12px; white-space: nowrap; }
          .sidebar-foot { display: none; }
          .topbar { padding: 12px 16px; }
          .page { padding: 18px 16px 60px; }
        }
      `}</style>
    </div>
  );
}
