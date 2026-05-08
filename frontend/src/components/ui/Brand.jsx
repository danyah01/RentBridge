// components/ui/Brand.jsx
// Reusable lockup. The mark is a stylized "R" inside a square.

export default function Brand({ mark = 'default', size = 'md' }) {
  const dim = size === 'lg' ? 36 : size === 'sm' ? 22 : 28;
  return (
    <div className="brand">
      <svg width={dim} height={dim} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="3"
          fill={mark === 'admin' ? '#ff5c7a' : '#4de3ff'} />
        <path
          d="M9 8h9.5a5.2 5.2 0 0 1 5.2 5.2 5.2 5.2 0 0 1-3.6 4.96L24 24h-4.05l-3.6-5.4H13V24H9zm4 3.4v3.8h5.2a1.9 1.9 0 1 0 0-3.8z"
          fill="#050816"
        />
      </svg>
      <div className="brand-text">
        <div className="brand-name">RentBridge</div>
        <div className="brand-sub">{mark === 'admin' ? 'admin' : 'wallet'}</div>
      </div>
      <style>{`
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-name {
          font-family: var(--display);
          font-size: 17px; font-weight: 700; letter-spacing: -.01em;
          color: inherit; line-height: 1;
        }
        .brand-sub {
          font-size: 9.5px; text-transform: uppercase; letter-spacing: .26em;
          color: rgba(237,244,255,.56); margin-top: 4px; font-weight: 600;
        }
      `}</style>
    </div>
  );
}
