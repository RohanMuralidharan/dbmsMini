import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

export default function Map({ source, destination, drivers = [] }) {
  // Default coordinates (center of map)
  const center = [12.9716, 77.5946] // Bangalore
  
  // Parse coordinates
  const sourceCoords = source ? parseCoords(source) : null
  const destCoords = destination ? parseCoords(destination) : null
  
  // Calculate center between source and destination
  const mapCenter = sourceCoords && destCoords 
    ? [(sourceCoords[0] + destCoords[0]) / 2, (sourceCoords[1] + destCoords[1]) / 2]
    : sourceCoords || center

  return (
    <div className="map-container">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Source marker */}
        {sourceCoords && (
          <Marker position={sourceCoords}>
            <Popup>Source: {source}</Popup>
          </Marker>
        )}
        
        {/* Destination marker */}
        {destCoords && (
          <Marker position={destCoords}>
            <Popup>Destination: {destination}</Popup>
          </Marker>
        )}
        
        {/* Route line */}
        {sourceCoords && destCoords && (
          <Polyline 
            positions={[sourceCoords, destCoords]} 
            color="blue" 
            weight={3}
          />
        )}
        
        {/* Driver markers */}
        {drivers.map((driver, idx) => {
          const driverCoords = parseCoords(driver.location)
          if (!driverCoords) return null
          return (
            <Marker key={idx} position={driverCoords}>
              <Popup>
                Driver: {driver.name}<br/>
                Status: {driver.status}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

// Helper function to parse location string to coordinates
// Format: "lat,lng" or just a location name (returns default coords)
function parseCoords(location) {
  if (!location) return null
  
  // If it's already in "lat,lng" format
  if (location.includes(',')) {
    const parts = location.split(',').map(p => parseFloat(p.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts
    }
  }
  
  // Mock coordinates for common location names
  const mockLocations = {
    'koramangala': [12.9352, 77.6245],
    'indiranagar': [12.9716, 77.6412],
    'whitefield': [12.9698, 77.7500],
    'jayanagar': [12.9250, 77.5838],
    'mg road': [12.9750, 77.6060],
    'banashankari': [12.9250, 77.5480],
    'airport': [13.1986, 77.7066],
  }
  
  const normalized = location.toLowerCase().trim()
  return mockLocations[normalized] || [12.9716, 77.5946] // Default to Bangalore center
}
