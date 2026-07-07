import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Filter, MapPin } from 'lucide-react';
import L from 'leaflet';
import { submissionService } from '../../services/submissionService';
import { useAuth } from '../../hooks/useAuth';
import { getCategory } from '../../utils/helpers';
import { CATEGORIES, SUBMISSION_STATUSES } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Fix for default Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons based on status
const createCustomIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  pending: createCustomIcon('red'),
  reviewing: createCustomIcon('orange'),
  approved: createCustomIcon('blue'),
  in_progress: createCustomIcon('gold'),
  resolved: createCustomIcon('green'),
  rejected: createCustomIcon('grey'),
  default: createCustomIcon('blue'),
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const OfficialMap = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', status: '' });
  
  // Default center (India roughly, or specific state if available)
  const defaultCenter = [20.5937, 78.9629];
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const res = await submissionService.getMapData({
        state: user?.state,
        category: filters.category,
        status: filters.status
      });
      setSubmissions(res.data);
      
      // Center map on first submission if available
      if (res.data.length > 0 && res.data[0].location?.coordinates?.length === 2) {
        // GeoJSON uses [lng, lat], Leaflet uses [lat, lng]
        const coords = res.data[0].location.coordinates;
        setMapCenter([coords[1], coords[0]]);
      }
    } catch (error) {
      console.error("Failed to load map data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [user, filters]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-display font-bold">Geospatial Heatmap</h1>
          <p className="text-gray-500 dark:text-gray-400">Visualize infrastructure gaps and clustered issues across {user?.district}.</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 bg-surface border border-border rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            {SUBMISSION_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-xl overflow-hidden relative border border-border shadow-sm">
        {loading && (
          <div className="absolute inset-0 z-[1000] bg-surface/50 backdrop-blur-sm flex justify-center items-center">
            <LoadingSpinner size="lg" text="Loading Map Data..." />
          </div>
        )}

        <MapContainer 
          center={mapCenter} 
          zoom={10} 
          scrollWheelZoom={true} 
          className="w-full h-full z-10"
        >
          <TileLayer
            attribution={import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; OpenStreetMap contributors'}
            url={import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          />
          <MapUpdater center={mapCenter} />

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
          >
            {submissions.map((sub) => {
              if (!sub.location?.coordinates || sub.location.coordinates.length < 2) return null;
              
              // Leaflet uses Lat, Lng
              const position = [sub.location.coordinates[1], sub.location.coordinates[0]];
              const cat = getCategory(sub.category);
              const icon = icons[sub.status] || icons.default;
              
              // High priority score gets a highlighted circle radius
              const hasHighPriority = sub.aiAnalysis?.priorityScore >= 7;

              return (
                <div key={sub._id}>
                  {hasHighPriority && (
                    <Circle center={position} radius={800} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }} />
                  )}
                  <Marker position={position} icon={icon}>
                    <Popup className="custom-popup">
                      <div className="p-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                          <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs">
                            {cat.label.charAt(0)}
                          </span>
                          <span className="font-semibold text-sm">{cat.label}</span>
                        </div>
                        <h3 className="font-bold mb-1 leading-tight">{sub.title}</h3>
                        <div className="flex justify-between items-center mt-2 text-xs">
                          <span className="text-gray-500 font-medium">{sub.votes} Votes</span>
                          {sub.aiAnalysis?.priorityScore && (
                            <span className="font-bold text-red-600">Score: {sub.aiAnalysis.priorityScore}/10</span>
                          )}
                        </div>
                        <a 
                          href={`/official/submissions?id=${sub._id}`} 
                          className="block text-center w-full mt-3 bg-blue-600 text-white py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                </div>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
        
        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-[400] bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs">
          <h4 className="font-bold mb-2 text-gray-800 dark:text-gray-200 border-b pb-1">Legend</h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Pending</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> In Progress</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Resolved</div>
            <div className="flex items-center gap-2 mt-2 pt-1 border-t"><span className="w-3 h-3 rounded-full bg-red-500 opacity-30 border border-red-500"></span> Critical Priority Area</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialMap;
