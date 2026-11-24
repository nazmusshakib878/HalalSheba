"use client";
import { useState } from 'react';
import { api } from '@/lib/api';
import { useData, Notice, Table, Loading, money, downloadCsv } from './shared';
import type { Row } from './Products';
import { notifyCatalogUpdated } from '@/context/CatalogContext';

type Field = { key: string; label: string; type?: string; options?: string[] };

async function compressImage(file: File): Promise<File | Blob> {
  if (file.size <= 1024 * 1024) return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1600;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
              resolve(compressed);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

const configurations: Record<string, { title: string; endpoint: string; fields: Field[]; columns: string[]; create: boolean }> = {
  categories: {
    title: 'Categories',
    endpoint: 'manage/categories',
    create: true,
    columns: ['name', 'slug', 'active', 'sort_order'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'slug', label: 'URL slug' },
      { key: 'image', label: 'Image URL', type: 'image' },
      { key: 'sort_order', label: 'Sort order', type: 'number' },
      { key: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  brands: {
    title: 'Brands',
    endpoint: 'manage/brands',
    create: true,
    columns: ['name', 'slug', 'active'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'slug', label: 'URL slug' },
      { key: 'image', label: 'Image URL', type: 'image' },
      { key: 'sort_order', label: 'Sort order', type: 'number' },
      { key: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  customers: {
    title: 'Customers',
    endpoint: 'manage/customers',
    create: false,
    columns: ['name', 'phone', 'email', 'spending', 'vip', 'status'],
    fields: [
      { key: 'notes', label: 'Private notes', type: 'textarea' },
      { key: 'vip', label: 'VIP customer', type: 'checkbox' },
      { key: 'status', label: 'Status', options: ['active', 'blocked'] },
    ],
  },
  coupons: {
    title: 'Coupons',
    endpoint: 'manage/coupons',
    create: true,
    columns: ['code', 'type', 'value', 'used', 'active', 'expires_at'],
    fields: [
      { key: 'code', label: 'Coupon code (uppercase)' },
      { key: 'type', label: 'Type', options: ['percent', 'fixed', 'free_delivery'] },
      { key: 'value', label: 'Value (% or paisa for fixed)', type: 'number' },
      { key: 'minimum', label: 'Minimum order (paisa)', type: 'number' },
      { key: 'usage_limit', label: 'Usage limit (optional)', type: 'number' },
      { key: 'expires_at', label: 'Expiry (optional)', type: 'datetime-local' },
      { key: 'product_id', label: 'Product ID (optional)', type: 'number' },
      { key: 'category_id', label: 'Category ID (optional)', type: 'number' },
      { key: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  reviews: {
    title: 'Reviews',
    endpoint: 'manage/reviews',
    create: false,
    columns: ['author', 'rating', 'comment', 'status', 'created_at'],
    fields: [
      { key: 'status', label: 'Moderation status', options: ['pending', 'approved', 'rejected'] },
      { key: 'reply', label: 'Public reply', type: 'textarea' },
    ],
  },
  content: {
    title: 'Website content',
    endpoint: 'manage/content_pages',
    create: true,
    columns: ['title', 'slug', 'active'],
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'slug', label: 'URL slug (about-us, contact-us, privacy-policy, faq…)' },
      { key: 'body', label: 'Page text', type: 'textarea' },
      { key: 'active', label: 'Published', type: 'checkbox' },
    ],
  },
  staff: {
    title: 'Staff accounts',
    endpoint: 'staff',
    create: true,
    columns: ['name', 'email', 'role', 'active'],
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'role', label: 'Role', options: ['admin', 'super_admin'] },
      { key: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  audit: {
    title: 'Activity log',
    endpoint: 'audit',
    create: false,
    columns: ['created_at', 'user_id', 'action', 'entity', 'entity_id', 'changes'],
    fields: [],
  },
};

export function Management({ section }: { section: string }) {
  const config = configurations[section];
  const { data, error, reload } = useData<Row[]>('admin/' + config.endpoint);
  const [q, setQ] = useState('');
  const [form, setForm] = useState<Row | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const edit = (r?: Row) =>
    setForm(
      r
        ? { ...r }
        : Object.fromEntries(
            config.fields.map((f) => [
              f.key,
              f.type === 'checkbox'
                ? true
                : f.options?.[0] ?? (['sort_order', 'value', 'minimum'].includes(f.key) ? 0 : ''),
            ])
          )
    );

  const rows = data?.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <h1>{config.title}</h1>
      <p className="muted">Manage {config.title.toLowerCase()} securely.</p>
      <Notice text={error || message} />
      <div className="toolbar">
        <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="row">
          <button
            className="secondary"
            disabled={!rows?.length}
            onClick={() =>
              downloadCsv(
                (rows || []).map((r) => Object.fromEntries(config.columns.map((k) => [k, r[k]]))),
                section + '.csv'
              )
            }
          >
            Export CSV
          </button>
          {config.create && <button onClick={() => edit()}>+ Add new</button>}
        </div>
      </div>

      {form && (
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const body = Object.fromEntries(
                config.fields.map((f) => {
                  const val = form[f.key];
                  if (f.type === 'checkbox') return [f.key, Boolean(val)];
                  if (f.type === 'number') {
                    if (val === '' || val == null || isNaN(Number(val))) return [f.key, null];
                    return [f.key, Number(val)];
                  }
                  return [f.key, val || null];
                })
              );
              await api('admin/' + config.endpoint + (form.id ? '/' + form.id : ''), {
                method: form.id ? 'PUT' : 'POST',
                body: JSON.stringify(body),
              });
              notifyCatalogUpdated();
              setForm(null);
              setMessage('Saved successfully.');
              reload();
            } catch (err) {
              setMessage((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>{form.id ? 'Edit record' : 'Create record'}</h2>
          <div className="grid">
            {config.fields.map((f) => (
              <label key={f.key} className={f.type === 'textarea' ? 'span-2' : ''}>
                {f.label}
                {f.options ? (
                  <select value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                    {f.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea value={form[f.key] ?? ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                ) : f.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={!!form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                  />
                ) : (
                  <input
                    type={f.type === 'image' ? 'text' : f.type || 'text'}
                    value={form[f.key] ?? ''}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                )}
                {f.type === 'image' && (
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={async (e) => {
                        if (!e.target.files?.[0]) return;
                        const originalFile = e.target.files[0];
                        setBusy(true);
                        setMessage('Uploading image...');
                        try {
                          const fileToUpload = await compressImage(originalFile);
                          const b = new FormData();
                          b.append('image', fileToUpload);
                          const r = await api<{ url: string }>('admin/images', { method: 'POST', body: b });
                          setForm((prev) => (prev ? { ...prev, [f.key]: r.url } : null));
                          setMessage('Image uploaded successfully.');
                        } catch (err) {
                          setMessage('Upload failed: ' + (err as Error).message);
                        } finally {
                          setBusy(false);
                        }
                      }}
                    />
                    {form[f.key] && (
                      <div style={{ marginTop: 8 }}>
                        <img
                          src={form[f.key]}
                          alt="Preview"
                          width={90}
                          height={90}
                          style={{ borderRadius: 6, objectFit: 'cover', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </label>
            ))}
          </div>

          {section === 'customers' && form.orders && (
            <div>
              <h2 style={{ marginTop: 20 }}>Order history</h2>
              {form.orders.map((o: Row) => (
                <p key={o.id}>
                  <a href={'/admin/orders/' + o.id}>{o.reference.slice(0, 8)}</a> · {o.status} · {money(o.total)}
                </p>
              ))}
              <p>{form.orders.length > 1 ? 'Repeat customer' : 'First-time customer'}</p>
            </div>
          )}

          <div className="row" style={{ marginTop: 20 }}>
            <button disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button>
            <button type="button" className="secondary" onClick={() => setForm(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {!data ? (
        <Loading />
      ) : (
        <Table
          headers={[
            ...config.columns.map((c) => c.replaceAll('_', ' ')),
            ...(config.fields.length ? ['Actions'] : []),
          ]}
          empty={!rows?.length}
        >
          {rows?.map((r) => (
            <tr key={r.id}>
              {config.columns.map((k) => (
                <td key={k} title={String(r[k] ?? '')}>
                  {k === 'spending'
                    ? money(r[k])
                    : ['active', 'vip'].includes(k)
                    ? r[k]
                      ? 'Yes'
                      : 'No'
                    : String(r[k] ?? '—')}
                </td>
              ))}
              {config.fields.length > 0 && (
                <td>
                  <button className="secondary" onClick={() => edit(r)}>
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
