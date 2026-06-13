import { useState } from 'react';
import { Plus, Trash2, Download, FileText, Eye } from 'lucide-react';

interface LineItem { id:string; desc:string; qty:number; rate:number; }
interface Invoice { id:string; num:string; client:string; email:string; date:string; due:string; items:LineItem[]; tax:number; notes:string; }
const SK='ik_invoices_v1'; const C='#eab308';
const ld=():Invoice[]=>{try{return JSON.parse(localStorage.getItem(SK)||'[]')}catch{return[]}};
const blank=():Invoice=>({id:Date.now().toString(),num:'INV-'+String(Date.now()).slice(-4),client:'',email:'',date:new Date().toISOString().split('T')[0],due:'',items:[{id:'1',desc:'',qty:1,rate:0}],tax:0,notes:''});

export default function App() {
  const [invoices,setInvoices]=useState<Invoice[]>(ld);
  const [view,setView]=useState<'list'|'edit'|'preview'>('list');
  const [cur,setCur]=useState<Invoice|null>(null);

  const sv=(items:Invoice[])=>{setInvoices(items);localStorage.setItem(SK,JSON.stringify(items))};
  const subTotal=(inv:Invoice)=>inv.items.reduce((a,i)=>a+i.qty*i.rate,0);
  const taxAmt=(inv:Invoice)=>subTotal(inv)*inv.tax/100;
  const total=(inv:Invoice)=>subTotal(inv)+taxAmt(inv);
  const fmt=(n:number)=>n.toFixed(2);

  const addItem=()=>{if(!cur)return;setCur({...cur,items:[...cur.items,{id:Date.now().toString(),desc:'',qty:1,rate:0}]})};
  const updItem=(id:string,field:keyof LineItem,val:string|number)=>{if(!cur)return;setCur({...cur,items:cur.items.map(i=>i.id===id?{...i,[field]:field==='desc'?val:Number(val)}:i)})};
  const delItem=(id:string)=>{if(!cur)return;setCur({...cur,items:cur.items.filter(i=>i.id!==id)})};

  const saveInv=()=>{if(!cur)return;const u=invoices.find(i=>i.id===cur.id)?invoices.map(i=>i.id===cur.id?cur:i):[cur,...invoices];sv(u);setView('list')};

  const printInv=()=>{
    if(!cur)return;
    const win=window.open('','_blank');
    if(!win)return;
    win.document.write('<html><head><title>Invoice '+cur.num+'</title><style>body{font-family:Inter,sans-serif;padding:40px;color:#111}table{width:100%;border-collapse:collapse}th,td{padding:10px;border-bottom:1px solid #eee;text-align:left}.right{text-align:right}.total{font-weight:700;font-size:18px}h1{color:#eab308}</style></head><body>');
    win.document.write('<h1>INVOICE</h1><p><strong>#'+cur.num+'</strong></p><p>Bill To: <strong>'+cur.client+'</strong><br>'+cur.email+'</p><p>Date: '+cur.date+'<br>Due: '+cur.due+'</p>');
    win.document.write('<table><tr><th>Description</th><th>Qty</th><th>Rate</th><th class="right">Amount</th></tr>');
    cur.items.forEach(i=>win.document.write('<tr><td>'+i.desc+'</td><td>'+i.qty+'</td><td>$'+fmt(i.rate)+'</td><td class="right">$'+fmt(i.qty*i.rate)+'</td></tr>'));
    win.document.write('<tr><td colspan="3">Subtotal</td><td class="right">$'+fmt(subTotal(cur))+'</td></tr>');
    win.document.write('<tr><td colspan="3">Tax ('+cur.tax+'%)</td><td class="right">$'+fmt(taxAmt(cur))+'</td></tr>');
    win.document.write('<tr><td colspan="3" class="total">TOTAL</td><td class="right total">$'+fmt(total(cur))+'</td></tr></table>');
    if(cur.notes) win.document.write('<p>Notes: '+cur.notes+'</p>');
    win.document.write('</body></html>');
    win.document.close();win.print();
  };

  const inp={width:'100%',background:'#0a0900',border:'1px solid '+C+'20',borderRadius:'10px',padding:'10px 13px',color:'white',fontSize:'13px',outline:'none',fontFamily:'Inter',boxSizing:'border-box' as const};

  if(view==='edit'&&cur) return (
    <div style={{minHeight:'100vh',background:'#080700',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'13px 18px',borderBottom:'1px solid '+C+'20',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button onClick={()=>setView('list')} style={{color:C,background:'none',border:'none',cursor:'pointer',fontSize:'13px',fontFamily:'Inter'}}>← Back</button>
        <span style={{color:'white',fontWeight:'700',fontFamily:'Inter'}}>{cur.num}</span>
        <div style={{display:'flex',gap:'6px'}}>
          <button onClick={()=>{saveInv();setTimeout(()=>{setCur(cur);setView('preview')},100)}} style={{padding:'7px 12px',borderRadius:'8px',background:'#ffffff08',border:'1px solid '+C+'20',color:'#aaa',fontSize:'12px',cursor:'pointer',fontFamily:'Inter',display:'flex',alignItems:'center',gap:'4px'}}><Eye size={12}/>Preview</button>
          <button onClick={saveInv} style={{padding:'7px 14px',borderRadius:'8px',background:C,border:'none',color:'black',fontSize:'12px',fontWeight:'700',cursor:'pointer',fontFamily:'Inter'}}>Save</button>
        </div>
      </div>
      <div style={{flex:1,overflow:'auto',padding:'18px',display:'flex',flexDirection:'column',gap:'14px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          <div><label style={{color:'#666',fontSize:'11px',fontFamily:'Inter'}}>CLIENT NAME</label><input value={cur.client} onChange={e=>setCur({...cur,client:e.target.value})} style={{...inp,marginTop:'4px'}}/></div>
          <div><label style={{color:'#666',fontSize:'11px',fontFamily:'Inter'}}>EMAIL</label><input value={cur.email} onChange={e=>setCur({...cur,email:e.target.value})} style={{...inp,marginTop:'4px'}}/></div>
          <div><label style={{color:'#666',fontSize:'11px',fontFamily:'Inter'}}>DATE</label><input type="date" value={cur.date} onChange={e=>setCur({...cur,date:e.target.value})} style={{...inp,marginTop:'4px'}}/></div>
          <div><label style={{color:'#666',fontSize:'11px',fontFamily:'Inter'}}>DUE DATE</label><input type="date" value={cur.due} onChange={e=>setCur({...cur,due:e.target.value})} style={{...inp,marginTop:'4px'}}/></div>
        </div>
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
            <span style={{color:'#666',fontSize:'11px',fontFamily:'Inter'}}>LINE ITEMS</span>
            <button onClick={addItem} style={{padding:'5px 10px',borderRadius:'7px',background:C+'20',border:'1px solid '+C+'30',color:C,fontSize:'11px',cursor:'pointer',fontFamily:'Inter',display:'flex',alignItems:'center',gap:'4px'}}><Plus size={10}/>Add</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
            {cur.items.map(item=>(
              <div key={item.id} style={{display:'grid',gridTemplateColumns:'2fr 0.6fr 0.8fr auto',gap:'6px',alignItems:'center'}}>
                <input value={item.desc} onChange={e=>updItem(item.id,'desc',e.target.value)} placeholder="Description" style={inp}/>
                <input type="number" value={item.qty} onChange={e=>updItem(item.id,'qty',e.target.value)} style={inp} min={1}/>
                <input type="number" value={item.rate} onChange={e=>updItem(item.id,'rate',e.target.value)} style={inp} min={0} step={0.01}/>
                <button onClick={()=>delItem(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#444'}}><Trash2 size={13}/></button>
              </div>
            ))}
          </div>
        </div>
        <div style={{padding:'14px',borderRadius:'12px',background:'#ffffff06',border:'1px solid '+C+'15'}}>
          <div style={{display:'flex',justifyContent:'space-between',color:'#888',fontSize:'13px',fontFamily:'Inter',marginBottom:'6px'}}><span>Subtotal</span><span>${fmt(subTotal(cur))}</span></div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
            <span style={{color:'#888',fontSize:'13px',fontFamily:'Inter'}}>Tax %</span>
            <input type="number" value={cur.tax} onChange={e=>setCur({...cur,tax:Number(e.target.value)})} style={{width:'60px',background:'#0a0900',border:'1px solid '+C+'20',borderRadius:'6px',padding:'4px 8px',color:'white',fontSize:'13px',outline:'none',fontFamily:'Inter',textAlign:'right'}} min={0} max={100}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',color:C,fontSize:'16px',fontWeight:'700',fontFamily:'Inter',borderTop:'1px solid '+C+'20',paddingTop:'8px'}}><span>TOTAL</span><span>${fmt(total(cur))}</span></div>
        </div>
        <div><label style={{color:'#666',fontSize:'11px',fontFamily:'Inter'}}>NOTES</label><textarea value={cur.notes} onChange={e=>setCur({...cur,notes:e.target.value})} rows={3} style={{...inp,resize:'none',marginTop:'4px'}}/></div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#080700',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'15px 18px',borderBottom:'1px solid '+C+'20',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div><div style={{color:'white',fontWeight:'800',fontSize:'17px',fontFamily:'Inter'}}>InvoiceKit</div><div style={{color:'#555',fontSize:'11px',fontFamily:'Inter'}}>{invoices.length} invoices</div></div>
        <button onClick={()=>{setCur(blank());setView('edit')}} style={{padding:'8px 14px',borderRadius:'10px',background:C,border:'none',color:'black',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'Inter',display:'flex',alignItems:'center',gap:'5px'}}><Plus size={14}/>New</button>
      </div>
      {invoices.length===0?(
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'12px',padding:'40px'}}>
          <FileText size={48} color={C} opacity={0.3}/>
          <div style={{color:'white',fontSize:'18px',fontWeight:'700',fontFamily:'Inter'}}>No invoices yet</div>
          <button onClick={()=>{setCur(blank());setView('edit')}} style={{padding:'11px 24px',borderRadius:'10px',background:C,border:'none',color:'black',fontWeight:'700',cursor:'pointer',fontFamily:'Inter'}}>Create First Invoice</button>
        </div>
      ):(
        <div style={{flex:1,overflow:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
          {invoices.map(inv=>(
            <div key={inv.id} style={{padding:'14px 16px',borderRadius:'14px',background:'#ffffff06',border:'1px solid #ffffff08',cursor:'pointer'}} onClick={()=>{setCur(inv);setView('edit')}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{color:'white',fontWeight:'700',fontSize:'14px',fontFamily:'Inter'}}>{inv.client||'Unnamed Client'}</div>
                  <div style={{color:'#555',fontSize:'11px',fontFamily:'Inter',marginTop:'2px'}}>{inv.num} · Due {inv.due||'—'}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{color:C,fontWeight:'700',fontSize:'15px',fontFamily:'Inter'}}>${fmt(total(inv))}</div>
                  <button onClick={e=>{e.stopPropagation();const saved=invoices.find(i=>i.id===inv.id);if(saved){setCur(saved);setTimeout(printInv,50)}}} style={{marginTop:'4px',padding:'4px 10px',borderRadius:'6px',background:'#ffffff08',border:'none',color:'#888',fontSize:'11px',cursor:'pointer',fontFamily:'Inter',display:'flex',alignItems:'center',gap:'3px'}}><Download size={10}/>Print</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
