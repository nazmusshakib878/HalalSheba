"use client";
import {useState} from 'react';
import Link from 'next/link';
import {api} from '@/lib/api';
import {useData,money,Notice,Table,Loading} from './shared';
import {notifyCatalogUpdated} from '@/context/CatalogContext';
export type Row=Record<string,any>;
export function Products(){
 const {data,error,reload}=useData<Row[]>('admin/products?archived=1');
 const [q,setQ]=useState(''),[status,setStatus]=useState('active'),[message,setMessage]=useState(''),[selected,setSelected]=useState<number[]>([]);
 const [togglingId,setTogglingId]=useState<number|null>(null);
 if(!data)return <><Notice text={error} error/><Loading/></>;
 const rows=data.filter(p=>(p.name+' '+p.slug+' '+p.variants.map((v:Row)=>v.sku).join(' ')).toLowerCase().includes(q.toLowerCase())&&(status==='all'||(status==='archived'?!!p.deleted_at:!p.deleted_at&&Boolean(p.active)===(status==='active'))));
 
 const action=async(id:number,actionName:string)=>{
  try{
   await api(`admin/products/${id}/action`,{method:'POST',body:JSON.stringify({action:actionName})});
   notifyCatalogUpdated();
   await reload();
   setMessage('Product '+actionName+' completed.');
  }catch(e){
   setMessage((e as Error).message);
  }
 };

 const toggleActive=async(p:Row)=>{
  setTogglingId(p.id);
  const nextActive=!p.active;
  try{
   await api(`admin/products/${p.id}/action`,{method:'POST',body:JSON.stringify({action:nextActive?'activate':'deactivate'})});
   notifyCatalogUpdated();
   await reload();
   setMessage(`'${p.name}' পণ্যটি ${nextActive?'এখন ওয়েবসাইটে লাইভ দেখাচ্ছে (Live)':'ওয়েবসাইট থেকে হাইড করা হয়েছে (Hidden)'}।`);
  }catch(e){
   setMessage((e as Error).message);
  }finally{
   setTogglingId(null);
  }
 };

 const bulkToggleActive=async(targetActive:boolean)=>{
  if(!selected.length)return;
  try{
   for(const id of selected){
    await api(`admin/products/${id}/action`,{method:'POST',body:JSON.stringify({action:targetActive?'activate':'deactivate'})});
   }
   notifyCatalogUpdated();
   await reload();
   setSelected([]);
   setMessage(`${selected.length}টি পণ্য ${targetActive?'ওয়েবসাইটে একটিভ (Live)':'হাইড (Hidden)'} করা হয়েছে।`);
  }catch(e){
   setMessage((e as Error).message);
  }
 };

 return <>
  <h1>Products</h1>
  <p className="muted">Your catalog, pricing and availability in one place. Toggle visibility to instantly show or hide on the website.</p>
  <Notice text={error||message}/>
  <div className="toolbar">
   <input placeholder="Search product or SKU…" value={q} onChange={e=>setQ(e.target.value)}/>
   <div className="row">
    <select value={status} onChange={e=>setStatus(e.target.value)}>
     <option value="active">Active (Live on Store)</option>
     <option value="inactive">Inactive (Hidden)</option>
     <option value="archived">Archived</option>
     <option value="all">All Products</option>
    </select>
    <Link className="button" href="/admin/products/add">+ Add product</Link>
   </div>
  </div>

  {selected.length>0&&<div className="toolbar" style={{background:'#f8fafc',padding:'10px 16px',borderRadius:'8px',border:'1px solid #e2e8f0'}}>
   <span style={{fontWeight:'600'}}>{selected.length} টি সিলেক্ট করা হয়েছে</span>
   <div className="row" style={{gap:'8px'}}>
    <button type="button" className="secondary" style={{color:'#047857',borderColor:'#10b981'}} onClick={()=>bulkToggleActive(true)}>
     ✓ Show on Store (Active)
    </button>
    <button type="button" className="secondary" style={{color:'#64748b',borderColor:'#cbd5e1'}} onClick={()=>bulkToggleActive(false)}>
     ✕ Hide from Store (Inactive)
    </button>
    <button type="button" className="danger" onClick={async()=>{
     if(confirm('Archive all selected products?')){
      for(const id of selected)await action(id,'archive');
      setSelected([]);
     }
    }}>
     Archive selected
    </button>
   </div>
  </div>}

  <Table headers={['','Product','SKU / Variants','Price','Available','Store Visibility (লাইভ / শো)','Actions']} empty={!rows.length}>
   {rows.map(p=><tr key={p.id}>
    <td>
     <input type="checkbox" checked={selected.includes(p.id)} onChange={e=>setSelected(e.target.checked?[...selected,p.id]:selected.filter(i=>i!==p.id))}/>
    </td>
    <td>
     <div className="row">
      {p.images?.[0]&&<img src={p.images[0]} alt="" width={42} height={42} style={{borderRadius:6,objectFit:'cover'}}/>}
      <Link href={'/admin/products/'+p.id} style={{fontWeight:'600',color:'#0f172a'}}>{p.name}</Link>
     </div>
    </td>
    <td>{p.variants.length} variants</td>
    <td>{money(p.variants[0]?.price)}</td>
    <td>{p.variants.reduce((s:number,v:Row)=>s+v.physical-v.reserved,0)}</td>
    <td>
     <button
      type="button"
      onClick={()=>toggleActive(p)}
      disabled={togglingId===p.id}
      title={p.active?"ক্লিক করে ওয়েবসাইট থেকে লুকান (Hide from Store)":"ক্লিক করে ওয়েবসাইটে লাইভ করুন (Show on Store)"}
      style={{
       display:'inline-flex',
       alignItems:'center',
       gap:'8px',
       background:p.active?'#eaf6ef':'#f1f5f9',
       border:`1.5px solid ${p.active?'#10b981':'#cbd5e1'}`,
       borderRadius:'24px',
       padding:'4px 12px 4px 5px',
       cursor:togglingId===p.id?'wait':'pointer',
       transition:'all 0.2s ease',
       opacity:togglingId===p.id?0.6:1,
      }}
     >
      <span style={{
       width:'36px',
       height:'20px',
       background:p.active?'#10b981':'#94a3b8',
       borderRadius:'12px',
       display:'inline-flex',
       alignItems:'center',
       padding:'2px',
       transition:'background 0.2s ease',
      }}>
       <span style={{
        width:'16px',
        height:'16px',
        background:'white',
        borderRadius:'50%',
        transform:p.active?'translateX(16px)':'translateX(0)',
        transition:'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow:'0 1px 3px rgba(0,0,0,0.25)',
        display:'flex',
        alignItems:'center',
        justifyContent: 'center',
        fontSize:'10px',
        fontWeight:'bold',
        color:p.active?'#059669':'#64748b'
       }}>
        {p.active?'✓':''}
       </span>
      </span>
      <span style={{
       fontSize:'12px',
       fontWeight:'700',
       color:p.active?'#047857':'#64748b',
       userSelect:'none',
       letterSpacing:'0.2px'
      }}>
       {p.deleted_at?'Archived':p.active?'Live (On)':'Hidden (Off)'}
      </span>
     </button>
    </td>
    <td style={{whiteSpace:'nowrap'}}>
     <Link className="button secondary" href={'/admin/products/'+p.id} style={{padding:'6px 12px',fontSize:'12px'}}>Edit</Link>
     <button className="secondary" onClick={()=>action(p.id,'duplicate')} style={{padding:'6px 12px',fontSize:'12px'}}>Duplicate</button>
     <button className="danger" onClick={()=>{if(confirm(p.deleted_at?'Restore this product as inactive?':'Archive this product? It will be hidden from the store.'))action(p.id,p.deleted_at?'restore':'archive');}} style={{padding:'6px 12px',fontSize:'12px'}}>
      {p.deleted_at?'Restore':'Archive'}
     </button>
    </td>
   </tr>)}
  </Table>
 </>;
}
const initial:Row={name:'',name_en:'',slug:'',category_id:'',brand_id:null,short_description:'',description:'',origin:'',storage_instructions:'',seo_title:'',seo_description:'',features:[],images:[],tags:[],active:true,featured:false,bestseller:false,new_arrival:false,variants:[{name:'1kg',sku:'',price:0,regular_price:null,cost:0,low_stock_threshold:5,active:true}]};
export function ProductEditor({id}:{id?:string}){
 const {data,error}=useData<Row>(id?'admin/products/'+id:'admin/settings');
 const {data:cats}=useData<Row[]>('admin/manage/categories');const {data:brands}=useData<Row[]>('admin/manage/brands');
 const [form,setForm]=useState<Row|null>(id?null:structuredClone(initial)),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 if(id&&data&&!form)setForm({...data,variants:data.variants.map((v:Row)=>({...v,active:!!v.active})),active:!!data.active,featured:!!data.featured,bestseller:!!data.bestseller,new_arrival:!!data.new_arrival});
 if(!form)return <><Notice text={error} error/><Loading/></>;
 const set=(key:string,value:any)=>setForm({...form,[key]:value});
 const field=(key:string,label:string,type='text')=><label key={key}>{label}<input type={type} value={form[key]??''} onChange={e=>set(key,e.target.value)} required={['name','slug'].includes(key)}/></label>;
 const upload=async(files:FileList|null)=>{if(!files)return;setBusy(true);try{const urls=[];for(const file of Array.from(files)){const body=new FormData();body.append('image',file);const r=await api<{url:string}>('admin/images',{method:'POST',body});urls.push(r.url);}set('images',[...form.images,...urls]);}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}};
 return <><div className="toolbar"><div><h1>{id?'Edit product':'Add new product'}</h1><p className="muted">Prices are shown in taka. Stock is managed separately in Inventory.</p></div><Link href="/admin/products" className="button secondary">Back to products</Link></div><Notice text={message||error}/><form onSubmit={async e=>{e.preventDefault();setBusy(true);try{const saved=await api<Row>('admin/products'+(id?'/'+id:''),{method:id?'PUT':'POST',body:JSON.stringify({...form,category_id:Number(form.category_id),brand_id:form.brand_id?Number(form.brand_id):null})});setMessage('Product saved successfully.');notifyCatalogUpdated();if(!id)location.assign('/admin/products/'+saved.id);}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}}>
 <div className="panel"><h2>Basic information</h2><div className="grid">{field('name','Product title / পণ্যের নাম')}{field('name_en','English title')}{field('slug','URL slug')}<label>Category<select required value={form.category_id} onChange={e=>set('category_id',e.target.value)}><option value="">Choose category</option>{cats?.filter(c=>!c.deleted_at).map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label>Brand<select value={form.brand_id??''} onChange={e=>set('brand_id',e.target.value)}><option value="">No brand</option>{brands?.map(b=><option value={b.id} key={b.id}>{b.name}</option>)}</select></label>{field('origin','Origin / উৎপত্তিস্থল')}<label className="span-2">Short description<textarea value={form.short_description??''} onChange={e=>set('short_description',e.target.value)}/></label><label className="span-2">Full description<textarea value={form.description??''} onChange={e=>set('description',e.target.value)}/></label><label>Storage instructions<textarea value={form.storage_instructions??''} onChange={e=>set('storage_instructions',e.target.value)}/></label><label>Tags (comma separated)<input value={form.tags.join(',')} onChange={e=>set('tags',e.target.value.split(',').map(s=>s.trim()))}/></label></div></div>
 <div className="panel"><h2>Product features</h2>{form.features.map((f:string,i:number)=><div className="row" key={i} style={{marginBottom:10}}><input style={{flex:1}} value={f} onChange={e=>set('features',form.features.map((x:string,j:number)=>j===i?e.target.value:x))}/><button type="button" className="danger" onClick={()=>set('features',form.features.filter((_:string,j:number)=>i!==j))}>Remove</button></div>)}<button type="button" className="secondary" onClick={()=>set('features',[...form.features,''])}>+ Add feature</button></div>
 <div className="panel"><h2>Images</h2><div className="dropzone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();upload(e.dataTransfer.files);}}>Drop images here, or choose files. JPEG, PNG or WebP; up to 5 MB each.<input aria-label="Upload product images" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>upload(e.target.files)}/></div><div className="images">{form.images.map((url:string,i:number)=><div key={url+i}><img src={url} alt={'Product '+(i+1)}/><small>{i===0?'Main image':'Image '+(i+1)}</small><div className="image-actions"><button type="button" className="secondary" onClick={()=>set('images',[url,...form.images.filter((_:string,j:number)=>j!==i)])}>Main</button><button type="button" className="danger" onClick={()=>set('images',form.images.filter((_:string,j:number)=>j!==i))}>×</button></div></div>)}</div></div>
 <div className="panel"><h2>Weight, pricing & variants</h2>{form.variants.map((v:Row,i:number)=><div className="variant" key={i}><div className="grid">{[['name','Weight / size'],['sku','Unique SKU'],['price','Selling price (৳)'],['regular_price','Original price (৳)'],['cost','Buying cost (৳) — private'],['low_stock_threshold','Low stock threshold']].map(([key,label])=><label key={key}>{label}<input required={key!=='regular_price'} min="0" step={['price','regular_price','cost'].includes(key)?'0.01':'1'} type={['name','sku'].includes(key)?'text':'number'} value={['price','regular_price','cost'].includes(key)?v[key]==null?'':v[key]/100:v[key]} onChange={e=>set('variants',form.variants.map((x:Row,j:number)=>j===i?{...x,[key]:['name','sku'].includes(key)?e.target.value:e.target.value===''?null:Math.round(Number(e.target.value)*(['price','regular_price','cost'].includes(key)?100:1))}:x))}/></label>)}<label>Variant image<select value={v.image??''} onChange={e=>set('variants',form.variants.map((x:Row,j:number)=>i===j?{...x,image:e.target.value||null}:x))}><option value="">Main product image</option>{form.images.map((img:string,j:number)=><option key={j} value={img}>Image {j+1}</option>)}</select></label><div><p className="muted">Estimated unit profit: {money(v.price-v.cost)} · Margin: {v.price?((v.price-v.cost)/v.price*100).toFixed(1):0}%</p><p className="muted">Discount: {v.regular_price>v.price?((v.regular_price-v.price)/v.regular_price*100).toFixed(1):0}%</p></div></div><button type="button" className="danger" disabled={form.variants.length===1} onClick={()=>set('variants',form.variants.filter((_:Row,j:number)=>i!==j))}>Remove variant</button></div>)}<button type="button" className="secondary" onClick={()=>set('variants',[...form.variants,{name:'',sku:'',price:0,cost:0,regular_price:null,low_stock_threshold:5,active:true}])}>+ Add weight / variant</button></div>
 <div className="panel"><h2>Search engines & visibility</h2><div className="grid">{field('seo_title','SEO title')}{field('seo_description','SEO description')}</div><div className="row" style={{marginTop:20}}>{['active','featured','bestseller','new_arrival'].map(key=><label className="check" key={key} style={key==='active'?{background:form.active?'#eaf6ef':'#f8fafc',padding:'6px 12px',borderRadius:'20px',border:form.active?'1.5px solid #10b981':'1px solid #cbd5e1',fontWeight:'700',color:form.active?'#047857':'#64748b'}:{}}><input type="checkbox" checked={!!form[key]} onChange={e=>set(key,e.target.checked)}/>{key==='active'?(form.active?'✓ Live on Store (Active)':'✕ Hidden from Store (Inactive)'):key.replaceAll('_',' ')}</label>)}</div></div><button disabled={busy}>{busy?'Saving…':'Save product'}</button></form></>;
}
