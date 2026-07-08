import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, FileText, Edit3, Trash2, Eye, ChevronRight, Calendar,
  IndianRupee, Users, CheckCircle2, XCircle, Clock, ArrowLeft, Save, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['roads','water','electricity','education','health','sanitation','agriculture','housing','employment','environment','security','transport','other'];
const STATUS_CFG = {
  draft:     { label: 'Draft',    color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  open:      { label: 'Open',     color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  closed:    { label: 'Closed',   color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
  awarded:   { label: 'Awarded',  color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  cancelled: { label: 'Cancelled',color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
};

/* ─── Tender Form (Create/Edit) ──────────────────────────── */
const TenderForm = ({ tenderId, onSaved }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!tenderId);
  const [form, setForm] = useState({
    title: '', description: '', category: 'roads', status: 'open',
    estimatedBudget: '', deadline: '', location: { district: '', state: '' },
    eligibility: '', eligibleRoles: ['ngo', 'citizen'],
    referenceNumber: '', projectStart: '', projectEnd: '',
  });

  useEffect(() => {
    if (tenderId) {
      api.get(`/tenders/${tenderId}`).then(res => {
        const t = res.tender;
        setForm({
          title: t.title || '',
          description: t.description || '',
          category: t.category || 'roads',
          status: t.status || 'open',
          estimatedBudget: t.estimatedBudget || '',
          deadline: t.deadline ? t.deadline.slice(0, 10) : '',
          location: t.location || { district: '', state: '' },
          eligibility: t.eligibility || '',
          eligibleRoles: t.eligibleRoles || ['ngo', 'citizen'],
          referenceNumber: t.referenceNumber || '',
          projectStart: t.timeline?.projectStart ? t.timeline.projectStart.slice(0, 10) : '',
          projectEnd: t.timeline?.projectEnd ? t.timeline.projectEnd.slice(0, 10) : '',
        });
      }).finally(() => setFetching(false));
    }
  }, [tenderId]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setLoc = (field, value) => setForm(f => ({ ...f, location: { ...f.location, [field]: value } }));

  const toggleRole = (role) => {
    setForm(f => ({
      ...f,
      eligibleRoles: f.eligibleRoles.includes(role)
        ? f.eligibleRoles.filter(r => r !== role)
        : [...f.eligibleRoles, role],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.deadline) {
      toast.error('Title and deadline are required');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, estimatedBudget: Number(form.estimatedBudget) || 0 };
      if (tenderId) {
        await api.put(`/tenders/${tenderId}`, payload);
        toast.success('Tender updated!');
      } else {
        await api.post('/tenders', payload);
        toast.success('Tender created!');
      }
      onSaved?.();
      navigate('/department/tenders');
    } catch {
      // error shown by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex justify-center py-12">
      <span className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate('/department/tenders')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-foreground">
        <ArrowLeft size={16} /> Back to My Tenders
      </button>
      <h1 className="text-xl font-display font-bold">{tenderId ? 'Edit Tender' : 'Create New Tender'}</h1>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            placeholder="Tender title…" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Description *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            rows={4} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Detailed tender description…" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
              {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
              {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Estimated Budget (₹)</label>
            <input type="number" value={form.estimatedBudget} onChange={e => set('estimatedBudget', e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. 5000000" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Deadline *</label>
            <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">District</label>
            <input value={form.location.district} onChange={e => setLoc('district', e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              placeholder="District" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">State</label>
            <input value={form.location.state} onChange={e => setLoc('state', e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              placeholder="State" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Reference Number</label>
          <input value={form.referenceNumber} onChange={e => set('referenceNumber', e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. TDR/2026/001" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Eligibility Criteria</label>
          <textarea value={form.eligibility} onChange={e => set('eligibility', e.target.value)}
            rows={2} className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Who can apply for this tender…" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Who Can Propose</label>
          <div className="flex gap-2 flex-wrap">
            {['citizen', 'ngo', 'officer'].map(role => (
              <button key={role} type="button" onClick={() => toggleRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                  form.eligibleRoles.includes(role)
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-border hover:bg-surfaceHover'
                }`}>
                {role}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          {tenderId ? 'Save Changes' : 'Publish Tender'}
        </button>
      </div>
    </div>
  );
};

/* ─── Main List Component ────────────────────────────────── */
const DepartmentTenders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { action, id } = useParams();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTenders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenders/mine');
      setTenders(res.data || []);
    } catch {
      setTenders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMyTenders(); }, [fetchMyTenders]);

  const handleDelete = async (tenderId) => {
    if (!window.confirm('Delete this tender?')) return;
    try {
      await api.delete(`/tenders/${tenderId}`);
      toast.success('Tender deleted');
      fetchMyTenders();
    } catch {
      // error shown by interceptor
    }
  };

  // Show form if create/edit
  if (action === 'new') return <TenderForm onSaved={fetchMyTenders} />;
  if (action === 'edit' && id) return <TenderForm tenderId={id} onSaved={fetchMyTenders} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">My Tenders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage tenders you've created</p>
        </div>
        <button onClick={() => navigate('/department/tenders/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> New Tender
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tenders.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-500 font-medium">No tenders yet</p>
          <button onClick={() => navigate('/department/tenders/new')}
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary-500 hover:underline">
            <Plus size={14} /> Create your first tender
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tenders.map((tender, i) => {
            const cfg = STATUS_CFG[tender.status] || STATUS_CFG.draft;
            const pendingProposals = tender.proposals?.filter(p => p.status === 'pending').length || 0;
            return (
              <motion.div key={tender._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {pendingProposals > 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          {pendingProposals} new proposals
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold truncate">{tender.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {tender.estimatedBudget && (
                        <span className="flex items-center gap-1">
                          <IndianRupee size={11} />
                          {(tender.estimatedBudget / 100000).toFixed(1)}L
                        </span>
                      )}
                      {tender.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(tender.deadline).toLocaleDateString('en-IN')}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {tender.proposals?.length || 0} proposals
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/tenders/${tender._id}`}
                      className="p-2 bg-surface border border-border rounded-lg hover:bg-surfaceHover transition-colors"
                      title="View">
                      <Eye size={15} />
                    </Link>
                    <button onClick={() => navigate(`/department/tenders/edit/${tender._id}`)}
                      className="p-2 bg-surface border border-border rounded-lg hover:bg-surfaceHover transition-colors"
                      title="Edit">
                      <Edit3 size={15} />
                    </button>
                    {user?.role === 'admin' && (
                      <button onClick={() => handleDelete(tender._id)}
                        className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                        title="Delete">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DepartmentTenders;
