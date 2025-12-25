import { useState, useEffect } from 'react'
import { apiPost, apiGet, apiDelete } from '../lib/api'

export default function Drivers(){
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [license, setLicense] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [drivers, setDrivers] = useState([])
  const [error, setError] = useState(null)

  useEffect(()=>{ fetchList() }, [])
  async function fetchList(){
    try{
      const data = await apiGet('/api/drivers/list')
      setDrivers(Array.isArray(data) ? data : [])
      setError(null)
    }catch(err){ console.error('drivers fetch error', err); setError(err.message || String(err)) }
  }
  async function submit(e){ e.preventDefault(); try{ await apiPost('/api/drivers/create',{name,phone,license_no:license,vehicle_no:vehicle}); setName(''); setPhone(''); setLicense(''); setVehicle(''); fetchList(); }catch(err){ setError(err.message || String(err)) } }

  return (
    <div>
      <h2>Drivers</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
        <input placeholder="License No" value={license} onChange={e=>setLicense(e.target.value)} />
        <input placeholder="Vehicle No" value={vehicle} onChange={e=>setVehicle(e.target.value)} />
        <button type="submit">Create Driver</button>
      </form>

      {error && <div style={{color:'crimson'}}>Error: {error}</div>}
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>License</th><th>Vehicle</th><th>Rating</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{drivers.map(d=> (
          <tr key={d.driver_id}><td>{d.driver_id}</td><td>{d.name}</td><td>{d.phone}</td><td>{d.license_no}</td><td>{d.vehicle_no}</td><td>{d.rating}</td><td>{d.status}</td><td><button onClick={async ()=>{ if(confirm('Delete driver?')){ try{ await apiDelete(`/api/drivers/${d.driver_id}`); fetchList() }catch(err){ console.error('delete driver error', err); alert('Delete failed: '+(err.message||err)) } } }}>Delete</button></td></tr>
        ))}</tbody>
      </table>
    </div>
  )
}
