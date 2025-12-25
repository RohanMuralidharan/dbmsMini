import { useState, useEffect } from 'react'
import { apiPost, apiGet, apiDelete } from '../lib/api'

export default function Orders(){
  const [userId, setUserId] = useState('')
  const [restaurantId, setRestaurantId] = useState('')
  const [total, setTotal] = useState('')
  const [itemsJson, setItemsJson] = useState('')
  const [orders, setOrders] = useState([])

  useEffect(()=>{ fetchList() }, [])
  async function fetchList(){ setOrders(await apiGet('/api/orders/list')) }
  async function submit(e){ e.preventDefault(); let items = [];
    try{ items = itemsJson ? JSON.parse(itemsJson) : [] }catch(err){ alert('items JSON invalid'); return }
    await apiPost('/api/orders/create',{user_id:parseInt(userId,10), restaurant_id:parseInt(restaurantId,10), total_amount: parseFloat(total), items}); setUserId(''); setRestaurantId(''); setTotal(''); setItemsJson(''); fetchList()
  }

  return (
    <div>
      <h2>Orders</h2>
      <form onSubmit={submit}>
        <input placeholder="User ID" value={userId} onChange={e=>setUserId(e.target.value)} required />
        <input placeholder="Restaurant ID" value={restaurantId} onChange={e=>setRestaurantId(e.target.value)} required />
        <input placeholder="Total Amount" value={total} onChange={e=>setTotal(e.target.value)} required />
        <textarea placeholder='Items JSON (e.g. [{"item_id":1,"quantity":2}])' value={itemsJson} onChange={e=>setItemsJson(e.target.value)} />
        <button type="submit">Create Order</button>
      </form>

      <table>
        <thead><tr><th>ID</th><th>User</th><th>Restaurant</th><th>Partner</th><th>Total</th><th>Status</th><th>Timestamp</th><th>Action</th></tr></thead>
  <tbody>{orders.map(o=> (<tr key={o.order_id}><td>{o.order_id}</td><td>{o.user_id}</td><td>{o.restaurant_id}</td><td>{o.partner_id}</td><td>{o.total_amount}</td><td>{o.status}</td><td>{o.timestamp}</td><td><button onClick={async ()=>{ if(confirm('Delete order?')){ try{ await apiDelete(`/api/orders/${o.order_id}`); fetchList() }catch(err){ console.error('delete order error', err); alert('Delete failed: '+(err.message||err)) } } }}>Delete</button></td></tr>))}</tbody>
      </table>
    </div>
  )
}
