import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Calendar, IndianRupee, Filter, Search,
  Clock, CheckCircle2, XCircle, ChevronRight, Plus, Building2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

/* ─── Status Config ───────────────────────────────────────── */
const STATUS_CFG = {
  open:      { label: 'Open',       color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle2 },
  closed:    { label: 'Closed',     color: 'text-gray-500',    bg: 'bg-gray-100 dark:bg-gray-800',          icon: XCircle },
  awarded:   { label: 'Awarded',    color: 'text-blue-600',    bg: 'bg-blue-100 dark:bg-blue-900/30',       icon: CheckCircle2 },
  cancelled: { label: 'Cancelled',  color: 'text-red-500',     bg: 'bg-red-100 dark:bg-red-900/30',         icon: XCircle },
  draft:     { label: 'Draft',      color: 'text-orange-500',  bg: 'bg-orange-100 dark:bg-orange-900/30',   icon: Clock },
};

const CATEGORY_ICONS = {
  roads: '🛣️', water: '💧', electricity: '⚡', education: '🎓',
  health: '🏥', sanitation: '🧹', agriculture: '🌾', housing: '🏠',
  employment: '💼', environment: '🌿', security: '🛡️', transport: '🚌', other: '📋',
};

/* ─── Tender Card ─────────────────────────────────────────── */
const TenderCard = ({ tender, index }) => {
  const cfg = STATUS_CFG[tender.status] || STATUS_CFG.open;
  const Icon = cfg.icon;
  const daysLeft = tender.deadline
    ? Math.max(0, Math.ceil((new Date(tender.deadline) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/tenders/${tender._id}`} className="block group">
        <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary-400 hover:shadow-md transition-all duration-200 group-hover:shadow-primary-500/10">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{CATEGORY_ICONS[tender.category] || '📋'}</span>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                <Icon size={11} />
                {cfg.label}
              </div>
            </div>
            {daysLeft !== null && tender.status === 'open' && (
              <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                daysLeft <= 3 ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                daysLeft <= 7 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                'bg-surface border border-border text-gray-500'
              }`}>
                {daysLeft === 0 ? 'Closes today!' : `${daysLeft}d left`}
              </div>
            )}
          </div>

          <h3 className="font-semibold text-base leading-snug mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
            {tender.title}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{tender.description}</p>

          <div className="flex flex-wrap gap-3 text-sm">
            {tender.estimatedBudget && (
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <IndianRupee size={13} />
                {(tender.estimatedBudget / 100000).toFixed(1)}L
              </span>
            )}
            {tender.deadline && (
              <span className="flex items-center gap-1 text-gray-500">
                <Calendar size={13} />
                {new Date(tender.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
            {tender.location?.district && (
              <span className="text-gray-500">{tender.location.district}, {tender.location.state}</span>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Building2 size={12} />
              {tender.createdBy?.name || 'Department'}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {tender.proposals?.length || 0} proposals
              <ChevronRight size={14} className="text-primary-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* ─── Main Component ─────────────────────────────────────── */
const TenderList = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTenders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;
      if (search) params.search = search;
      const res = await api.get('/tenders', { params });
      setTenders(res.data || []);
      setTotalPages(res.pagination?.pages || 1);
    } catch {
      setTenders([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterCategory, search]);

  useEffect(() => { fetchTenders(); }, [fetchTenders]);

  const canCreateTender = ['department', 'admin'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Tenders & Proposals</h1>
          <p className="text-sm text-gray-500 mt-0.5">Government tenders open for proposals</p>
        </div>
        {canCreateTender && (
          <Link
            to="/department/tenders/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} /> New Tender
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search tenders…"
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          {Object.keys(CATEGORY_ICONS).map(cat => (
            <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 bg-surface border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tenders.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-500 font-medium">No tenders found</p>
          {canCreateTender && (
            <Link to="/department/tenders/new"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary-500 hover:underline">
              <Plus size={14} /> Create the first tender
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenders.map((t, i) => <TenderCard key={t._id} tender={t} index={i} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page ? 'bg-primary-500 text-white' : 'bg-surface border border-border hover:bg-surfaceHover'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TenderList;
