"use client";
import {useState} from 'react';
import {useData,money,Notice,Loading,Table,downloadCsv} from './shared';
import type {Row} from './Products';
export function Dashboard({analytics=false}:{analytics?:boolean}){
 const today=new Date().toISOString().slice(0,10);const [from,setFrom]=useState(today.slice(0,7)+'-01'),[to,setTo]=useState(today);
 const {data,error}=useData<Row>(`admin/reports?from=${from}&to=${to}`);
 const presets=(days:number)=>{const d=new Date();d.setDate(d.getDate()-days);setFrom(d.toISOString().slice(0,10));setTo(today);};
 return <>
  <h1>{analytics?'Sales & analytics':'Business overview'}</h1>
  <p className="muted">Actual database activity. Revenue includes paid, delivered orders only.</p>
  <div className="toolbar"><div className="row"><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><button className="secondary" onClick={()=>presets(0)}>Today</button><button className="secondary" onClick={()=>presets(6)}>7 days</button><button className="secondary" onClick={()=>presets(29)}>30 days</button><button className="secondary" onClick={()=>presets(364)}>Year</button></div><button disabled={!data} onClick={()=>downloadCsv([Object.fromEntries(Object.entries(data||{}).filter(([,v])=>typeof v==='number'))],'sales-report.csv')}>Export CSV</button></div>
  <Notice text={error} error/>
  {!data?<Loading/>:<>
   <div className="kpis">{(analytics?['revenue','cogs','gross_profit','delivery_fees_collected','actual_delivery_costs','estimated_net_profit','discounts','refunds','total_sales']:['total_products','active_products','inactive_products','total_stock','low_stock','out_of_stock','today_orders','pending_orders','total_sales','revenue','estimated_net_profit','customers']).map(key=><div className="kpi" key={key}><span className="muted">{key.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase())}</span><strong>{['revenue','cogs','gross_profit','delivery_fees_collected','actual_delivery_costs','estimated_net_profit','delivery_costs','discounts','refunds'].includes(key)?money(data[key]):data[key]}</strong></div>)}</div>
   {!analytics&&<div className="grid"><a className="kpi" href="/admin/orders?status=new"><span>Pending orders</span><strong>{data.pending_orders}</strong></a><a className="kpi" href="/admin/inventory?filter=low"><span>Low stock</span><strong>{data.low_stock}</strong></a></div>}
   <div className="panel"><h2>Profit breakdown</h2><p>{"Revenue \u2212 COGS + delivery fees collected \u2212 confirmed delivery costs \u2212 refunds = estimated net profit. Discounts are already deducted from revenue."}</p><p>Courier cost recorded for {data.delivery_cost_recorded_orders} orders; unknown for {data.delivery_cost_unknown_orders} orders. Unknown costs are excluded from reported costs, not assumed to be zero.</p></div>
   <div className="panel"><h2>Sales activity</h2><p className="muted">Hover over a bar to see the date and revenue. Estimated net profit excludes unrecorded overhead and taxes.</p>{data.series.length?<div className="chart">{data.series.map((s:Row)=><div key={s.date} title={s.date+' - '+money(s.revenue)} style={{height:Math.max(4,s.revenue/Math.max(...data.series.map((x:Row)=>x.revenue),1)*170)}}/>)}</div>:<div className="empty">No paid, delivered orders in this period.</div>}</div>
   <div className="grid"><div className="panel"><h2>Best selling products</h2><Table headers={['Product','Units','Item sales']} empty={!data.best_selling.length}>{data.best_selling.map((r:Row,i:number)=><tr key={i}><td>{r.name}</td><td>{r.quantity}</td><td>{money(r.revenue)}</td></tr>)}</Table></div><div className="panel"><h2>Recent orders</h2><Table headers={['Reference','Status','Total']} empty={!data.recent_orders.length}>{data.recent_orders.map((o:Row)=><tr key={o.id}><td><a href={'/admin/orders/'+o.id}>{o.reference.slice(0,8)}</a></td><td><span className="badge">{o.status}</span></td><td>{money(o.total)}</td></tr>)}</Table></div></div>
  </>}
 </>;
}
