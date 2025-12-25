import { useState, useEffect } from 'react'
import { apiGet } from '../lib/api'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Analytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalRestaurants: 0,
    totalRides: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  
  const [topDrivers, setTopDrivers] = useState([])
  const [topRestaurants, setTopRestaurants] = useState([])
  const [revenueData, setRevenueData] = useState([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    try {
      const users = await apiGet('/api/users/list')
      const drivers = await apiGet('/api/drivers/list')
      const restaurants = await apiGet('/api/restaurants/list')
      const rides = await apiGet('/api/rides/list')
      const orders = await apiGet('/api/orders/list')
      
      // Calculate revenue
      const rideRevenue = rides.reduce((sum, r) => sum + parseFloat(r.fare || 0), 0)
      const orderRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
      
      setStats({
        totalUsers: users.length,
        totalDrivers: drivers.length,
        totalRestaurants: restaurants.length,
        totalRides: rides.length,
        totalOrders: orders.length,
        totalRevenue: rideRevenue + orderRevenue,
      })
      
      // Top drivers by number of rides
      const driverRideCounts = {}
      rides.forEach(r => {
        driverRideCounts[r.driver_id] = (driverRideCounts[r.driver_id] || 0) + 1
      })
      
      const topDriversList = Object.entries(driverRideCounts)
        .map(([driverId, count]) => {
          const driver = drivers.find(d => d.driver_id === parseInt(driverId))
          return {
            name: driver ? driver.name : `Driver ${driverId}`,
            rides: count,
            rating: driver ? driver.rating : 0
          }
        })
        .sort((a, b) => b.rides - a.rides)
        .slice(0, 5)
      
      setTopDrivers(topDriversList)
      
      // Top restaurants by number of orders
      const restaurantOrderCounts = {}
      orders.forEach(o => {
        restaurantOrderCounts[o.restaurant_id] = (restaurantOrderCounts[o.restaurant_id] || 0) + 1
      })
      
      const topRestaurantsList = Object.entries(restaurantOrderCounts)
        .map(([restaurantId, count]) => {
          const restaurant = restaurants.find(r => r.restaurant_id === parseInt(restaurantId))
          return {
            name: restaurant ? restaurant.name : `Restaurant ${restaurantId}`,
            orders: count,
            rating: restaurant ? restaurant.rating : 0
          }
        })
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5)
      
      setTopRestaurants(topRestaurantsList)
      
      // Mock revenue data (in real app, would aggregate by date)
      const mockRevenueData = [
        { month: 'Jan', rides: 4500, orders: 3200 },
        { month: 'Feb', rides: 5200, orders: 3800 },
        { month: 'Mar', rides: 6100, orders: 4200 },
        { month: 'Apr', rides: 5800, orders: 4500 },
        { month: 'May', rides: 7200, orders: 5100 },
        { month: 'Jun', rides: 8100, orders: 5800 },
      ]
      setRevenueData(mockRevenueData)
      
    } catch (err) {
      console.error('Error fetching analytics:', err)
    }
  }

  return (
    <div>
      <h1>Analytics Dashboard</h1>

      <div className="grid grid-3 mt-20">
        <div className="stat-card">
          <p>Total Users</p>
          <h3>{stats.totalUsers}</h3>
        </div>
        <div className="stat-card">
          <p>Total Drivers</p>
          <h3>{stats.totalDrivers}</h3>
        </div>
        <div className="stat-card">
          <p>Total Restaurants</p>
          <h3>{stats.totalRestaurants}</h3>
        </div>
      </div>

      <div className="grid grid-3 mt-20">
        <div className="stat-card">
          <p>Total Rides</p>
          <h3>{stats.totalRides}</h3>
        </div>
        <div className="stat-card">
          <p>Total Orders</p>
          <h3>{stats.totalOrders}</h3>
        </div>
        <div className="stat-card">
          <p>Total Revenue</p>
          <h3>₹{stats.totalRevenue.toFixed(2)}</h3>
        </div>
      </div>

      <div className="card mt-20">
        <h2>Revenue Trends (Mock Data)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="rides" stroke="#333" name="Ride Revenue" />
            <Line type="monotone" dataKey="orders" stroke="#666" name="Order Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-2 mt-20">
        <div className="card">
          <h2>Top Drivers (by rides)</h2>
          {topDrivers.length === 0 ? (
            <p>No data available</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topDrivers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rides" fill="#333" />
                </BarChart>
              </ResponsiveContainer>
              
              <table className="mt-20">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Rides</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topDrivers.map((d, idx) => (
                    <tr key={idx}>
                      <td>{d.name}</td>
                      <td>{d.rides}</td>
                      <td>{d.rating || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="card">
          <h2>Top Restaurants (by orders)</h2>
          {topRestaurants.length === 0 ? (
            <p>No data available</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topRestaurants}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#666" />
                </BarChart>
              </ResponsiveContainer>
              
              <table className="mt-20">
                <thead>
                  <tr>
                    <th>Restaurant</th>
                    <th>Orders</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topRestaurants.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.name}</td>
                      <td>{r.orders}</td>
                      <td>{r.rating || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
