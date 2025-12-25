import Link from 'next/link'

export default function Layout({ children }) {
  return (
    <>
      <nav>
        <div className="container">
          <h1>Multi-Service Platform</h1>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/book-ride">Book Ride</Link></li>
            <li><Link href="/order-food">Order Food</Link></li>
            <li><Link href="/profile">Profile</Link></li>
            <li><Link href="/analytics">Analytics</Link></li>
          </ul>
        </div>
      </nav>
      <main className="container">
        {children}
      </main>
      <footer style={{ borderTop: '1px solid #ddd', padding: '20px', marginTop: '40px', textAlign: 'center' }}>
        <p>&copy; 2025 Multi-Service Platform - DBMS Mini Project</p>
      </footer>
    </>
  )
}
