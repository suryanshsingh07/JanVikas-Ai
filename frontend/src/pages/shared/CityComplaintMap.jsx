import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Filter, X, AlertCircle, CheckCircle2, Clock,
  Wrench, XCircle, Eye, ChevronDown, RefreshCw, BarChart3
} from 'lucide-react';
import api from '../../services/api';
import 'leaflet/dist/leaflet.css';

/* ─── Status Config ───────────────────────────────────────── */
const STATUS_CONFIG = {
  pending:     { label: 'Pending',            color: '#f59e0b', hex: 'text-amber-500',   bg: 'bg-amber-100 dark:bg-amber-900/30',   icon: Clock },
  reviewing:   { label: 'Under Review',       color: '#3b82f6', hex: 'text-blue-500',    bg: 'bg-blue-100 dark:bg-blue-900/30',     icon: Eye },
  approved:    { label: 'Approved for Action',color: '#10b981', hex: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30',icon: CheckCircle2 },
  in_progress: { label: 'Work In Progress',   color: '#8b5cf6', hex: 'text-violet-500',  bg: 'bg-violet-100 dark:bg-violet-900/30', icon: Wrench },
  resolved:    { label: 'Resolved',           color: '#6b7280', hex: 'text-gray-500',    bg: 'bg-gray-100 dark:bg-gray-800',        icon: CheckCircle2 },
  rejected:    { label: 'Rejected',           color: '#ef4444', hex: 'text-red-500',     bg: 'bg-red-100 dark:bg-red-900/30',       icon: XCircle },
};

const CATEGORY_ICONS = {
  roads: '🛣️', water: '💧', electricity: '⚡', education: '🎓',
  health: '🏥', sanitation: '🧹', agriculture: '🌾', housing: '🏠',
  employment: '💼', environment: '🌿', security: '🛡️', transport: '🚌', other: '📋',
};

/* ─── Stats Panel ────────────────────────────────────────── */
const StatsPanel = ({ submissions }) => {
  const counts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = submissions.filter(s => s.status === key).length;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
        const Icon = cfg.icon;
        return (
          <div key={key} className={`flex items-center gap-2 p-2 rounded-lg ${cfg.bg}`}>
            <Icon size={14} className={cfg.hex} />
            <div>
              <p className="text-xs text-gray-500">{cfg.label}</p>
              <p className={`text-base font-bold ${cfg.hex}`}>{counts[key] || 0}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Map Recenter helper ────────────────────────────────── */
const RecenterButton = ({ center }) => {
  const map = useMap();
  return (
    <button
      onClick={() => map.setView(center, 11)}
      className="absolute bottom-4 right-4 z-[1000] p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-border hover:bg-surfaceHover transition-colors"
      title="Reset view"
    >
      <RefreshCw size={16} />
    </button>
  );
};

/* ─── Main Component ─────────────────────────────────────── */
const CityComplaintMap = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const defaultCenter = [20.5937, 78.9629]; // India center

  const fetchMapData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/submissions/map');
      setSubmissions(res.data || []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMapData(); }, [fetchMapData]);

  // Apply filters
  useEffect(() => {
    let result = submissions;
    if (filterStatus !== 'all') result = result.filter(s => s.status === filterStatus);
    if (filterCategory !== 'all') result = result.filter(s => s.category === filterCategory);
    setFiltered(result);
  }, [submissions, filterStatus, filterCategory]);

  const withCoords = filtered.filter(s =>
    s.location?.coordinates?.length === 2 &&
    s.location.coordinates[0] !== 0 &&
    s.location.coordinates[1] !== 0
  );

  const categories = [...new Set(submissions.map(s => s.category))];

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Map size={22} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">City Complaint Map</h1>
            <p className="text-sm text-gray-500">
              {withCoords.length} complaints visible · {submissions.length} total
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors"
          >
            <Filter size={15} />
            Filters
            {(filterStatus !== 'all' || filterCategory !== 'all') && (
              <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center">
                {(filterStatus !== 'all' ? 1 : 0) + (filterCategory !== 'all' ? 1 : 0)}
              </span>
            )}
            <ChevronDown size={14} />
          </button>
          <button
            onClick={fetchMapData}
            className="p-2 bg-surface border border-border rounded-lg hover:bg-surfaceHover transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-surface border border-border rounded-xl"
          >
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filterStatus === 'all' ? 'bg-primary-500 text-white border-primary-500' : 'border-border hover:bg-surfaceHover'}`}
                  >
                    All
                  </button>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setFilterStatus(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filterStatus === key ? `${cfg.bg} border-current ${cfg.hex}` : 'border-border hover:bg-surfaceHover'}`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              {categories.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filterCategory === 'all' ? 'bg-primary-500 text-white border-primary-500' : 'border-border hover:bg-surfaceHover'}`}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filterCategory === cat ? 'bg-primary-500 text-white border-primary-500' : 'border-border hover:bg-surfaceHover'}`}
                      >
                        {CATEGORY_ICONS[cat] || '📋'} {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {(filterStatus !== 'all' || filterCategory !== 'all') && (
                <button
                  onClick={() => { setFilterStatus('all'); setFilterCategory('all'); }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 mt-auto"
                >
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="p-4 bg-surface border border-border rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={15} className="text-gray-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Complaint Statistics</span>
        </div>
        <StatsPanel submissions={submissions} />
      </div>

      {/* Map */}
      <div className="flex-1 rounded-xl overflow-hidden border border-border shadow-sm relative" style={{ minHeight: 420 }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface z-10">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={32} className="animate-spin text-primary-500" />
              <p className="text-sm text-gray-500">Loading complaint data…</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {withCoords.map((s) => {
              const [lng, lat] = s.location.coordinates;
              const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
              return (
                <CircleMarker
                  key={s._id}
                  center={[lat, lng]}
                  radius={8}
                  pathOptions={{
                    color: cfg.color,
                    fillColor: cfg.color,
                    fillOpacity: 0.75,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <p className="font-semibold text-sm leading-snug mb-1">{s.title}</p>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: cfg.color + '22', color: cfg.color }}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-gray-500">{CATEGORY_ICONS[s.category]} {s.category}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {s.location?.address || s.location?.district || 'Location on map'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(s.createdAt).toLocaleDateString('en-IN')} · {s.votes || 0} votes
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
            <RecenterButton center={defaultCenter} />
          </MapContainer>
        )}

        {/* No coords notice */}
        {!loading && withCoords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-sm z-10">
            <div className="text-center p-6">
              <AlertCircle size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-gray-500">No complaints with location data</p>
              <p className="text-sm text-gray-400 mt-1">Complaints submitted with location will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 p-3 bg-surface border border-border rounded-xl">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider self-center">Legend:</span>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: cfg.color }}
            />
            <span className="text-gray-600 dark:text-gray-400">{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CityComplaintMap;
