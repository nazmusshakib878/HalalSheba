"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useData, money, Notice, Table, Loading, formatBdDate } from './shared';
import type { Row } from './Products';

export const mainStatuses = [
  { key: 'new', label: 'নতুন অর্ডার (New)' },
  { key: 'confirmed', label: 'কনফার্মড (Confirmed)' },
  { key: 'shipped', label: 'কুরিয়ারে পাঠানো (Shipped)' },
  { key: 'delivered', label: 'ডেলিভার্ড (Delivered)' },
  { key: 'cancelled', label: 'বাতিল (Cancelled)' },
];

export const statusMap: Record<string, { label: string; bg: string; color: string }> = {
  new: { label: 'নতুন অর্ডার (New)', bg: '#fef3c7', color: '#92400e' },
  pending: { label: 'নতুন অর্ডার (New)', bg: '#fef3c7', color: '#92400e' },
  confirmed: { label: 'কনফার্মড (Confirmed)', bg: '#dbeafe', color: '#1e40af' },
  processing: { label: 'কনফার্মড (Confirmed)', bg: '#dbeafe', color: '#1e40af' },
  packed: { label: 'কনফার্মড (Confirmed)', bg: '#dbeafe', color: '#1e40af' },
  shipped: { label: 'কুরিয়ারে পাঠানো (Shipped)', bg: '#cffafe', color: '#155e75' },
  out_for_delivery: { label: 'কুরিয়ারে পাঠানো (Shipped)', bg: '#cffafe', color: '#155e75' },
  delivered: { label: 'ডেলিভার্ড (Delivered)', bg: '#dcfce7', color: '#166534' },
  cancelled: { label: 'বাতিল (Cancelled)', bg: '#ffe4e6', color: '#9f1239' },
  returned: { label: 'বাতিল (Cancelled)', bg: '#ffe4e6', color: '#9f1239' },
  refunded: { label: 'বাতিল (Cancelled)', bg: '#ffe4e6', color: '#9f1239' },
};

export const statuses = mainStatuses.map(s => s.key);

