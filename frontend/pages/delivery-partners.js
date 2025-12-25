import { useState, useEffect } from 'react'
import { apiPost, apiGet, apiDelete } from '../lib/api'

export default function DeliveryPartners(){
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [list, setList] = useState([])
  const [error, setError] = useState(null)

  useEffect(()=>{ fetchList() }, [])
  async function fetchList(){ try{ setList(await apiGet('/api/delivery_partners/list')); setError(null)}catch(err){ setError(err.message||String(err)) } }
  async function submit(e){ e.preventDefault(); try{ await apiPost('/api/delivery_partners/create',{name,phone,vehicle_no:vehicle}); setName(''); setPhone(''); setVehicle(''); fetchList() }catch(err){ setError(err.message||String(err)) } }

  return (
    <div>
      <h2>Delivery Partners</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
        <input placeholder="Vehicle No" value={vehicle} onChange={e=>setVehicle(e.target.value)} />
        <button type="submit">Create Partner</button>
      </form>

      {error && <div style={{color:'crimson'}}>Error: {error}</div>}

      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Vehicle</th><th>Status</th><th>Action</th></tr></thead>
  <tbody>{list.map(p=> (<tr key={p.partner_id}><td>{p.partner_id}</td><td>{p.name}</td><td>{p.phone}</td><td>{p.vehicle_no}</td><td>{p.status}</td><td><button onClick={async ()=>{ if(confirm('Delete partner?')){ try{ await apiDelete(`/api/delivery_partners/${p.partner_id}`); fetchList() }catch(err){ console.error('delete partner error', err); alert('Delete failed: '+(err.message||err)) } } }}>Delete</button></td></tr>))}</tbody>
      </table>
    </div>
  )
}
