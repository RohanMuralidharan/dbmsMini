import { useState, useEffect } from 'react'
import { apiPost, apiGet, apiDelete } from '../lib/api'

export default function Rides(){
  const [userId, setUserId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [fare, setFare] = useState('')
  const [list, setList] = useState([])
  useEffect(()=>{ fetchList() }, [])
  async function fetchList(){ setList(await apiGet('/api/rides/list')) }
  async function submit(e){ e.preventDefault(); await apiPost('/api/rides/create',{user_id:parseInt(userId,10), driver_id:parseInt(driverId,10), source, destination, fare:parseFloat(fare)}); setUserId(''); setDriverId(''); setSource(''); setDestination(''); setFare(''); fetchList() }

  return (
    <div>
      <h2>Rides</h2>
      <form onSubmit={submit}>
        <input placeholder="User ID" value={userId} onChange={e=>setUserId(e.target.value)} required />
        <input placeholder="Driver ID" value={driverId} onChange={e=>setDriverId(e.target.value)} required />
        <input placeholder="Source" value={source} onChange={e=>setSource(e.target.value)} required />
        <input placeholder="Destination" value={destination} onChange={e=>setDestination(e.target.value)} required />
        <input placeholder="Fare" value={fare} onChange={e=>setFare(e.target.value)} required />
        <button type="submit">Create Ride</button>
      </form>

      <table>
        <thead><tr><th>ID</th><th>User</th><th>Driver</th><th>Source</th><th>Destination</th><th>Fare</th><th>Status</th><th>Timestamp</th><th>Action</th></tr></thead>
  <tbody>{list.map(r=> (<tr key={r.ride_id}><td>{r.ride_id}</td><td>{r.user_id}</td><td>{r.driver_id}</td><td>{r.source}</td><td>{r.destination}</td><td>{r.fare}</td><td>{r.status}</td><td>{r.timestamp}</td><td><button onClick={async ()=>{ if(confirm('Delete ride?')){ try{ await apiDelete(`/api/rides/${r.ride_id}`); fetchList() }catch(err){ console.error('delete ride error', err); alert('Delete failed: '+(err.message||err)) } } }}>Delete</button></td></tr>))}</tbody>
      </table>
    </div>
  )
}
