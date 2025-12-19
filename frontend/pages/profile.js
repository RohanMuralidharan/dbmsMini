import { useState, useEffect } from 'react'
import { apiGet } from '../lib/api'

export default function Profile() {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [userInfo, setUserInfo] = useState(null)
  const [userRides, setUserRides] = useState([])
  const [userOrders, setUserOrders] = useState([])

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedUserId) {
      fetchUserData()
    }
  }, [selectedUserId])

  async function fetchUsers() {
    const usersData = await apiGet('/api/users/list')
    setUsers(usersData)
    if (usersData.length > 0) {
      setSelectedUserId(usersData[0].user_id.toString())
    }
  }

  async function fetchUserData() {
    const allRides = await apiGet('/api/rides/list')
    const allOrders = await apiGet('/api/orders/list')
    
    const userId = parseInt(selectedUserId, 10)
    const user = users.find(u => u.user_id === userId)
    const rides = allRides.filter(r => r.user_id === userId)
    const orders = allOrders.filter(o => o.user_id === userId)
    
    setUserInfo(user)
    setUserRides(rides)
    setUserOrders(orders)
  }

  if (!userInfo && users.length === 0) {
    return <div><h1>Profile</h1><p>Loading...</p></div>
  }

  const totalSpent = 
    userRides.reduce((sum, r) => sum + parseFloat(r.fare || 0), 0) +
    userOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)

  return (
    <div>
      <h1>User Profile</h1>

      <div className="card mt-20">
        <h2>Select User</h2>
        <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
          {users.map(u => (
            <option key={u.user_id} value={u.user_id}>
              {u.name} (ID: {u.user_id})
            </option>
          ))}
        </select>
      </div>

      {userInfo && (
        <>
          <div className="grid grid-3 mt-20">
            <div className="stat-card">
              <p>Total Rides</p>
              <h3>{userRides.length}</h3>
            </div>
            <div className="stat-card">
              <p>Total Orders</p>
              <h3>{userOrders.length}</h3>
            </div>
            <div className="stat-card">
              <p>Total Spent</p>
              <h3>₹{totalSpent.toFixed(2)}</h3>
            </div>
          </div>

          <div className="card mt-20">
            <h2>Personal Information</h2>
            <table>
              <tbody>
                <tr>
                  <th>Name</th>
                  <td>{userInfo.name}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{userInfo.email || 'Not provided'}</td>
                </tr>
                <tr>
                  <th>Phone</th>
                  <td>{userInfo.phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <th>Address</th>
                  <td>{userInfo.address || 'Not provided'}</td>
                </tr>
                <tr>
                  <th>Wallet Balance</th>
                  <td>₹{userInfo.wallet_balance || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card mt-20">
            <h2>Recent Rides</h2>
            {userRides.length === 0 ? (
              <p>No rides yet</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Driver ID</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userRides.slice(-10).reverse().map(r => (
                    <tr key={r.ride_id}>
                      <td>{r.ride_id}</td>
                      <td>{r.source}</td>
                      <td>{r.destination}</td>
                      <td>{r.driver_id}</td>
                      <td>₹{r.fare}</td>
                      <td>{r.status}</td>
                      <td>{r.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card mt-20">
            <h2>Recent Orders</h2>
            {userOrders.length === 0 ? (
              <p>No orders yet</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Restaurant ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userOrders.slice(-10).reverse().map(o => (
                    <tr key={o.order_id}>
                      <td>{o.order_id}</td>
                      <td>{o.restaurant_id}</td>
                      <td>₹{o.total_amount}</td>
                      <td>{o.status}</td>
                      <td>{o.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
