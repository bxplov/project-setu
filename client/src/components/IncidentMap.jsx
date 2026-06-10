import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocketStore } from '../stores/socketStore';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different incident types
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const ICONS = {
  SOS: createIcon('red'),
  FIRE: createIcon('orange'),
  MEDICAL: createIcon('blue'),
  OTHER: createIcon('grey')
};

const API_URL = import.meta.env.PROD ? '' : `http://${window.location.hostname}:3000`;

export default function IncidentMap({ interactive = true, customZoom = null, customCenter = null }) {
  const [incidents, setIncidents] = useState([]);
  const { user, socket } = useSocketStore();
  const defaultCenter = [20.5937, 78.9629]; // Default center (India)

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/incidents`);
        if (res.ok) {
          const data = await res.json();
          // Filter incidents that have valid coordinates
          setIncidents(data.filter(inc => inc.coordinates && typeof inc.coordinates.lat === 'number'));
        }
      } catch (err) {
        console.error('Failed to fetch incidents', err);
      }
    };

    fetchIncidents();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewIncident = (incident) => {
      if (incident.coordinates && typeof incident.coordinates.lat === 'number') {
        setIncidents(prev => [incident, ...prev]);
      }
    };

    socket.on('incident:new', handleNewIncident);

    return () => {
      socket.off('incident:new', handleNewIncident);
    };
  }, [socket]);

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={customCenter ? [customCenter.lat, customCenter.lng] : (incidents.length > 0 ? [incidents[0].coordinates.lat, incidents[0].coordinates.lng] : defaultCenter)} 
        zoom={customZoom !== null ? customZoom : (incidents.length > 0 ? 12 : 5)}  
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        zoomControl={false}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {incidents.map((inc) => (
          <Marker 
            key={inc._id} 
            position={[inc.coordinates.lat, inc.coordinates.lng]}
            icon={ICONS[inc.type] || ICONS.OTHER}
          >
            <Popup>
              <div className="font-sans text-sm">
                <div className="font-bold border-b pb-1 mb-1 border-gray-200">
                  <span className={`px-2 py-0.5 text-xs text-white rounded ${
                    inc.type === 'SOS' ? 'bg-red-600' :
                    inc.type === 'FIRE' ? 'bg-orange-500' :
                    inc.type === 'MEDICAL' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {inc.type}
                  </span>
                </div>
                <div><strong>Reporter ID:</strong> {inc.reporterId}</div>
                <div><strong>Time:</strong> {new Date(inc.createdAt).toLocaleTimeString()}</div>
                <div><strong>Status:</strong> {inc.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
