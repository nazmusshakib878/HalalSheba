"use client";
import { useParams } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { Dashboard } from '@/components/admin/Dashboard';
import { Products, ProductEditor } from '@/components/admin/Products';
import { Inventory } from '@/components/admin/Inventory';
import { Orders, OrderDetail } from '@/components/admin/Orders';
import { Management } from '@/components/admin/Management';
import { Settings } from '@/components/admin/Settings';
import { Account } from '@/components/admin/Account';

export default function AdminPage() {
  const { segments = [] } = useParams<{ segments: string[] }>();
  const [section, id] = segments;
  let content;

  if (!section || section === 'analytics') content = <Dashboard analytics={section === 'analytics'} />;
  else if (section === 'products') content = id ? <ProductEditor key={id} id={id === 'add' ? undefined : id} /> : <Products />;
  else if (section === 'inventory') content = <Inventory />;
  else if (section === 'orders') content = id ? <OrderDetail id={id} /> : <Orders />;
  else if (section === 'settings') content = <Settings />;
  else if (section === 'account') content = <Account />;
  else if (['categories', 'brands', 'customers', 'coupons', 'audit', 'reviews'].includes(section)) {
    content = <Management key={section} section={section} />;
  } else {
    content = <h1>Page not found</h1>;
  }

  return <AdminShell>{content}</AdminShell>;
}
