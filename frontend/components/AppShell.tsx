'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { accessToken, api, currentUser } from '@/lib/api';

const nav: [string, string, string, string][] = [
  ['সারসংক্ষেপ','/dashboard','ড্যাশবোর্ড','PHOTO_VIEW'],
  ['আর্কাইভ','/projects','প্রকল্পসমূহ','PROJECT_VIEW'],['আর্কাইভ','/events','ইভেন্ট ও কার্যক্রম','EVENT_VIEW'],['আর্কাইভ','/photos','ফটো আর্কাইভ','PHOTO_VIEW'],['আর্কাইভ','/photos/upload','ছবি আপলোড','PHOTO_UPLOAD'],
  ['তৈরি করুন','/presentations','প্রেজেন্টেশন','PRESENTATION_CREATE'],['তৈরি করুন','/reports','প্রতিবেদন','PHOTO_VIEW'],
  ['প্রশাসন','/admin/users','ব্যবহারকারী','USER_VIEW'],['প্রশাসন','/admin/roles','ভূমিকা ও অনুমতি','USER_VIEW'],['প্রশাসন','/admin/templates','টেমপ্লেট','SYSTEM_SETTINGS'],['প্রশাসন','/admin/storage','স্টোরেজ','SYSTEM_SETTINGS'],['প্রশাসন','/admin/settings','সেটিংস','SYSTEM_SETTINGS'],['প্রশাসন','/admin/audit-logs','অডিট লগ','AUDIT_VIEW'],
];

export default function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const path = usePathname(); const router = useRouter(); const [ready, setReady] = useState(false); const [open,setOpen]=useState(false);
  const user = ready ? currentUser() : null;
  useEffect(() => { if (!accessToken()) router.replace('/login'); else setReady(true); }, [router]);
  async function logout() { try { await api('/auth/logout', { method: 'POST' }); } finally { sessionStorage.removeItem('nha_access'); router.replace('/login'); } }
  if (!ready) return <div className="app-loading"><span className="spinner"/><span>নিরাপদ কর্মক্ষেত্র খোলা হচ্ছে…</span></div>;
  let section = '';
  const visible = nav.filter(([, , , permission]) => !user || user.permissions.includes(permission));
  return <div className="shell">
    {open ? <button className="sidebar-scrim" aria-label="নেভিগেশন বন্ধ করুন" onClick={()=>setOpen(false)}/> : null}
    <aside className={`sidebar ${open?'sidebar-open':''}`}><div className="brand"><div className="seal">NHA</div><div><strong>এনএইচএ ডিপ্যামস</strong><small>ডিজিটাল ফটো আর্কাইভ</small></div></div><nav className="nav" aria-label="প্রধান নেভিগেশন">{visible.map(([group, href, label]) => { const heading = group !== section; section = group; const active=path===href||path.startsWith(`${href}/`); return <div key={href}>{heading ? <div className="nav-section">{group}</div> : null}<Link className={active ? 'active' : ''} href={href} onClick={()=>setOpen(false)}>{label}</Link></div>; })}</nav><div className="sidebar-foot">পর্যায় ১ · অভ্যন্তরীণ ব্যবহার</div></aside>
    <main className="main"><header className="topbar"><div className="topbar-left"><button className="menu-btn" aria-label="নেভিগেশন খুলুন" onClick={()=>setOpen(true)}>☰</button><div><div className="topbar-title">{title}</div><div className="breadcrumb">এনএইচএ / {title}</div></div></div><div className="user-pill"><div className="avatar">{user?.email?.slice(0,2).toUpperCase()??'NA'}</div><span>{user?.email??'এনএইচএ ব্যবহারকারী'}</span><Link className="btn btn-ghost" href="/">পাবলিক সাইট</Link><button className="btn btn-ghost" onClick={logout}>লগআউট</button></div></header>{children}</main>
  </div>;
}
