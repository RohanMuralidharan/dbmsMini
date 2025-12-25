const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001'

async function handleResponse(res){
  if (!res) throw new Error('No response')
  const text = await res.text()
  try { const data = text ? JSON.parse(text) : null; if (!res.ok) { const msg = data && data.message ? data.message : `HTTP ${res.status}`; const err = new Error(msg); err.status = res.status; err.data = data; throw err } return data } catch(e) { // if JSON.parse fails, still check status
    if (!res.ok) { const err = new Error(`HTTP ${res.status}: ${text}`); err.status = res.status; err.data = text; throw err }
    // parsed error while parsing but response OK -> return raw text
    return text
  }
}

export async function apiPost(path, body){
  try{
    const res = await fetch(BASE + path, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)})
    return await handleResponse(res)
  }catch(err){
    console.error('apiPost error', path, err)
    throw err
  }
}

export async function apiGet(path){
  try{
    const res = await fetch(BASE + path)
    return await handleResponse(res)
  }catch(err){
    console.error('apiGet error', path, err)
    throw err
  }
}

export async function apiDelete(path){
  try{
    const res = await fetch(BASE + path, {method: 'DELETE'})
    return await handleResponse(res)
  }catch(err){
    console.error('apiDelete error', path, err)
    throw err
  }
}
