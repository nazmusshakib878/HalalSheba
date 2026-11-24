"use client";
import {useCallback,useEffect,useState} from 'react';
import {api} from '@/lib/api';
export function useData<T>(path:string) {const [data,setData]=useState<T|null>(null),[error,setError]=useState('');const reload=useCallback(()=>api<T>(path).then(d=>{setData(d);setError('');}).catch(e=>setError(e.message)),[path]);useEffect(()=>{reload();},[reload]);return {data,error,reload};}
export const money=(n:number)=>'৳'+(Number(n||0)/100).toLocaleString('en-BD',{maximumFractionDigits:2});
export function formatBdDate(dateStr: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!dateStr) return '—';
  let iso = String(dateStr).trim();
  if (!iso.includes('T') && iso.includes(' ')) {
    iso = iso.replace(' ', 'T');
  }
  if (!iso.endsWith('Z') && !/[+-]\d{2}(?::?\d{2})?$/.test(iso)) {
    iso += 'Z';
  }
  const date = new Date(iso);
  if (isNaN(date.getTime())) return String(dateStr);

  return date.toLocaleString('bn-BD', {
    timeZone: 'Asia/Dhaka',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  });
}
export function Notice({text,error=false}:{text:string;error?:boolean}) {return text?<div role="status" className={'notice '+(error?'error':'')}>{text}</div>:null;}
export function Loading(){return <><div className="skeleton"/><div className="skeleton"/></>;}
export function Table({headers,children,empty=false}:{headers:string[];children:React.ReactNode;empty?:boolean}) {return <div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table>{empty&&<div className="empty">No records yet.</div>}</div>;}
export function downloadCsv(rows:Record<string,unknown>[],filename:string){if(!rows.length)return;const keys=Object.keys(rows[0]);const escape=(v:unknown)=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};const csv=[keys.map(escape).join(','),...rows.map(r=>keys.map(k=>escape(r[k])).join(','))].join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);}
