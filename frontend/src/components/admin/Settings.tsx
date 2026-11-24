"use client";
import { useState } from 'react';
import { api } from '@/lib/api';
import { useData, Notice, Loading } from './shared';
import type { Row } from './Products';
import { notifyCatalogUpdated } from '@/context/CatalogContext';

const tabs = [
  { key: 'delivery', label: '🚚 Delivery fees', title: 'Delivery fees (৳)' },
  { key: 'contact', label: '📞 Contact info', title: 'Contact information' },
  { key: 'appearance', label: '🎨 Website appearance', title: 'Website appearance' },
  { key: 'notifications', label: '🔔 Order email alerts', title: 'Order email alerts (নতুন অর্ডারের ইমেইল নোটিফিকেশন)' },
];

export function Settings() {
  const { data, error } = useData<Row>('admin/settings');
  const [tab, setTab] = useState('notifications');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);

  if (!data) return <><Notice text={error} error /><Loading /></>;

  const currentTabInfo = tabs.find((t) => t.key === tab) || tabs[0];

  const handleTestAlert = async (e: React.MouseEvent) => {
    e.preventDefault();
    setTesting(true);
    setMessage('');
    try {
      const res = await api<{ message: string; success?: boolean; results: { email: boolean; error?: string } }>(
        'admin/settings/test-notification',
        {
          method: 'POST',
          body: JSON.stringify(data.notifications || {}),
        }
      );
      setMessage(res.message || 'টেস্ট ইমেইল সম্পন্ন হয়েছে।');
    } catch (err) {
      setMessage('টেস্ট ইমেইল ব্যর্থ: ' + (err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <h1>Store settings</h1>
      <p className="muted">
        Configure delivery charges, store contact info, visual branding, and instant email order alerts.
      </p>
      <Notice text={message || error} />

      <div className="toolbar" style={{ marginTop: 16 }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={tab === t.key ? '' : 'secondary'}
              style={{ fontWeight: tab === t.key ? 700 : 500 }}
              onClick={() => {
                setTab(t.key);
                setMessage('');
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <form
        key={tab}
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const formData = new FormData(e.currentTarget);
            const d: Row = Object.fromEntries(formData);

            if (tab === 'delivery') {
              for (const key of ['dhaka', 'outside', 'free_above']) {
                d[key] = Math.round(Number(d[key] || 0) * 100);
              }
              d.districts = Object.fromEntries(
                String(d.districts_text || '')
                  .split('\n')
                  .filter(Boolean)
                  .map((line) => {
                    const [name, fee] = line.split('=');
                    return [name.trim(), Math.round(Number(fee) * 100)];
                  })
              );
              delete d.districts_text;
            }

            if (tab === 'appearance') {
              for (const key of ['sections', 'hidden_sections']) {
                d[key] = String(d[key] || '')
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
              }
            }

            if (tab === 'notifications') {
              d.email_enabled = formData.get('email_enabled') === 'on';
            }

            const saved = await api('admin/settings/' + tab, {
              method: 'PUT',
              body: JSON.stringify(d),
            });
            data[tab] = saved;
            notifyCatalogUpdated();
            setMessage('সেটিংস সফলভাবে সংরক্ষিত হয়েছে (Settings saved successfully).');
          } catch (err) {
            setMessage((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2>{currentTabInfo.title}</h2>

        {/* 1. NOTIFICATIONS TAB */}
        {tab === 'notifications' && (
          <div>
            <p className="muted" style={{ marginBottom: 20 }}>
              ওয়েবসাইটে কোনো কাস্টমার নতুন অর্ডার করলেই সাথে সাথে আপনার জিমেইলে অর্ডার ও কাস্টমারের সম্পূর্ণ তথ্যসহ ফ্রি নোটিফিকেশন চলে আসবে।
            </p>

            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <input
                  type="checkbox"
                  id="email_enabled"
                  name="email_enabled"
                  defaultChecked={data.notifications?.email_enabled ?? true}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="email_enabled" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                  📧 নতুন অর্ডার আসলে ইমেইল অ্যালার্ট পাঠান (Enable Email Alerts)
                </label>
              </div>

              <div className="grid">
                <label className="span-2">
                  অ্যাডমিন ইমেইল এড্রেস (যে ইমেইলে অর্ডারের নোটিফিকেশন আসবে)
                  <input
                    name="admin_email"
                    type="email"
                    placeholder="n.shakib2027@gmail.com"
                    defaultValue={data.notifications?.admin_email ?? 'n.shakib2027@gmail.com'}
                  />
                </label>

                <label>
                  প্রেরক জিমেইল (Sender Gmail)
                  <input
                    name="smtp_user"
                    type="email"
                    placeholder="n.shakib2027@gmail.com"
                    defaultValue={data.notifications?.smtp_user ?? 'n.shakib2027@gmail.com'}
                  />
                </label>

                <label>
                  গুগল অ্যাপ পাসওয়ার্ড (Google 16-character App Password)
                  <input
                    name="smtp_pass"
                    type="password"
                    placeholder="১৬ অক্ষরের পাসওয়ার্ড (যেমন: abcd efgh ijkl mnop)"
                    defaultValue={data.notifications?.smtp_pass ?? ''}
                  />
                </label>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 14, marginTop: 16, fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
                <strong>💡 ১০০% ফ্রিতে ইমেইল চালু করার সহজ ৩টি ধাপ:</strong>
                <ol style={{ margin: '6px 0 0 18px', padding: 0 }}>
                  <li>আপনার ব্রাউজারে এই লিংকে যান: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#15803d', fontWeight: 'bold', textDecoration: 'underline' }}>myaccount.google.com/apppasswords</a></li>
                  <li>অ্যাপের নাম লিখুন <strong>Halal Sheba</strong> এবং <strong>Create / Generate</strong> বাটনে ক্লিক করুন।</li>
                  <li>গুগল যে ১৬ অক্ষরের একটি কোড দিবে, সেটি কপি করে উপরের <strong>Google App Password</strong> বক্সে পেস্ট করে নিচে <strong>সেটিংস সংরক্ষণ করুন</strong>।</li>
                </ol>
                <div style={{ marginTop: 6, fontWeight: 500 }}>
                  ✅ ব্যাস! এরপর থেকে যে কেউ অর্ডার করলেই আপনার ফোনে <strong>n.shakib2027@gmail.com</strong> এ সরাসরি রিমাইন্ডার ইমেইল চলে আসবে।
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. DELIVERY TAB */}
        {tab === 'delivery' && (
          <div className="grid">
            <label>
              ঢাকার ভেতরে ডেলিভারি চার্জ (৳)
              <input
                name="dhaka"
                type="number"
                min="0"
                step="1"
                defaultValue={(data.delivery?.dhaka ?? 6000) / 100}
              />
            </label>
            <label>
              ঢাকার বাইরে ডেলিভারি চার্জ (৳)
              <input
                name="outside"
                type="number"
                min="0"
                step="1"
                defaultValue={(data.delivery?.outside ?? 12000) / 100}
              />
            </label>
            <label>
              ফ্রি ডেলিভারি ন্যূনতম অর্ডারের পরিমাণ (৳) — ঐচ্ছিক
              <input
                name="free_above"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                defaultValue={(data.delivery?.free_above ?? 0) / 100}
              />
            </label>
            <label className="span-2">
              নির্দিষ্ট জেলার জন্য চার্জ (District=Fee in taka — প্রতি লাইনে একটি করে):
              <textarea
                name="districts_text"
                rows={4}
                defaultValue={Object.entries(data.delivery?.districts || {})
                  .map(([k, v]) => k + '=' + Number(v) / 100)
                  .join('\n')}
              />
            </label>
          </div>
        )}

        {/* 3. CONTACT TAB */}
        {tab === 'contact' && (
          <div className="grid">
            {['phone', 'whatsapp', 'email', 'address', 'facebook', 'instagram'].map((key) => (
              <label key={key} className={key === 'address' ? 'span-2' : ''}>
                {key.replaceAll('_', ' ').toUpperCase()}
                <input
                  name={key}
                  type="text"
                  defaultValue={data.contact?.[key] ?? ''}
                />
              </label>
            ))}
          </div>
        )}

        {/* 4. APPEARANCE TAB */}
        {tab === 'appearance' && (
          <div className="grid">
            <label className="span-2">
              টপবার অ্যানাউন্সমেন্ট টেক্সট (Top announcement bar)
              <input
                name="announcement"
                defaultValue={data.appearance?.announcement ?? 'অর্গানিক ও স্বাস্থ্যকর পণ্য — সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি!'}
              />
            </label>
            <label>
              লোগো ইমেজ লিঙ্ক (Logo URL)
              <input name="logo" defaultValue={data.appearance?.logo ?? ''} />
            </label>
            <label>
              হেডার কালার (Primary Brand Color)
              <input name="primary" type="color" defaultValue={data.appearance?.primary ?? '#075744'} />
            </label>
            <label className="span-2">
              SEO Title (ওয়েবসাইটের মেটা টাইটেল)
              <input name="seo_title" defaultValue={data.appearance?.seo_title ?? 'হালাল সেবা — ১০০% খাঁটি ও নিরাপদ খাবারের বিশ্বস্ত ঠিকানা'} />
            </label>
            <label className="span-2">
              SEO Description (সার্চ ইঞ্জিন বিবরণ)
              <textarea name="seo_description" defaultValue={data.appearance?.seo_description ?? ''} />
            </label>
          </div>
        )}

        <div className="row" style={{ marginTop: 24, gap: 12 }}>
          <button disabled={busy} style={{ background: '#075744', color: '#fff', fontWeight: 700, padding: '10px 24px' }}>
            {busy ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন (Save settings)'}
          </button>

          {tab === 'notifications' && (
            <button
              type="button"
              className="secondary"
              disabled={testing}
              onClick={handleTestAlert}
              style={{ fontWeight: 600, borderColor: '#075744', color: '#075744' }}
            >
              {testing ? 'টেস্ট ইমেইল পাঠানো হচ্ছে...' : '🧪 টেস্ট ইমেইল পাঠান (Send test email)'}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
