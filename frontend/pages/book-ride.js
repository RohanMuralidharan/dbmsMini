import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { apiGet, apiPost } from '../lib/api'

// Dynamic import for Map to avoid SSR issues
const Map = dynamic(() => import('../components/Map'), { ssr: false })

export default function BookRide() {
  const [userId, setUserId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [fare, setFare] = useState('')
  
  const [users, setUsers] = useState([])
  const [drivers, setDrivers] = useState([])
  const [availableDrivers, setAvailableDrivers] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const usersData = await apiGet('/api/users/list')
      const driversData = await apiGet('/api/drivers/list')
      
      setUsers(Array.isArray(usersData) ? usersData : [])
      
      const driversList = Array.isArray(driversData) ? driversData : []
      setDrivers(driversList)
      setAvailableDrivers(driversList.filter(d => d.status === 'available'))
    } catch (err) {
      console.error('Failed to fetch data:', err)
      alert('Failed to load users or drivers. Please try again.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    // Calculate fare based on distance (mock calculation)
    const calculatedFare = fare || calculateFare(source, destination)
    
    try {
      await apiPost('/api/rides/create', {
        user_id: parseInt(userId, 10),
        driver_id: parseInt(driverId, 10),
        source,
        destination,
        fare: parseFloat(calculatedFare)
      })
      
      alert('Ride booked successfully!')
      
      // Reset form
      setUserId('')
      setDriverId('')
      setSource('')
      setDestination('')
      setFare('')
    } catch (err) {
      alert('Error booking ride: ' + (err.message || err))
    }
  }

  function calculateFare(src, dest) {
    // Mock fare calculation
    const baseRate = 50
    const perKmRate = 12
    const mockDistance = Math.random() * 15 + 2 // 2-17 km
    return (baseRate + (mockDistance * perKmRate)).toFixed(2)
  }

  return (
    <div>
      <h1>Book a Ride</h1>
      
      <div className="grid grid-2 mt-20">
        <div className="card">
          <h2>Ride Details</h2>
          <form onSubmit={handleSubmit}>
            <label>User</label>
            <select value={userId} onChange={e => setUserId(e.target.value)} required>
              <option value="">Select User</option>
              {users.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  {u.name} (ID: {u.user_id})
                </option>
              ))}
            </select>

            <label>Source Location</label>
            <input 
              placeholder="e.g., Koramangala or 12.9352,77.6245"
              value={source}
              onChange={e => setSource(e.target.value)}
              required
            />

            <label>Destination Location</label>
            <input 
              placeholder="e.g., Indiranagar or 12.9716,77.6412"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              required
            />

            <label>Driver</label>
            <select value={driverId} onChange={e => setDriverId(e.target.value)} required>
              <option value="">Select Driver</option>
              {availableDrivers.map(d => (
                <option key={d.driver_id} value={d.driver_id}>
                  {d.name} - Rating: {d.rating || 'N/A'}
                </option>
              ))}
            </select>

            <label>Fare (₹) - Optional (Auto-calculated)</label>
            <input 
              type="number"
              step="0.01"
              placeholder="Auto-calculated if empty"
              value={fare}
              onChange={e => setFare(e.target.value)}
            />

            <button type="submit">Book Ride</button>
          </form>
        </div>

        <div className="card">
          <h2>Available Drivers ({availableDrivers.length})</h2>
          {availableDrivers.length === 0 ? (
            <p>No drivers available at the moment</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Vehicle</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {availableDrivers.map(d => (
                  <tr key={d.driver_id}>
                    <td>{d.name}</td>
                    <td>{d.vehicle_no || 'N/A'}</td>
                    <td>{d.rating || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card mt-20">
        <h2>Route Map</h2>
        <Map source={source} destination={destination} drivers={availableDrivers} />
        <p style={{ marginTop: '10px', color: '#666' }}>
          <strong>Tip:</strong> Enter locations like "Koramangala", "Indiranagar", "MG Road" or coordinates as "lat,lng"
        </p>
      </div>
    </div>
  )
}
