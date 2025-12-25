import { useState, useEffect } from 'react'
import { apiPost, apiGet, apiDelete } from '../lib/api'

export default function MenuItems(){
  const [restaurantId, setRestaurantId] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [items, setItems] = useState([])

  useEffect(()=>{ fetchList() }, [])
  async function fetchList(){ setItems(await apiGet('/api/menu_items/list')) }
  async function submit(e){ e.preventDefault(); await apiPost('/api/menu_items/create',{restaurant_id:parseInt(restaurantId,10), name, price: parseFloat(price)}); setRestaurantId(''); setName(''); setPrice(''); fetchList() }

  return (
    <div>
      <h2>Menu Items</h2>
      <form onSubmit={submit}>
        <input placeholder="Restaurant ID" value={restaurantId} onChange={e=>setRestaurantId(e.target.value)} required />
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)} required />
        <button type="submit">Create Item</button>
      </form>

      <table>
        <thead><tr><th>ID</th><th>Restaurant</th><th>Name</th><th>Price</th><th>Available</th><th>Action</th></tr></thead>
  <tbody>{items.map(i=> (<tr key={i.item_id}><td>{i.item_id}</td><td>{i.restaurant_id}</td><td>{i.name}</td><td>{i.price}</td><td>{String(i.availability)}</td><td><button onClick={async ()=>{ if(confirm('Delete item?')){ try{ await apiDelete(`/api/menu_items/${i.item_id}`); fetchList() }catch(err){ console.error('delete item error', err); alert('Delete failed: '+(err.message||err)) } } }}>Delete</button></td></tr>))}</tbody>
      </table>
    </div>
  )
}
