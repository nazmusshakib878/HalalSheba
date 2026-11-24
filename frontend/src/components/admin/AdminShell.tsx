"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
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
  const [unreadOrderCount, setUnreadOrderCount] = useState<number>(0);
  const [user, setUser] = useState<{ name: string; role: string } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('admin_user_cache');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  });

  const markOrdersAsSeen = useCallback(() => {
    setUnreadOrderCount(0);
    api<Array<{ id: number }>>('admin/orders')
      .then((orders) => {
        if (Array.isArray(orders) && orders.length > 0) {
          const maxId = Math.max(...orders.map((o) => o.id));
          localStorage.setItem('admin_last_seen_order_id', String(maxId));
        }
      })
      .catch(() => {});
  }, []);

  const checkNewOrders = useCallback(async () => {
    try {
      const orders = await api<Array<{ id: number; status: string }>>('admin/orders');
      if (!Array.isArray(orders) || orders.length === 0) return;

      const isOrdersPage = window.location.pathname === '/admin/orders' || window.location.pathname.startsWith('/admin/orders/');
      const maxId = Math.max(...orders.map((o) => o.id));

      if (isOrdersPage) {
        localStorage.setItem('admin_last_seen_order_id', String(maxId));
        setUnreadOrderCount(0);
        return;
      }

      const storedLastSeen = localStorage.getItem('admin_last_seen_order_id');
      if (storedLastSeen === null) {
        const newOrders = orders.filter((o) => o.status === 'new');
        setUnreadOrderCount(newOrders.length);
      } else {
        const lastSeenId = Number(storedLastSeen);
        const unread = orders.filter((o) => o.id > lastSeenId);
        setUnreadOrderCount(unread.length);
      }
    } catch {}
  }, []);

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

  // When visiting orders page, automatically clear the badge
  useEffect(() => {
    setOpen(false);
    if (path === '/admin/orders' || path.startsWith('/admin/orders/')) {
      markOrdersAsSeen();
    }
  }, [path, markOrdersAsSeen]);

  // Periodically check for new orders
  useEffect(() => {
    checkNewOrders();
    const timer = setInterval(checkNewOrders, 8000);
    return () => clearInterval(timer);
  }, [checkNewOrders, path]);

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
          {links.map(([key, label]) => {
            const isOrders = key === 'orders';
            const isActive = path === '/admin' + (key ? '/' + key : '');
            return (
              <Link
                key={key}
                href={'/admin' + (key ? '/' + key : '')}
                onClick={() => {
                  setOpen(false);
                  if (isOrders) markOrdersAsSeen();
                }}
                className={isActive ? 'active' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                <span>{label}</span>
                {isOrders && unreadOrderCount > 0 && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      height: '20px',
                      minWidth: '20px',
                      borderRadius: '10px',
                      padding: '0 6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.45)',
                    }}
                  >
                    {unreadOrderCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div>
        <header className="admin-topbar">
          <div className="row">
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <button
                className="mobile-menu secondary"
                onClick={() => setOpen(!open)}
                style={{ minHeight: 40, minWidth: 40, fontSize: 18 }}
                aria-label="Open navigation menu"
              >
                ☰
              </button>
              {unreadOrderCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    height: '16px',
                    minWidth: '16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                  }}
                >
                  {unreadOrderCount}
                </span>
              )}
            </div>
            <span className="muted" style={{ fontWeight: 600 }}>Halal Sheba / Administration</span>
            {unreadOrderCount > 0 && (
              <Link
                href="/admin/orders"
                onClick={markOrdersAsSeen}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: '1px solid #fca5a5',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textDecoration: 'none',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                {unreadOrderCount} New Order{unreadOrderCount > 1 ? 's' : ''}
              </Link>
            )}
          </div>
          <div className="row">
            <Link href="/" target="_blank" className="muted" style={{ fontSize: 13 }}>
              View Website ↗
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
            <span>Overview</span>
          </Link>
          <Link
            href="/admin/orders"
            onClick={markOrdersAsSeen}
            className={path.startsWith('/admin/orders') ? 'active' : ''}
            style={{ position: 'relative' }}
          >
            <span style={{ fontSize: 18, position: 'relative' }}>
              📦
              {unreadOrderCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -6,
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    height: '14px',
                    minWidth: '14px',
                    borderRadius: '7px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 2px',
                  }}
                >
                  {unreadOrderCount}
                </span>
              )}
            </span>
            <span>Orders</span>
          </Link>
          <Link
            href="/admin/products"
            className={path.startsWith('/admin/products') ? 'active' : ''}
          >
            <span style={{ fontSize: 18 }}>🏷️</span>
            <span>Products</span>
          </Link>
          <Link
            href="/admin/settings"
            className={path.startsWith('/admin/settings') ? 'active' : ''}
          >
            <span style={{ fontSize: 18 }}>⚙️</span>
            <span>Settings</span>
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
            <span>Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
