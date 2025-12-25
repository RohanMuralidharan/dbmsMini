import { useState, useEffect } from 'react'
import { apiPost, apiGet, apiDelete } from '../lib/api'

export default function Restaurants(){
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [list, setList] = useState([])
  const [error, setError] = useState(null)
  useEffect(()=>{ fetchList() }, [])
  async function fetchList(){
    try{ const data = await apiGet('/api/restaurants/list'); setList(Array.isArray(data)?data:[]); setError(null) }catch(err){ console.error('restaurants fetch error', err); setError(err.message||String(err)) }
  }
  async function submit(e){ e.preventDefault(); try{ await apiPost('/api/restaurants/create',{name,location,cuisine}); setName(''); setLocation(''); setCuisine(''); fetchList() }catch(err){ setError(err.message||String(err)) } }

  return (
    <div>
      <h2>Restaurants</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
        <input placeholder="Cuisine" value={cuisine} onChange={e=>setCuisine(e.target.value)} />
        <button type="submit">Create Restaurant</button>
      </form>

      {error && <div style={{color:'crimson'}}>Error: {error}</div>}
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Cuisine</th><th>Rating</th><th>Action</th></tr></thead>
  <tbody>{list.map(r=> (<tr key={r.restaurant_id}><td>{r.restaurant_id}</td><td>{r.name}</td><td>{r.location}</td><td>{r.cuisine}</td><td>{r.rating}</td><td><button onClick={async ()=>{ if(confirm('Delete restaurant?')){ try{ await apiDelete(`/api/restaurants/${r.restaurant_id}`); fetchList() }catch(err){ console.error('delete restaurant error', err); alert('Delete failed: '+(err.message||err)) } } }}>Delete</button></td></tr>))}</tbody>
      </table>
    </div>
  )
}
