import { useState, useEffect } from 'react'
import { apiPost, apiGet, apiDelete } from '../lib/api'

export default function Payments(){
  const [userId, setUserId] = useState('')
  const [rideId, setRideId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('')
  const [list, setList] = useState([])
  useEffect(()=>{ fetchList() }, [])
  async function fetchList(){ setList(await apiGet('/api/payments/list')) }
  async function submit(e){ e.preventDefault(); await apiPost('/api/payments/create',{user_id:parseInt(userId,10), ride_id: rideId ? parseInt(rideId,10) : null, order_id: orderId ? parseInt(orderId,10) : null, amount: parseFloat(amount), mode}); setUserId(''); setRideId(''); setOrderId(''); setAmount(''); setMode(''); fetchList() }

  return (
    <div>
      <h2>Payments</h2>
      <form onSubmit={submit}>
        <input placeholder="User ID" value={userId} onChange={e=>setUserId(e.target.value)} required />
        <input placeholder="Ride ID (optional)" value={rideId} onChange={e=>setRideId(e.target.value)} />
        <input placeholder="Order ID (optional)" value={orderId} onChange={e=>setOrderId(e.target.value)} />
        <input placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} required />
        <input placeholder="Mode" value={mode} onChange={e=>setMode(e.target.value)} required />
        <button type="submit">Create Payment</button>
      </form>

      <table>
        <thead><tr><th>ID</th><th>User</th><th>Order</th><th>Ride</th><th>Amount</th><th>Mode</th><th>Status</th><th>Action</th></tr></thead>
  <tbody>{list.map(p=> (<tr key={p.payment_id}><td>{p.payment_id}</td><td>{p.user_id}</td><td>{p.order_id}</td><td>{p.ride_id}</td><td>{p.amount}</td><td>{p.mode}</td><td>{p.status}</td><td><button onClick={async ()=>{ if(confirm('Delete payment?')){ try{ await apiDelete(`/api/payments/${p.payment_id}`); fetchList() }catch(err){ console.error('delete payment error', err); alert('Delete failed: '+(err.message||err)) } } }}>Delete</button></td></tr>))}</tbody>
      </table>
    </div>
  )
}
