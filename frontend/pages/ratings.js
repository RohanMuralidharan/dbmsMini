import { useState, useEffect } from 'react'
import { apiPost, apiGet, apiDelete } from '../lib/api'

export default function Ratings(){
  const [userId, setUserId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [targetType, setTargetType] = useState('driver')
  const [score, setScore] = useState('')
  const [comment, setComment] = useState('')
  const [list, setList] = useState([])
  useEffect(()=>{ fetchList() }, [])
  async function fetchList(){ setList(await apiGet('/api/ratings/list')) }
  async function submit(e){ e.preventDefault(); await apiPost('/api/ratings/create',{user_id:parseInt(userId,10), target_id:parseInt(targetId,10), target_type:targetType, score:parseInt(score,10), comment}); setUserId(''); setTargetId(''); setScore(''); setComment(''); fetchList() }

  return (
    <div>
      <h2>Ratings</h2>
      <form onSubmit={submit}>
        <input placeholder="User ID" value={userId} onChange={e=>setUserId(e.target.value)} required />
        <input placeholder="Target ID" value={targetId} onChange={e=>setTargetId(e.target.value)} required />
        <select value={targetType} onChange={e=>setTargetType(e.target.value)}>
          <option value="driver">Driver</option>
          <option value="restaurant">Restaurant</option>
        </select>
        <input placeholder="Score (1-5)" value={score} onChange={e=>setScore(e.target.value)} required />
        <input placeholder="Comment" value={comment} onChange={e=>setComment(e.target.value)} />
        <button type="submit">Create Rating</button>
      </form>

      <table>
        <thead><tr><th>ID</th><th>User</th><th>Target</th><th>Score</th><th>Comment</th><th>Timestamp</th><th>Action</th></tr></thead>
  <tbody>{list.map(r=> (<tr key={r.rating_id}><td>{r.rating_id}</td><td>{r.user_id}</td><td>{r.target_type}:{r.target_id}</td><td>{r.score}</td><td>{r.comment}</td><td>{r.timestamp}</td><td><button onClick={async ()=>{ if(confirm('Delete rating?')){ try{ await apiDelete(`/api/ratings/${r.rating_id}`); fetchList() }catch(err){ console.error('delete rating error', err); alert('Delete failed: '+(err.message||err)) } } }}>Delete</button></td></tr>))}</tbody>
      </table>
    </div>
  )
}
