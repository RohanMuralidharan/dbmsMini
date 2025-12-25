import { useState, useEffect } from 'react'
import { apiPost, apiGet, apiDelete } from '../lib/api'

export default function Users(){
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)

  useEffect(()=>{ fetchList() }, [])

  async function fetchList(){
    try{
      const data = await apiGet('/api/users/list')
      setUsers(Array.isArray(data) ? data : [])
      setError(null)
    }catch(err){
      console.error('fetchList users error', err)
      setError(err.message || String(err))
    }
  }

  async function submit(e){
    e.preventDefault()
    await apiPost('/api/users/create', {name, phone, email})
    setName(''); setPhone(''); setEmail('')
    fetchList()
  }

  return (
    <div>
      <h2>Users</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button type="submit">Create User</button>
      </form>

      {error && <div style={{color:'crimson'}}>Error loading users: {error}</div>}

      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>Wallet</th><th>Action</th></tr></thead>
        <tbody>
          {users.map(u=> (
            <tr key={u.user_id}>
              <td>{u.user_id}</td>
              <td>{u.name}</td>
              <td>{u.phone}</td>
              <td>{u.email}</td>
              <td>{u.address}</td>
              <td>{u.wallet_balance}</td>
              <td><button onClick={async ()=>{ if(confirm('Delete user?')){ try{ await apiDelete(`/api/users/${u.user_id}`); fetchList() }catch(err){ console.error('delete user error', err); alert('Delete failed: '+(err.message||err)) } } }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
