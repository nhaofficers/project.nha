'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import AppShell from './AppShell';
import { EmptyState, ErrorState, LoadingState } from './PageState';
import StatusBadge from './StatusBadge';
import { api, formatDate } from '@/lib/api';

type Props={title:string;description:string;endpoint:string;nameKey:string;columns:[string,string][];createHref?:string;detailBase?:string};
export default function ResourcePage({title,description,endpoint,nameKey,columns,createHref,detailBase}:Props){
  const [items,setItems]=useState<Record<string,unknown>[]>([]); const [error,setError]=useState(''); const [loading,setLoading]=useState(true); const [query,setQuery]=useState('');
  const load=useCallback(()=>{setLoading(true);setError('');api<Record<string,unknown>[]>(endpoint).then(setItems).catch((e:Error)=>setError(e.message)).finally(()=>setLoading(false));},[endpoint]);
  useEffect(load,[load]);
  const visible=items.filter(item=>Object.values(item).some(value=>typeof value==='string'&&value.toLowerCase().includes(query.toLowerCase())));
  const display=(key:string,value:unknown)=>{if(key.toLowerCase().includes('date')||key.endsWith('At'))return formatDate(String(value));if(key==='status')return <StatusBadge value={String(value)}/>;if(typeof value==='object'&&value!==null)return String((value as {name?:string}).name??'—');return String(value??'—')};
  return <AppShell title={title}><div className="content"><div className="pagehead"><div><div className="eyebrow">প্রাতিষ্ঠানিক আর্কাইভ</div><h1>{title}</h1><p>{description}</p></div>{createHref?<Link className="btn btn-primary" href={createHref}>+ নতুন রেকর্ড</Link>:null}</div>
    <div className="toolbar"><label className="search-field"><span className="sr-only">অনুসন্ধান</span><input className="input" value={query} onChange={e=>setQuery(e.target.value)} placeholder={`${title} অনুসন্ধান করুন…`}/></label><span className="record-count">{visible.length.toLocaleString('bn-BD')}টি রেকর্ড</span></div>
    {error?<ErrorState message={error} retry={load}/>:null}{loading?<LoadingState/>:!visible.length?<EmptyState title="কোনো রেকর্ড পাওয়া যায়নি" detail={query?'অন্য শব্দ দিয়ে অনুসন্ধান করুন।':'আর্কাইভ সাজাতে প্রথম রেকর্ডটি তৈরি করুন।'} action={createHref?<Link className="btn btn-primary" href={createHref}>রেকর্ড তৈরি করুন</Link>:undefined}/>:<div className="card table-card"><div className="table-scroll"><table className="table"><thead><tr>{columns.map(([label])=><th key={label}>{label}</th>)}{detailBase?<th aria-label="কার্যক্রম"/>:null}</tr></thead><tbody>{visible.map((item,i)=><tr key={String(item.id??i)}>{columns.map(([label,key])=><td key={label}>{key===nameKey?<strong>{display(key,item[key])}</strong>:display(key,item[key])}</td>)}{detailBase?<td className="table-action"><Link href={`${detailBase}/${String(item.id)}`}>দেখুন →</Link></td>:null}</tr>)}</tbody></table></div></div>}</div></AppShell>
}
