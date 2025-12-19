import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiGet } from '../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalRides: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [recentRides, setRecentRides] = useState([])
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const users = await apiGet('/api/users/list')
      const drivers = await apiGet('/api/drivers/list')
      const rides = await apiGet('/api/rides/list')
      const orders = await apiGet('/api/orders/list')
      
      // Calculate total revenue
      const rideRevenue = rides.reduce((sum, r) => sum + parseFloat(r.fare || 0), 0)
      const orderRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
      
      setStats({
        totalUsers: users.length,
        totalDrivers: drivers.length,
        totalRides: rides.length,
        totalOrders: orders.length,
        totalRevenue: rideRevenue + orderRevenue,
      })
      
      // Get recent rides and orders (last 5)
      setRecentRides(rides.slice(-5).reverse())
      setRecentOrders(orders.slice(-5).reverse())
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div className="grid grid-4 mt-20">
        <div className="stat-card">
          <p>Total Users</p>
          <h3>{stats.totalUsers}</h3>
        </div>
        <div className="stat-card">
          <p>Total Drivers</p>
          <h3>{stats.totalDrivers}</h3>
        </div>
        <div className="stat-card">
          <p>Total Rides</p>
          <h3>{stats.totalRides}</h3>
        </div>
        <div className="stat-card">
          <p>Total Orders</p>
          <h3>{stats.totalOrders}</h3>
        </div>
      </div>

      <div className="card mt-20">
        <h2>Revenue</h2>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{stats.totalRevenue.toFixed(2)}</p>
      </div>

      <div className="grid grid-2 mt-20">
        <div className="card">
          <h2>Quick Actions</h2>
          <Link href="/book-ride"><button>Book a Ride</button></Link>
          <Link href="/order-food"><button>Order Food</button></Link>
          <Link href="/users"><button>Manage Users</button></Link>
          <Link href="/drivers"><button>Manage Drivers</button></Link>
        </div>

        <div className="card">
          <h2>Recent Rides</h2>
          {recentRides.length === 0 ? (
            <p>No recent rides</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Fare</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map(r => (
                  <tr key={r.ride_id}>
                    <td>{r.ride_id}</td>
                    <td>{r.source}</td>
                    <td>{r.destination}</td>
                    <td>₹{r.fare}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card mt-20">
        <h2>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p>No recent orders</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Restaurant ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.order_id}>
                  <td>{o.order_id}</td>
                  <td>{o.user_id}</td>
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
    </div>
  )
}
