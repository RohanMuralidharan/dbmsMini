import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '../lib/api'

export default function OrderFood() {
  const [restaurants, setRestaurants] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [cart, setCart] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const restaurantsData = await apiGet('/api/restaurants/list')
    const usersData = await apiGet('/api/users/list')
    const menuData = await apiGet('/api/menu-items/list')
    
    setRestaurants(restaurantsData)
    setUsers(usersData)
    setMenuItems(menuData)
  }

  function selectRestaurant(restaurant) {
    setSelectedRestaurant(restaurant)
    setCart([]) // Clear cart when switching restaurants
  }

  function addToCart(item) {
    const existing = cart.find(c => c.item_id === item.item_id)
    if (existing) {
      setCart(cart.map(c => 
        c.item_id === item.item_id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  function removeFromCart(itemId) {
    setCart(cart.filter(c => c.item_id !== itemId))
  }

  function updateQuantity(itemId, delta) {
    setCart(cart.map(c => {
      if (c.item_id === itemId) {
        const newQty = c.quantity + delta
        return newQty > 0 ? { ...c, quantity: newQty } : c
      }
      return c
    }).filter(c => c.quantity > 0))
  }

  function getTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  async function placeOrder() {
    if (!selectedUser || cart.length === 0 || !selectedRestaurant) {
      alert('Please select a user, restaurant, and add items to cart')
      return
    }

    try {
      const orderData = {
        user_id: parseInt(selectedUser, 10),
        restaurant_id: selectedRestaurant.restaurant_id,
        total_amount: getTotal()
      }
      
      await apiPost('/api/orders/create', orderData)
      alert('Order placed successfully!')
      
      // Reset
      setCart([])
      setSelectedRestaurant(null)
      setSelectedUser('')
    } catch (err) {
      alert('Error placing order: ' + (err.message || err))
    }
  }

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.cuisine && r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const restaurantMenuItems = selectedRestaurant 
    ? menuItems.filter(m => m.restaurant_id === selectedRestaurant.restaurant_id && m.availability)
    : []

  return (
    <div>
      <h1>Order Food</h1>

      <div className="card mt-20">
        <h2>Select User</h2>
        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
          <option value="">Choose a user</option>
          {users.map(u => (
            <option key={u.user_id} value={u.user_id}>
              {u.name} (Balance: ₹{u.wallet_balance || 0})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-2 mt-20">
        <div>
          <div className="card">
            <h2>Restaurants</h2>
            <input 
              type="text"
              placeholder="Search restaurants or cuisine..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-1 mt-20" style={{ gap: '10px' }}>
            {filteredRestaurants.map(restaurant => (
              <div 
                key={restaurant.restaurant_id}
                className="card"
                style={{ 
                  cursor: 'pointer',
                  border: selectedRestaurant?.restaurant_id === restaurant.restaurant_id ? '2px solid #333' : '1px solid #ddd'
                }}
                onClick={() => selectRestaurant(restaurant)}
              >
                <h3>{restaurant.name}</h3>
                <p>Cuisine: {restaurant.cuisine || 'N/A'}</p>
                <p>Location: {restaurant.location || 'N/A'}</p>
                <p>Rating: {restaurant.rating || 'N/A'} ⭐</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          {selectedRestaurant ? (
            <>
              <div className="card">
                <h2>Menu - {selectedRestaurant.name}</h2>
              </div>

              <div className="grid grid-1 mt-20" style={{ gap: '10px' }}>
                {restaurantMenuItems.length === 0 ? (
                  <div className="card">
                    <p>No menu items available</p>
                  </div>
                ) : (
                  restaurantMenuItems.map(item => (
                    <div key={item.item_id} className="card" style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{item.name}</strong>
                          <p>₹{item.price}</p>
                        </div>
                        <button 
                          onClick={() => addToCart(item)}
                          style={{ width: 'auto', padding: '5px 15px' }}
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="card">
              <p>Select a restaurant to view menu</p>
            </div>
          )}
        </div>
      </div>

      <div className="card mt-20">
        <h2>Cart ({cart.length} items)</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.item_id}>
                    <td>{item.name}</td>
                    <td>₹{item.price}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <button 
                          onClick={() => updateQuantity(item.item_id, -1)}
                          style={{ width: '30px', padding: '2px' }}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.item_id, 1)}
                          style={{ width: '30px', padding: '2px' }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button 
                        onClick={() => removeFromCart(item.item_id)}
                        style={{ background: '#d00', width: 'auto', padding: '5px 10px' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <h3>Total: ₹{getTotal().toFixed(2)}</h3>
              <button 
                onClick={placeOrder}
                style={{ width: 'auto', padding: '10px 30px', marginTop: '10px' }}
                disabled={!selectedUser}
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
