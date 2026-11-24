"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const links = [
  ['', 'Overview'],
  ['products', 'Products'],
  ['inventory', 'Inventory'],
  ['orders', 'Orders'],
  ['categories', 'Categories'],
  ['brands', 'Brands'],
  ['customers', 'Customers'],
  ['analytics', 'Analytics'],
  ['coupons', 'Coupons'],
  ['reviews', 'Reviews'],
  ['settings', 'Settings'],
  ['audit', 'Activity log'],
  ['account', 'My account']
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('admin_user_cache');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    if (!user) {
      api<{ name: string; role: string }>('admin/me')
        .then((u) => {
          setUser(u);
          try {
            sessionStorage.setItem('admin_user_cache', JSON.stringify(u));
          } catch {}
        })
        .catch(() => {});
    }
  }, [user]);

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <div className="admin-shell">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="admin-backdrop"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(2px)',
            zIndex: 49,
          }}
        />
      )}

      <aside className={'admin-sidebar ' + (open ? 'open' : '')} style={{ zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 20px' }}>
          <div className="admin-brand" style={{ padding: 0 }}>
            HALAL SHEBA
            <small>BUSINESS MANAGER</small>
          </div>
          {open && (
            <button
              onClick={() => setOpen(false)}
              className="secondary"
              style={{
                width: 32,
                height: 32,
                padding: 0,
                borderRadius: '50%',
                fontSize: 14,
                lineHeight: 1,
              }}
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>

        <nav>
          {links.map(([key, label]) => (
            <Link
              key={key}
              href={'/admin' + (key ? '/' + key : '')}
              onClick={() => setOpen(false)}
              className={path === '/admin' + (key ? '/' + key : '') ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div>
        <header className="admin-topbar">
          <div className="row">
            <button
              className="mobile-menu secondary"
              onClick={() => setOpen(!open)}
              style={{ minHeight: 40, minWidth: 40, fontSize: 18 }}
              aria-label="Open navigation menu"
            >
              ☰
            </button>
            <span className="muted" style={{ fontWeight: 600 }}>Halal Sheba / Administration</span>
          </div>
          <div className="row">
            <Link href="/" target="_blank" className="muted" style={{ fontSize: 13 }}>
              ওয়েবসাইট দেখুন ↗
            </Link>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{user?.name || 'Admin'}</span>
            <button
              className="secondary"
              style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={async () => {
                sessionStorage.removeItem('admin_user_cache');
                await api('admin/logout', { method: 'POST' });
                window.location.assign('/admin/login');
              }}
            >
              Sign out
            </button>
          </div>
        </header>
        <div className="admin-main">{children}</div>

        {/* Mobile Admin Bottom Nav - Quick Thumb Switcher */}
        <nav className="admin-mobile-nav no-print" aria-label="Admin Quick Navigation">
          <Link
            href="/admin"
            className={path === '/admin' ? 'active' : ''}
          >
            <span style={{ fontSize: 18 }}>📊</span>
            <span>ওভারভিউ</span>
          </Link>
          <Link
            href="/admin/orders"
            className={path.startsWith('/admin/orders') ? 'active' : ''}
          >
            <span style={{ fontSize: 18 }}>📦</span>
            <span>অর্ডারস</span>
          </Link>
          <Link
            href="/admin/products"
            className={path.startsWith('/admin/products') ? 'active' : ''}
          >
            <span style={{ fontSize: 18 }}>🏷️</span>
            <span>প্রোডাক্টস</span>
          </Link>
          <Link
            href="/admin/settings"
            className={path.startsWith('/admin/settings') ? 'active' : ''}
          >
            <span style={{ fontSize: 18 }}>⚙️</span>
            <span>সেটিংস</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 11,
              fontWeight: 600,
              gap: 2,
              cursor: 'pointer',
              minHeight: 'auto',
            }}
          >
            <span style={{ fontSize: 18 }}>☰</span>
            <span>মেনু</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