export function Orders() {
  const { data, error } = useData<Row[]>('admin/orders');
  const { data: variants } = useData<Row[]>('admin/inventory');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [create, setCreate] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState([{ variant_id: '', quantity: 1 }]);

  const rows = data?.filter((o) => {
    const matchesQuery = (o.reference + ' ' + o.name + ' ' + o.phone).toLowerCase().includes(q.toLowerCase());
    if (!filter) return matchesQuery;
    if (filter === 'new') return matchesQuery && (o.status === 'new' || o.status === 'pending');
    if (filter === 'confirmed') return matchesQuery && (o.status === 'confirmed' || o.status === 'processing' || o.status === 'packed');
    if (filter === 'shipped') return matchesQuery && (o.status === 'shipped' || o.status === 'out_for_delivery');
    if (filter === 'delivered') return matchesQuery && o.status === 'delivered';
    if (filter === 'cancelled') return matchesQuery && (o.status === 'cancelled' || o.status === 'returned' || o.status === 'refunded');
    return matchesQuery && o.status === filter;
  });

  return (
    <>
      <div className="toolbar">
        <div>
          <h1>অর্ডার ব্যবস্থাপনা (Orders)</h1>
          <p className="muted">ওয়েবসাইট ও কাস্টমারদের সমস্ত অর্ডারের লাইভ তালিকা ও ইনভেন্টরি।</p>
        </div>
        <div className="row">
          <button onClick={() => setCreate(!create)}>+ ম্যানুয়াল অর্ডার তৈরি</button>
        </div>
      </div>

      <Notice text={error || message} />

      <div className="toolbar">
        <input
          placeholder="সার্চ করুন (রেফারেন্স, নাম বা মোবাইল নম্বর)..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <div className="row">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ fontWeight: 600, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="">সব স্ট্যাটাস ({data?.length || 0})</option>
            {mainStatuses.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {create && (
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const f = new FormData(e.currentTarget);
            try {
              await api('admin/orders', {
                method: 'POST',
                body: JSON.stringify({
                  ...Object.fromEntries(f),
                  payment_method: 'cod',
                  idempotency_key: crypto.randomUUID(),
                  items: items.map((i) => ({ ...i, variant_id: Number(i.variant_id) })),
                }),
              });
              location.reload();
            } catch (err) {
              setMessage((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>নতুন ম্যানুয়াল অর্ডার এন্ট্রি</h2>
          <div className="grid">
            <label>কাস্টমারের নাম<input name="name" required placeholder="গ্রাহকের নাম" /></label>
            <label>মোবাইল নম্বর<input name="phone" required placeholder="017xxxxxxxx" /></label>
            <label className="span-2">সম্পূর্ণ ঠিকানা<input name="address" required placeholder="বাসা/রোড, এলাকা, থানা, জেলা" /></label>
            <label>জেলা / সিটি<input name="district" required defaultValue="Dhaka" /></label>
            <label>
              অর্ডার সোর্স
              <select name="source">
                <option value="phone">ফোন কল (Phone)</option>
                <option value="whatsapp">হোয়াটসঅ্যাপ (WhatsApp)</option>
                <option value="manual">অন্যান্য (Manual)</option>
              </select>
            </label>
            <label className="span-2">অর্ডার নোট (যদি থাকে)<input name="note" placeholder="বিশেষ কোনো নির্দেশনা" /></label>
          </div>

          <h3 style={{ marginTop: 20, fontSize: 15, fontWeight: 700 }}>পণ্য ও পরিমাণ নির্বাচন করুন:</h3>
          {items.map((item, i) => (
            <div key={i} className="row" style={{ marginTop: 10 }}>
              <select
                style={{ flex: 1 }}
                required
                value={item.variant_id}
                onChange={(e) =>
                  setItems(items.map((x, j) => (i === j ? { ...x, variant_id: e.target.value } : x)))
                }
              >
                <option value="">পণ্য ও ভ্যারিয়েন্ট সিলেক্ট করুন</option>
                {variants?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.product_name} — {v.name} ({money(v.price)}) · {v.available} টি স্টকে আছে
                  </option>
                ))}
              </select>
              <input
                aria-label="Quantity"
                style={{ width: 90 }}
                type="number"
                min={variants?.find((v) => String(v.id) === item.variant_id)?.product_slug === "satkhira-aam" ? 5 : 1}
                required
                value={item.quantity}
                onChange={(e) =>
                  setItems(items.map((x, j) => (i === j ? { ...x, quantity: Number(e.target.value) } : x)))
                }
              />
              <button
                type="button"
                className="danger"
                disabled={items.length === 1}
                onClick={() => setItems(items.filter((_, j) => j !== i))}
              >
                রিমুভ
              </button>
            </div>
          ))}

          <div className="row" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="secondary"
              onClick={() => setItems([...items, { variant_id: '', quantity: 1 }])}
            >
              + আরও পণ্য যোগ করুন
            </button>
            <button disabled={busy}>{busy ? 'অর্ডার হচ্ছে…' : 'অর্ডার সংরক্ষণ করুন'}</button>
          </div>
        </form>
      )}

      {!data ? (
        <Loading />
      ) : (
        <>
          {/* Mobile Order Cards View (shown on screens < 768px) */}
          <div className="mobile-orders-view">
            {rows?.length === 0 ? (
              <div className="empty panel">কোনো অর্ডার পাওয়া যায়নি।</div>
            ) : (
              rows?.map((o) => {
                const st = statusMap[o.status] || { label: o.status, bg: '#f1f5f9', color: '#475569' };
                const isPaid = o.payment_status === 'paid';
                return (
                  <div key={o.id} className="mobile-order-card panel" style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                      <strong style={{ fontFamily: 'monospace', fontSize: 15, color: '#075744', letterSpacing: '0.5px' }}>
                        #{o.reference.slice(0, 8).toUpperCase()}
                      </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {(() => {
                          const risk = o.fraud_risk || ((o.fraud_score ?? 0) >= 50 ? 'high' : (o.fraud_score ?? 0) >= 25 ? 'medium' : 'low');
                          const score = o.fraud_score ?? (risk === 'high' ? 70 : risk === 'medium' ? 35 : 5);
                          if (risk === 'high') {
                            return (
                              <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 800, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}>
                                🔴 ভুয়া ঝুঁকি ({score}%)
                              </span>
                            );
                          }
                          if (risk === 'medium') {
                            return (
                              <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                                🟡 যাচাই ({score}%)
                              </span>
                            );
                          }
                          return (
                            <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>
                              🟢 নিরাপদ
                            </span>
                          );
                        })()}
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: st.bg,
                            color: st.color,
                          }}
                        >
                          {st.label}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                      {o.name}
                    </div>
                    {o.payment_method === 'bkash' && (
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#be185d', marginTop: 4 }}>
                        বিকাশ • TrxID: {o.bkash_trxid || '—'}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <a
                        href={`tel:${o.phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13,
                          fontWeight: 800,
                          color: '#ffffff',
                          background: '#075744',
                          padding: '6px 12px',
                          borderRadius: 6,
                          textDecoration: 'none',
                          boxShadow: '0 2px 6px rgba(7, 87, 68, 0.25)',
                        }}
                      >
                        📞 কল করুন ({o.phone})
                      </a>
                      <a
                        href={`https://wa.me/88${String(o.phone).replace(/[^0-9]/g, '').replace(/^88/, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${o.name}, হালাল সেবা থেকে আপনার অর্ডার #${o.reference.slice(0, 8).toUpperCase()} এর বিষয়ে যোগাযোগ করা হচ্ছে।`)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#047857',
                          background: '#dcfce7',
                          border: '1px solid #86efac',
                          padding: '6px 10px',
                          borderRadius: 6,
                          textDecoration: 'none',
                        }}
                      >
                        💬 WhatsApp
                      </a>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                      <div>
                        <div className="muted" style={{ fontSize: 11 }}>
                          {formatBdDate(o.created_at, { year: undefined })}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#075744', marginTop: 2 }}>
                          {money(o.total)}
                        </div>
                      </div>

                      <Link className="button secondary" href={'/admin/orders/' + o.id} style={{ fontSize: 13, padding: '8px 14px' }}>
                        ইনভয়েস ও স্ট্যাটাস ↗
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="desktop-orders-table">
            <Table headers={['রেফারেন্স ID', 'গ্রাহকের নাম ও মোবাইল নম্বর', 'অর্ডারের তারিখ', 'মোট টাকা', 'পেমেন্ট অবস্থা', 'ভুয়া ঝুঁকি (Fake Risk)', 'অর্ডার স্ট্যাটাস', 'কনফার্মেশন অ্যাকশন']} empty={!rows?.length}>
              {rows?.map((o) => {
                const st = statusMap[o.status] || { label: o.status, bg: '#f1f5f9', color: '#475569' };
                const isPaid = o.payment_status === 'paid';
                const isUnconfirmed = o.status === 'new' || o.status === 'pending';
                const cleanPhone = String(o.phone || '').replace(/[^0-9]/g, '');
                const waPhone = cleanPhone.startsWith('88') ? cleanPhone : '88' + cleanPhone;
                return (
                  <tr key={o.id} style={isUnconfirmed ? { background: '#fdfbf6' } : undefined}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                        #{o.reference.slice(0, 8).toUpperCase()}
                      </strong>
                      {o.payment_method === 'bkash' && (
                        <div style={{ marginTop: 4, fontSize: 11, color: '#be185d', fontWeight: 700 }}>
                          বিকাশ • TrxID: {o.bkash_trxid || '—'}
                        </div>
                      )}
                      {isUnconfirmed && (
                        <div style={{ marginTop: 4 }}>
                          <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                            🔔 কল করুন
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{o.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                        <a
                          href={`tel:${o.phone}`}
                          title="গ্রাহককে সরাসরি কল দিন"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#065f46',
                            background: '#ecfdf5',
                            border: '1.5px solid #059669',
                            padding: '3px 8px',
                            borderRadius: 6,
                            textDecoration: 'none',
                          }}
                        >
                          📞 {o.phone}
                        </a>
                        <a
                          href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${o.name}, হালাল সেবা থেকে আপনার অর্ডার #${o.reference.slice(0, 8).toUpperCase()} এর বিষয়ে কনফার্মেশনের জন্য যোগাযোগ করা হচ্ছে।`)}`}
                          target="_blank"
                          rel="noreferrer"
                          title="WhatsApp মেসেজ দিন"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#047857',
                            background: '#dcfce7',
                            border: '1px solid #86efac',
                            padding: '3px 6px',
                            borderRadius: 6,
                            textDecoration: 'none',
                          }}
                        >
                          💬 WA
                        </a>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: '#475569' }}>
                      {formatBdDate(o.created_at)}
                    </td>
                    <td>
                      <strong style={{ color: '#075744', fontSize: 15 }}>{money(o.total)}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: isPaid ? '#dcfce7' : '#fef3c7',
                          color: isPaid ? '#15803d' : '#b45309',
                        }}
                      >
                        {isPaid ? 'পরিশোধিত (Paid)' : 'বাকি (Unpaid / COD)'}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const risk = o.fraud_risk || ((o.fraud_score ?? 0) >= 50 ? 'high' : (o.fraud_score ?? 0) >= 25 ? 'medium' : 'low');
                        const score = o.fraud_score ?? (risk === 'high' ? 70 : risk === 'medium' ? 35 : 5);
                        if (risk === 'high') {
                          return (
                            <div>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '3px 10px',
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 800,
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  border: '1px solid #fca5a5',
                                }}
                              >
                                🔴 ভুয়া সন্দেহ ({score}%)
                              </span>
                              {o.fraud_reasons && o.fraud_reasons[0] && (
                                <div style={{ fontSize: 10, color: '#dc2626', marginTop: 3, fontWeight: 600, maxWidth: 130 }}>
                                  {o.fraud_reasons[0]}
                                </div>
                              )}
                            </div>
                          );
                        }
                        if (risk === 'medium') {
                          return (
                            <div>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '3px 10px',
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  border: '1px solid #fde68a',
                                }}
                              >
                                🟡 যাচাই করুন ({score}%)
                              </span>
                              {o.fraud_reasons && o.fraud_reasons[0] && (
                                <div style={{ fontSize: 10, color: '#b45309', marginTop: 3, fontWeight: 600, maxWidth: 130 }}>
                                  {o.fraud_reasons[0]}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #86efac',
                            }}
                          >
                            🟢 নিরাপদ
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <a
                          href={`tel:${o.phone}`}
                          className="button"
                          style={{
                            background: '#075744',
                            color: '#fff',
                            fontSize: 12,
                            padding: '6px 10px',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontWeight: 700,
                            borderRadius: 6,
                          }}
                        >
                          📞 কল দিন
                        </a>
                        <Link className="button secondary" href={'/admin/orders/' + o.id} style={{ fontSize: 12, padding: '6px 8px' }}>
                          ইনভয়েস ↗
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
          </div>
        </>
      )}
    </>
  );
}

export function OrderDetail({ id }: { id: string }) {
  const { data, error, reload } = useData<Row>('admin/orders/' + id);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (!data)
    return (
      <>
        <Notice text={error} error />
        <Loading />
      </>
    );

  const { order: o, customer: c, items } = data;
  const st = statusMap[o.status] || { label: o.status, bg: '#f1f5f9', color: '#475569' };
  const isPaid = o.payment_status === 'paid';
  const orderRef = String(o.reference).slice(0, 8).toUpperCase();

  return (
    <>
      {/* Top action toolbar - hidden when printing */}
      <div className="toolbar no-print">
        <div>
          <Link href="/admin/orders" className="button secondary" style={{ marginBottom: 8, display: 'inline-flex' }}>
            ← সকল অর্ডারের তালিকা
          </Link>
          <h1>অর্ডার বিবরণী #{orderRef}</h1>
        </div>
        <div className="row">
          <button
            onClick={() => window.print()}
            style={{
              background: '#075744',
              color: '#fff',
              fontWeight: 700,
              padding: '10px 20px',
              boxShadow: '0 4px 14px rgba(7, 87, 68, 0.25)',
            }}
          >
            🖨️ প্রিন্ট / মেমো ডাউনলোড করুন (Print Invoice)
          </button>
        </div>
      </div>

      <Notice text={error || message} />

      {/* BEAUTIFUL PRINTABLE INVOICE / CASH MEMO */}
      <div className="invoice-container panel">
        {/* Header with Logo and Brand Details */}
        <div className="invoice-top-bar">
          <div className="invoice-brand-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', width: 68, height: 68 }}>
                <Image
                  src="/images/halal-sheba-logo.png"
                  alt="Halal Sheba"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#073f32', letterSpacing: '0.5px' }}>
                  HALAL SHEBA
                </h2>
                <div style={{ fontSize: 13, color: '#d97706', fontWeight: 700, marginTop: 2 }}>
                  হালাল সেবা — নিরাপদ ও খাঁটি প্রাকৃতিক খাদ্য
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 10, lineHeight: 1.5 }}>
              <div>📍 থানাঘাটা, সাতক্ষীরা সদর, সাতক্ষীরা, বাংলাদেশ</div>
              <div>📞 ০১৩১৩-৯৪৬৪০২ | ✉️ halalsheba25@gmail.com</div>
              <div>🌐 www.halalsheba.com</div>
            </div>
          </div>

          <div className="invoice-meta-right">
            <div className="invoice-memo-badge">INVOICE / ক্যাশ মেমো</div>
            <table className="invoice-info-table">
              <tbody>
                <tr>
                  <th>ইনভয়েস নং:</th>
                  <td><strong>#HS-{orderRef}</strong></td>
                </tr>
                <tr>
                  <th>তারিখ ও সময়:</th>
                  <td>
                    {formatBdDate(o.created_at)}
                  </td>
                </tr>
                <tr>
                  <th>পেমেন্ট মেথড:</th>
                  <td>{o.payment_method === 'bkash' ? 'বিকাশ (Send Money)' : 'ক্যাশ অন ডেলিভারি (COD)'}</td>
                </tr>
                {o.payment_method === 'bkash' && (
                  <>
                    <tr>
                      <th>গ্রাহকের bKash নম্বর:</th>
                      <td>{o.bkash_sender_number || '—'}</td>
                    </tr>
                    <tr>
                      <th>bKash TrxID:</th>
                      <td><strong>{o.bkash_trxid || '—'}</strong></td>
                    </tr>
                  </>
                )}
                <tr>
                  <th>পেমেন্ট স্ট্যাটাস:</th>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 700,
                        background: isPaid ? '#dcfce7' : '#fef3c7',
                        color: isPaid ? '#15803d' : '#b45309',
                      }}
                    >
                      {isPaid ? 'পরিশোধিত (Paid)' : 'বাকি (Unpaid)'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>বর্তমান অবস্থা:</th>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 700,
                        background: st.bg,
                        color: st.color,
                      }}
                    >
                      {st.label}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '2px solid #e2e8f0', margin: '20px 0' }} />

        {/* Customer & Shipping 2-col cards */}
        <div className="invoice-address-grid">
          <div className="invoice-address-box">
            <div className="invoice-section-title">👤 গ্রাহকের তথ্য (Customer Info)</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
            <div style={{ fontSize: 14, color: '#075744', fontWeight: 600, marginTop: 4 }}>
              📞 {c.phone}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }} className="no-print">
              <a
                href={`tel:${c.phone}`}
                className="button secondary"
                style={{ fontSize: 12, padding: '5px 10px', textDecoration: 'none', background: '#eaf6ef', borderColor: '#b6dccb' }}
              >
                📞 কল দিন
              </a>
              <a
                href={`https://wa.me/88${c.phone.replace(/[^0-9]/g, '').replace(/^88/, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${c.name}, হালাল সেবা থেকে আপনার অর্ডার #${orderRef} এর বিষয়ে যোগাযোগ করা হচ্ছে।`)}`}
                target="_blank"
                rel="noreferrer"
                className="button secondary"
                style={{ fontSize: 12, padding: '5px 10px', textDecoration: 'none', color: '#047857', background: '#dcfce7', borderColor: '#86efac' }}
              >
                💬 WhatsApp
              </a>
            </div>
            {c.district && (
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                জেলা: <strong>{c.district}</strong>
              </div>
            )}
          </div>

          <div className="invoice-address-box">
            <div className="invoice-section-title">🚚 ডেলিভারি ঠিকানা (Shipping Address)</div>
            <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, fontWeight: 500 }}>
              {o.address}
            </div>
            {o.courier && (
              <div style={{ fontSize: 13, color: '#075744', marginTop: 6, fontWeight: 600 }}>
                কুরিয়ার: {o.courier} {o.tracking_number ? `(ট্র্যাকিং: ${o.tracking_number})` : ''}
              </div>
            )}
            {o.note && (
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>
                নোট: {o.note}
              </div>
            )}
          </div>
        </div>

        {/* Product Items Table */}
        <div style={{ marginTop: 24 }}>
          <table className="invoice-products-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>#</th>
                <th>পণ্যের নাম ও বিবরণ (Product Details)</th>
                <th style={{ width: 140 }}>ভ্যারিয়েন্ট / সাইজ</th>
                <th style={{ width: 90, textAlign: 'center' }}>পরিমাণ</th>
                <th style={{ width: 110, textAlign: 'right' }}>একক মূল্য</th>
                <th style={{ width: 120, textAlign: 'right' }}>মোট মূল্য</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: Row, idx: number) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                  <td>
                    <strong style={{ color: '#0f172a', fontSize: 14 }}>{item.name}</strong>
                  </td>
                  <td style={{ color: '#475569', fontSize: 13 }}>{item.variant || 'Standard'}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', color: '#334155' }}>{money(item.price)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#075744' }}>
                    {money(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations / Summary */}
        <div className="invoice-calculation-wrap">
          <div className="invoice-notes-box">
            <div style={{ fontWeight: 700, color: '#073f32', marginBottom: 4 }}>
              হালাল সেবা-র সাথে থাকার জন্য ধন্যবাদ!
            </div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
              • পণ্য ডেলিভারি পাওয়ার পর চেক করে মূল্য পরিশোধ করুন।<br />
              • যেকোনো অভিযোগ বা পরামর্শের জন্য আমাদের হটলাইনে যোগাযোগ করুন: <strong>০১৩১৩-৯৪৬৪০২</strong>।
            </div>
          </div>

          <div className="invoice-summary-table-wrap">
            <table className="invoice-summary-table">
              <tbody>
                <tr>
                  <td>সাবটোটাল (Subtotal):</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{money(o.subtotal)}</td>
                </tr>
                <tr>
                  <td>ডেলিভারি চার্জ (Delivery):</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{money(o.delivery_charge)}</td>
                </tr>
                {o.discount > 0 && (
                  <tr>
                    <td>বিশেষ ছাড় (Discount):</td>
                    <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>
                      - {money(o.discount)}
                    </td>
                  </tr>
                )}
                <tr className="invoice-grand-total-row">
                  <td>সর্বমোট প্রদেয় (Total):</td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 19, fontWeight: 800, color: '#073f32' }}>
                      {money(o.total)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature & Seal Footer */}
        <div className="invoice-footer-signatures">
          <div className="invoice-sig-box">
            <div className="sig-line"></div>
            <div>গ্রাহকের স্বাক্ষর (Customer)</div>
          </div>
          <div className="invoice-sig-box">
            <div className="sig-line"></div>
            <div>অনুমোদনকারীর স্বাক্ষর (Halal Sheba)</div>
          </div>
        </div>
      </div>

      {/* FRAUD RISK & FAKE ORDER DETECTION ANALYSIS */}
      {(() => {
        const fraud = data.fraud || {
          risk_score: 0,
          risk_level: 'low',
          reasons: [],
          history: { total_orders: 1, delivered: 0, cancelled: 0 },
        };
        const isHigh = fraud.risk_level === 'high' || fraud.risk_score >= 50;
        const isMed = fraud.risk_level === 'medium' || (fraud.risk_score >= 25 && fraud.risk_score < 50);

        return (
          <div
            className="panel no-print"
            style={{
              marginTop: 24,
              border: isHigh ? '2px solid #ef4444' : isMed ? '2px solid #f59e0b' : '1.5px solid #10b981',
              background: isHigh ? '#fff5f5' : isMed ? '#fffbeb' : '#f0fdf4',
              borderRadius: 10,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>
                  {isHigh ? '🚨' : isMed ? '⚠️' : '🛡️'}
                </span>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 800,
                      color: isHigh ? '#991b1b' : isMed ? '#92400e' : '#166534',
                    }}
                  >
                    {isHigh
                      ? 'ভুয়া অর্ডার ঝুঁকি বিশ্লেষণ: উচ্চ সন্দেহজনক (High Fraud Risk)'
                      : isMed
                      ? 'ভুয়া অর্ডার ঝুঁকি বিশ্লেষণ: মাঝারি (Medium Risk - কল দিয়ে নিশ্চিত করুন)'
                      : 'ভুয়া অর্ডার ঝুঁকি বিশ্লেষণ: নিরাপদ ও জেনুইন গ্রাহক (Safe Order)'}
                  </h3>
                  <div style={{ fontSize: 13, color: '#475569', marginTop: 3 }}>
                    স্বয়ংক্রিয় ফ্রড ডিটেকশন ঝুঁকি স্কোর: <strong style={{ color: isHigh ? '#dc2626' : isMed ? '#b45309' : '#15803d' }}>{fraud.risk_score}%</strong>
                  </div>
                </div>
              </div>

              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontWeight: 800,
                    fontSize: 13,
                    background: isHigh ? '#fee2e2' : isMed ? '#fef3c7' : '#dcfce7',
                    color: isHigh ? '#b91c1c' : isMed ? '#92400e' : '#15803d',
                    border: `1.5px solid ${isHigh ? '#fca5a5' : isMed ? '#fde68a' : '#86efac'}`,
                  }}
                >
                  {isHigh ? '🔴 ভুয়া অর্ডার সন্দেহ' : isMed ? '🟡 ফোন দিয়ে নিশ্চিত করুন' : '🟢 ভেরিফায়েড / নিরাপদ'}
                </span>
              </div>
            </div>

            {fraud.reasons && fraud.reasons.length > 0 && (
              <div style={{ marginTop: 12, padding: '12px 16px', background: '#ffffff', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                  শনাক্তকৃত সম্ভাব্য ঝুঁকির কারণসমূহ (Risk Factors):
                </div>
                <ul style={{ margin: 0, paddingLeft: 22, fontSize: 13, color: isHigh ? '#dc2626' : '#b45309', lineHeight: 1.6 }}>
                  {fraud.reasons.map((r: string, idx: number) => (
                    <li key={idx} style={{ fontWeight: 600 }}>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: 24, marginTop: 14, flexWrap: 'wrap', fontSize: 13, color: '#475569' }}>
              <div>📊 মোট অর্ডার হিস্ট্রি: <strong>{fraud.history?.total_orders || 1} টি</strong></div>
              <div>✅ সফল ডেলিভারি: <strong style={{ color: '#166534' }}>{fraud.history?.delivered || 0} টি</strong></div>
              <div>❌ অতীত বাতিল/রিটার্ন: <strong style={{ color: '#dc2626' }}>{fraud.history?.cancelled || 0} টি</strong></div>
            </div>

            {isHigh && (
              <div style={{ marginTop: 14, padding: '12px 14px', background: '#fee2e2', borderRadius: 8, fontSize: 13, color: '#991b1b', lineHeight: 1.5, border: '1px solid #fca5a5' }}>
                <strong>⚠️ জরুরি মার্চেন্ট সতর্কতা:</strong> এই অর্ডারে পণ্য পাঠানোর পূর্বে অবশ্যই কাস্টমারের নম্বরে (<strong>{c.phone}</strong>) সরাসরি কল দিন অথবা অগ্রিম কুরিয়ার ডেলিভারি চার্জ গ্রহণ করুন। ফোন বন্ধ থাকলে বা ঠিকানা অস্পষ্ট হলে অর্ডার বাতিল (Cancel) করুন, অন্যথায় কুরিয়ার পার্সেল রিটার্ন চার্জ লোকসান হবে।
              </div>
            )}
          </div>
        );
      })()}

      {/* UPDATE ORDER FORM - Only visible on screen */}
      <form
        className="panel no-print"
        style={{ marginTop: 28, borderTop: '3px solid #075744' }}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const f = Object.fromEntries(new FormData(e.currentTarget));
          try {
            await api('admin/orders/' + id, {
              method: 'PUT',
              body: JSON.stringify({
                ...f,
                delivery_cost: Math.round(Number(f.delivery_cost || 0) * 100),
              }),
            });
            setMessage('অর্ডারের তথ্য সফলভাবে আপডেট করা হয়েছে।');
            reload();
          } catch (err) {
            setMessage((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, color: '#073f32' }}>⚙️ অর্ডার স্ট্যাটাস ও তথ্য পরিবর্তন করুন (Update Order)</h2>
          <span className="muted" style={{ fontSize: 13 }}>অর্ডার আইডি: #{orderRef}</span>
        </div>

        <div className="grid">
          <label>
            অর্ডার স্ট্যাটাস (Order Status)
            <select name="status" defaultValue={o.status}>
              {mainStatuses.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            পেমেন্ট অবস্থা (Payment Status)
            <select
              name="payment_status"
              defaultValue={o.payment_status === 'refunded' ? 'paid' : o.payment_status}
            >
              <option value="unpaid">বাকি / ক্যাশ অন ডেলিভারি (Unpaid)</option>
              <option value="paid">পরিশোধিত (Paid — ক্যাশ টাকা পেয়েছি)</option>
            </select>
          </label>

          <label>
            কুরিয়ার সার্ভিস (Courier Name)
            <input
              name="courier"
              placeholder="Steadfast / Pathao / RedX / Sundarban / নিজস্ব ডেলিভারি"
              defaultValue={o.courier ?? ''}
            />
          </label>

          <label>
            কুরিয়ার ট্র্যাকিং কোড (Tracking Number)
            <input
              name="tracking_number"
              placeholder="কুরিয়ার থেকে পাওয়া কনসাইনমেন্ট বা ট্র্যাকিং কোড"
              defaultValue={o.tracking_number ?? ''}
            />
          </label>

          <label>
            প্রকৃত ডেলিভারি খরচ (৳ Actual Delivery Cost)
            <input
              name="delivery_cost"
              type="number"
              min="0"
              step=".01"
              defaultValue={o.delivery_cost ? o.delivery_cost / 100 : 0}
            />
          </label>

          <label>
            পরিবর্তনের কারণ বা নোট (Reason / Note)
            <input
              name="reason"
              placeholder="যেমন: গ্রাহক কনফার্ম করেছেন / ডেলিভারি সম্পন্ন"
              defaultValue="Admin updated order status"
            />
          </label>
        </div>

        <div style={{ marginTop: 20 }}>
          <button
            disabled={busy}
            style={{
              background: '#075744',
              color: '#fff',
              fontWeight: 700,
              padding: '12px 24px',
              fontSize: 15,
            }}
          >
            {busy ? 'সংরক্ষণ হচ্ছে…' : 'পরিবর্তন সংরক্ষণ করুন (Save Changes)'}
          </button>
        </div>
      </form>

      {/* History log */}
      <div className="panel no-print" style={{ marginTop: 20 }}>
        <h2>📜 অর্ডারের হিস্টোরি (Order History)</h2>
        {data.history && data.history.length > 0 ? (
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {data.history.map((h: Row) => (
              <div
                key={h.id}
                style={{
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderLeft: '3px solid #075744',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              >
                <strong style={{ color: '#073f32' }}>{h.action}</strong>
                <span className="muted" style={{ marginLeft: 12 }}>
                  {formatBdDate(h.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">কোনো পূর্বের হিস্টোরি পাওয়া যায়নি।</p>
        )}
      </div>
    </>
  );
}
