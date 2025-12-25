import Link from 'next/link'

export default function Home(){
  return (
    <div>
      <h1>Multi-Service Platform</h1>
      <p>Welcome to the Multi-Service Platform - A unified solution for ride-hailing and food ordering</p>

      <div className="grid grid-2 mt-20">
        <div className="card">
          <h2>Main Features</h2>
          <Link href="/dashboard"><button> Dashboard</button></Link>
          <Link href="/book-ride"><button> Book a Ride</button></Link>
          <Link href="/order-food"><button> Order Food</button></Link>
          <Link href="/profile"><button> User Profile</button></Link>
          <Link href="/analytics"><button> Analytics</button></Link>
        </div>

        <div className="card">
          <h2>Data Management</h2>
          <Link href="/users"><button>Users</button></Link>
          <Link href="/drivers"><button>Drivers</button></Link>
          <Link href="/restaurants"><button>Restaurants</button></Link>
          <Link href="/menu-items"><button>Menu Items</button></Link>
          <Link href="/delivery-partners"><button>Delivery Partners</button></Link>
        </div>
      </div>

      <div className="grid grid-2 mt-20">
        <div className="card">
          <h2>Transactions</h2>
          <Link href="/rides"><button>All Rides</button></Link>
          <Link href="/orders"><button>All Orders</button></Link>
          <Link href="/payments"><button>Payments</button></Link>
          <Link href="/ratings"><button>Ratings</button></Link>
        </div>

        <div className="card">
          <h2>About This Project</h2>
          <p><strong>DBMS Mini Project</strong></p>
          <p>This project aims to simulate a multi-service platform demonstrating database management for ride-hailing annd food ordering services.</p>
          <p><strong>Features:</strong></p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>Interactive map visualization for rides</li>
            <li>Restaurant browsing and food ordering</li>
            <li>User profile and history tracking</li>
            <li>Admin analytics dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
