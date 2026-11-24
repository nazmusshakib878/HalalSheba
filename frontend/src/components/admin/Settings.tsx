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
  { key: 'notifications', label: '🔔 Order alerts & notifications', title: 'Order alerts & notifications (এসএমএস ও ইমেইল রিমাইন্ডার)' },
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
      const res = await api<{ message: string; results: { email: boolean; sms: boolean; telegram: boolean } }>(
        'admin/settings/test-notification',
        {
          method: 'POST',
          body: JSON.stringify(data.notifications || {}),
        }
      );
      setMessage(res.message || 'টেস্ট নোটিফিকেশন সফলভাবে পাঠানো হয়েছে।');
    } catch (err) {
      setMessage('টেস্ট নোটিফিকেশন ব্যর্থ: ' + (err as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
      <h1>Store settings</h1>
      <p className="muted">
        Configure delivery charges, store contact info, visual branding, and instant SMS / Email order alerts.
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
              d.sms_enabled = formData.get('sms_enabled') === 'on';
              d.telegram_enabled = formData.get('telegram_enabled') === 'on';
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
              ওয়েবসাইটে কোনো কাস্টমার নতুন অর্ডার প্লেস করলেই সাথে সাথে আপনার মোবাইলে এসএমএস, ইমেইলে নোটিফিকেশন অথবা টেলিগ্রামে সাউন্ড রিমাইন্ডার পাবেন।
            </p>

            {/* Email Notification Section */}
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <input
                  type="checkbox"
                  id="email_enabled"
                  name="email_enabled"
                  defaultChecked={data.notifications?.email_enabled ?? true}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="email_enabled" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                  📧 ইমেইল নোটিফিকেশন চালু করুন (Email Order Alerts)
                </label>
              </div>
              <label>
                অ্যাডমিন ইমেইল এড্রেস (যে ইমেইলে নতুন অর্ডারের নোটিফিকেশন যাবে)
                <input
                  name="admin_email"
                  type="email"
                  placeholder="halalsheba878@gmail.com"
                  defaultValue={data.notifications?.admin_email ?? data.contact?.email ?? 'halalsheba878@gmail.com'}
                />
              </label>
            </div>

            {/* SMS Notification Section */}
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <input
                  type="checkbox"
                  id="sms_enabled"
                  name="sms_enabled"
                  defaultChecked={data.notifications?.sms_enabled ?? false}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="sms_enabled" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                  📱 মোবাইল এসএমএস নোটিফিকেশন (Mobile SMS Alerts)
                </label>
              </div>

              <div className="grid">
                <label>
                  আপনার মোবাইল নম্বর (যে নম্বরে SMS রিমাইন্ডার আসবে)
                  <input
                    name="admin_phone"
                    placeholder="01716333670"
                    defaultValue={data.notifications?.admin_phone ?? data.contact?.phone ?? '01716333670'}
                  />
                </label>

                <label>
                  এসএমএস প্রোভাইডার (SMS Gateway)
                  <select name="sms_provider" defaultValue={data.notifications?.sms_provider ?? 'greenweb'}>
                    <option value="greenweb">Greenweb BD (সবচেয়ে জনপ্রিয়)</option>
                    <option value="bulksmsbd">BulkSMSBD</option>
                    <option value="elitbuzz">Elitbuzz</option>
                    <option value="mimsms">MimSMS</option>
                    <option value="custom">কাস্টম Webhook URL</option>
                  </select>
                </label>

                <label className="span-2">
                  এসএমএস গেটওয়ে API Key / Token
                  <input
                    name="sms_api_key"
                    type="password"
                    placeholder="আপনার SMS গেটওয়ে ড্যাশবোর্ড থেকে পাওয়া API Key / Token"
                    defaultValue={data.notifications?.sms_api_key ?? ''}
                  />
                </label>

                <label className="span-2">
                  সেন্ডার আইডি / মাস্কিং নাম (ঐচ্ছিক)
                  <input
                    name="sms_sender_id"
                    placeholder="Halal Sheba (বা নন-মাস্কিং খালি রাখুন)"
                    defaultValue={data.notifications?.sms_sender_id ?? ''}
                  />
                </label>
              </div>
            </div>

            {/* Telegram Instant Alert Section (Free & Popular) */}
            <div style={{ background: '#ecfdf5', padding: 18, borderRadius: 10, border: '1px solid #a7f3d0', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <input
                  type="checkbox"
                  id="telegram_enabled"
                  name="telegram_enabled"
                  defaultChecked={data.notifications?.telegram_enabled ?? false}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <label htmlFor="telegram_enabled" style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#065f46', cursor: 'pointer' }}>
                  🚀 টেলিগ্রাম ইনস্ট্যান্ট পুশ অ্যালার্ট (১০০% ফ্রি ও আনলিমিটেড সাউন্ড রিমাইন্ডার)
                </label>
              </div>
              <p style={{ fontSize: 12, color: '#047857', margin: '0 0 14px' }}>
                💡 <strong>টিপস:</strong> এসএমএস-এ খরচ আছে, কিন্তু টেলিগ্রাম বোটে প্রতিটা অর্ডারের নোটিফিকেশন আপনার ফোনে সাথে সাথে ফ্রি সাউন্ড অ্যালার্ট দিয়ে চলে আসবে।
              </p>

              <div className="grid">
                <label>
                  টেলিগ্রাম বট টোকেন (Telegram Bot Token)
                  <input
                    name="telegram_bot_token"
                    placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWxYZ"
                    defaultValue={data.notifications?.telegram_bot_token ?? ''}
                  />
                </label>
                <label>
                  আপনার চ্যাট আইডি (Your Chat ID)
                  <input
                    name="telegram_chat_id"
                    placeholder="123456789"
                    defaultValue={data.notifications?.telegram_chat_id ?? ''}
                  />
                </label>
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
              {testing ? 'টেস্ট পাঠানো হচ্ছে...' : '🧪 টেস্ট অ্যালার্ট পাঠান (Send test alert)'}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
