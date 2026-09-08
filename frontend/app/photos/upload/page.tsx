'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';
import type { EventRecord, Project } from '@/types';

type Batch = {
  summary: { total: number; successful: number; duplicates: number; failed: number };
  results: { file: string; status: string; message?: string }[];
};

function UploadForm() {
  const params = useSearchParams();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<Batch | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api<Project[]>('/projects'), api<EventRecord[]>('/events')])
      .then(([projectList, eventList]) => { setProjects(projectList); setEvents(eventList); })
      .catch(() => undefined);
  }, []);

  function accept(list: FileList | File[]) {
    const incoming = Array.from(list);
    const accepted = incoming.filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)).slice(0, 50);
    setFiles(accepted);
    setResult(null);
    setError(accepted.length !== incoming.length ? 'শুধু JPEG, PNG ও WebP ছবি গ্রহণযোগ্য; অসমর্থিত ফাইল বাদ দেওয়া হয়েছে।' : '');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!files.length) return;
    setBusy(true);
    setError('');
    const values = new FormData(event.currentTarget);
    const body = new FormData();
    files.forEach((file) => body.append('files', file));
    body.append('metadata', JSON.stringify({
      title: values.get('title'), captureDate: values.get('captureDate'),
      projectId: values.get('projectId') || undefined, eventId: values.get('eventId') || undefined,
      location: values.get('location') || undefined, department: values.get('department') || undefined,
      photographer: values.get('photographer') || undefined, description: values.get('description') || undefined,
      remarks: values.get('remarks') || undefined,
      tags: String(values.get('tags') || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      retainOriginal: values.get('retainOriginal') === 'on',
    }));
    try {
      setResult(await api<Batch>('/photos/batch-upload', { method: 'POST', body }));
      setFiles([]);
      if (input.current) input.current.value = '';
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ছবি আপলোড করা যায়নি');
    } finally { setBusy(false); }
  }

  return <AppShell title="ছবি আপলোড"><div className="content content-narrow">
    <div className="pagehead"><div><div className="eyebrow">নিরাপদ সংযোজন</div><h1>আর্কাইভে ছবি আপলোড</h1><p>ফাইল যাচাই, সদৃশতা পরীক্ষা ও অপ্টিমাইজ করে অনুমোদনের জন্য পাঠানো হবে।</p></div><Link className="btn btn-secondary" href="/photos">আর্কাইভে ফিরুন</Link></div>
    <form onSubmit={submit}>
      <div className={`upload-zone ${dragging ? 'dragging' : ''}`} role="button" tabIndex={0} onClick={() => input.current?.click()} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') input.current?.click(); }} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); accept(event.dataTransfer.files); }}>
        <input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => accept(event.target.files ?? [])}/>
        <div className="upload-icon">⇧</div><strong>{files.length ? `${files.length.toLocaleString('bn-BD')}টি ছবি প্রস্তুত` : 'ছবি নির্বাচন করুন অথবা এখানে টেনে আনুন'}</strong><p>JPEG, PNG বা WebP · প্রতিটি সর্বোচ্চ ১৫ মেগাবাইট · সর্বোচ্চ ৫০টি ফাইল</p>
      </div>
      {files.length ? <div className="file-strip">{files.slice(0, 6).map((file) => <span key={`${file.name}-${file.size}`}>{file.name}</span>)}{files.length > 6 ? <span>আরও {files.length - 6}টি</span> : null}<button type="button" className="text-button" onClick={() => setFiles([])}>মুছুন</button></div> : null}
      <div className="card section form-card upload-metadata"><div className="section-heading"><div><h3>সব ছবির সাধারণ তথ্য</h3><p>নির্বাচিত প্রতিটি ছবিতে প্রযোজ্য হবে; পরে আলাদা করে সম্পাদনা করা যাবে।</p></div><span className="required-note">* আবশ্যক</span></div>
        <div className="form-grid"><div className="field"><label htmlFor="title">শিরোনাম *</label><input className="input" id="title" name="title" required maxLength={200} placeholder="প্রকল্প পরিদর্শন — উত্তর ব্লক"/></div><div className="field"><label htmlFor="captureDate">ছবি ধারণের তারিখ *</label><input className="input" id="captureDate" name="captureDate" type="date" required/></div><div className="field"><label htmlFor="projectId">প্রকল্প</label><select className="select" id="projectId" name="projectId" defaultValue={params.get('projectId') ?? ''}><option value="">সাধারণ আর্কাইভ</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}</select></div><div className="field"><label htmlFor="eventId">কার্যক্রম</label><select className="select" id="eventId" name="eventId" defaultValue={params.get('eventId') ?? ''}><option value="">কোনো কার্যক্রম নয়</option>{events.map((item) => <option key={item.id} value={item.id}>{item.eventName}</option>)}</select></div><div className="field"><label htmlFor="location">অবস্থান</label><input className="input" id="location" name="location"/></div><div className="field"><label htmlFor="department">বিভাগ</label><input className="input" id="department" name="department"/></div><div className="field"><label htmlFor="photographer">আলোকচিত্রী</label><input className="input" id="photographer" name="photographer"/></div><div className="field"><label htmlFor="tags">ট্যাগ</label><input className="input" id="tags" name="tags" placeholder="পরিদর্শন, মিরপুর, অগ্রগতি"/></div><div className="field span-two"><label htmlFor="description">বিবরণ</label><textarea className="textarea" id="description" name="description"/></div><div className="field span-two"><label htmlFor="remarks">অভ্যন্তরীণ মন্তব্য</label><textarea className="textarea textarea-small" id="remarks" name="remarks"/></div><label className="check-row span-two"><input type="checkbox" name="retainOriginal"/><span><strong>মূল ফাইল সংরক্ষণ করুন</strong><small>শুধু অনুমোদিত সংরক্ষণ ক্ষেত্রে; অপ্টিমাইজ করা ছবিই ডিফল্ট।</small></span></label></div>
        {error ? <p className="error" role="alert">{error}</p> : null}<div className="form-actions"><Link className="btn btn-secondary" href="/photos">বাতিল</Link><button className="btn btn-primary" disabled={busy || !files.length}>{busy ? 'প্রক্রিয়া চলছে…' : `${files.length ? files.length.toLocaleString('bn-BD') : ''}টি ছবি আপলোড করুন`}</button></div>
      </div>
    </form>
    {result ? <div className="card section result-card"><h3>আপলোডের ফলাফল</h3><div className="result-summary"><div><strong>{result.summary.successful}</strong><span>সফল</span></div><div><strong>{result.summary.duplicates}</strong><span>সদৃশ</span></div><div><strong>{result.summary.failed}</strong><span>ব্যর্থ</span></div></div><div className="table-scroll"><table className="table"><tbody>{result.results.map((item, index) => <tr key={`${item.file}-${index}`}><td><strong>{item.file}</strong></td><td><span className={`status status-${item.status}`}>{item.status === 'success' ? 'সফল' : item.status === 'duplicate' ? 'সদৃশ' : 'ব্যর্থ'}</span></td><td>{item.message ?? 'সফলভাবে প্রক্রিয়াকরণ হয়েছে'}</td></tr>)}</tbody></table></div></div> : null}
  </div></AppShell>;
}

export default function UploadPage() {
  return <Suspense fallback={<div className="app-loading"><span className="spinner"/>আপলোড ব্যবস্থা লোড হচ্ছে…</div>}><UploadForm/></Suspense>;
}
