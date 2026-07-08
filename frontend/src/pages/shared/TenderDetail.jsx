import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, IndianRupee, MapPin, Building2, FileText,
  CheckCircle2, XCircle, Clock, Send, ChevronDown, ChevronUp,
  Star, User, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_CFG = {
  open:      { label: 'Open for Proposals',  color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle2 },
  closed:    { label: 'Closed',             color: 'text-gray-500',    bg: 'bg-gray-100 dark:bg-gray-800',          icon: XCircle },
  awarded:   { label: 'Awarded',            color: 'text-blue-600',    bg: 'bg-blue-100 dark:bg-blue-900/30',       icon: Star },
  cancelled: { label: 'Cancelled',          color: 'text-red-500',     bg: 'bg-red-100 dark:bg-red-900/30',         icon: XCircle },
  draft:     { label: 'Draft',              color: 'text-orange-500',  bg: 'bg-orange-100 dark:bg-orange-900/30',   icon: Clock },
};

const PROPOSAL_CFG = {
  pending:     { label: 'Pending',     color: 'text-amber-600',  bg: 'bg-amber-100 dark:bg-amber-900/30' },
  shortlisted: { label: 'Shortlisted', color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
  approved:    { label: 'Approved',    color: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' },
  rejected:    { label: 'Rejected',    color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30' },
};

/* ─── Submit Proposal Form ───────────────────────────────── */
const SubmitProposalForm = ({ tenderId, onSubmitted }) => {
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [timeline, setTimeline] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) { toast.error('Please provide a proposal description'); return; }
    setLoading(true);
    try {
      await api.post(`/tenders/${tenderId}/propose`, {
        description, estimatedCost: estimatedCost ? Number(estimatedCost) : undefined, timeline,
      });
      toast.success('Proposal submitted successfully!');
      setDescription(''); setEstimatedCost(''); setTimeline('');
      setOpen(false);
      onSubmitted();
    } catch {
      // error shown by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-primary-200 dark:border-primary-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Send size={16} className="text-primary-600 dark:text-primary-400" />
          <span className="font-semibold text-primary-700 dark:text-primary-400">Submit Your Proposal</span>
        </div>
        {open ? <ChevronUp size={16} className="text-primary-500" /> : <ChevronDown size={16} className="text-primary-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Proposal Description *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Describe your approach, methodology, and why you're the best fit…"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={e => setEstimatedCost(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 500000"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Timeline</label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={e => setTimeline(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 3 months"
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || !description.trim()}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                Submit Proposal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Proposal Card (for dept/admin) ────────────────────── */
const ProposalCard = ({ proposal, tenderId, canAct, onAction }) => {
  const cfg = PROPOSAL_CFG[proposal.status] || PROPOSAL_CFG.pending;
  const [actionOpen, setActionOpen] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      await api.patch(`/tenders/${tenderId}/proposals/${proposal._id}`, { action, note });
      toast.success(`Proposal ${action}`);
      setActionOpen(false);
      onAction();
    } catch {
      // error shown by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <User size={14} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-sm">{proposal.proposedBy?.name || 'Anonymous'}</p>
            <p className="text-xs text-gray-500 capitalize">{proposal.proposedBy?.role}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">{proposal.description}</p>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {proposal.estimatedCost && (
          <span className="flex items-center gap-1">
            <IndianRupee size={11} />
            {proposal.estimatedCost.toLocaleString('en-IN')}
          </span>
        )}
        {proposal.timeline && <span>⏱ {proposal.timeline}</span>}
        <span>{new Date(proposal.submittedAt).toLocaleDateString('en-IN')}</span>
      </div>

      {proposal.actionNote && (
        <p className="text-xs text-gray-500 italic border-t border-border pt-2">
          Note: {proposal.actionNote}
        </p>
      )}

      {canAct && proposal.status === 'pending' && (
        <div className="border-t border-border pt-3 space-y-2">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            placeholder="Add a note (optional)…"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={() => handleAction('shortlisted')} disabled={loading}
              className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
              Shortlist
            </button>
            <button onClick={() => handleAction('approved')} disabled={loading}
              className="flex-1 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors">
              Approve & Award
            </button>
            <button onClick={() => handleAction('rejected')} disabled={loading}
              className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────── */
const TenderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTender = async () => {
    try {
      const res = await api.get(`/tenders/${id}`);
      setTender(res.tender);
    } catch {
      toast.error('Tender not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTender(); }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  if (!tender) return null;

  const cfg = STATUS_CFG[tender.status] || STATUS_CFG.open;
  const StatusIcon = cfg.icon;
  const canAct = ['department', 'admin'].includes(user?.role) &&
    tender.createdBy?._id === user?._id || user?.role === 'admin';
  const canPropose = tender.status === 'open' &&
    tender.eligibleRoles?.includes(user?.role);
  const alreadyProposed = tender.proposals?.some(p => p.proposedBy?._id === user?._id);
  const daysLeft = tender.deadline
    ? Math.max(0, Math.ceil((new Date(tender.deadline) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to Tenders
      </button>

      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
            <StatusIcon size={11} />
            {cfg.label}
          </div>
          <span className="px-2.5 py-1 bg-surface border border-border rounded-full text-xs text-gray-500 capitalize">
            {tender.category}
          </span>
          {daysLeft !== null && tender.status === 'open' && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              daysLeft <= 3 ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-surface border border-border text-gray-500'
            }`}>
              {daysLeft === 0 ? '⚡ Closes today!' : `⏰ ${daysLeft} days left`}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-display font-bold mb-3">{tender.title}</h1>
        {tender.referenceNumber && (
          <p className="text-xs text-gray-400 mb-3">Ref: {tender.referenceNumber}</p>
        )}
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{tender.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tender.estimatedBudget && (
            <div className="p-3 bg-background rounded-lg border border-border">
              <p className="text-xs text-gray-500 mb-1">Budget</p>
              <p className="font-bold text-sm flex items-center gap-1">
                <IndianRupee size={12} />
                {(tender.estimatedBudget / 100000).toFixed(1)}L
              </p>
            </div>
          )}
          {tender.deadline && (
            <div className="p-3 bg-background rounded-lg border border-border">
              <p className="text-xs text-gray-500 mb-1">Deadline</p>
              <p className="font-bold text-sm">{new Date(tender.deadline).toLocaleDateString('en-IN')}</p>
            </div>
          )}
          <div className="p-3 bg-background rounded-lg border border-border">
            <p className="text-xs text-gray-500 mb-1">Proposals</p>
            <p className="font-bold text-sm">{tender.proposals?.length || 0}</p>
          </div>
          {tender.location?.district && (
            <div className="p-3 bg-background rounded-lg border border-border">
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="font-bold text-sm text-xs leading-snug">{tender.location.district}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border text-sm text-gray-500">
          <Building2 size={14} />
          Posted by {tender.createdBy?.name || 'Department'}
          <span className="text-gray-400">·</span>
          {new Date(tender.publishedAt || tender.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Eligibility */}
      {tender.eligibility && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-2">Eligibility Criteria</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{tender.eligibility}</p>
          <div className="flex gap-2 mt-3">
            <p className="text-xs text-gray-500">Open to:</p>
            {tender.eligibleRoles?.map(role => (
              <span key={role} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded text-xs font-medium capitalize">
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Proposal submission */}
      {canPropose && !alreadyProposed && (
        <SubmitProposalForm tenderId={tender._id} onSubmitted={fetchTender} />
      )}
      {canPropose && alreadyProposed && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400" />
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">You have already submitted a proposal for this tender.</p>
        </div>
      )}

      {/* Proposals list (for dept/admin: full; for others: count only) */}
      {tender.proposals && tender.proposals.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">
            Proposals ({tender.proposals.length})
          </h3>
          {['department', 'admin'].includes(user?.role) ? (
            <div className="space-y-4">
              {tender.proposals.map(p => (
                <ProposalCard
                  key={p._id}
                  proposal={p}
                  tenderId={tender._id}
                  canAct={canAct}
                  onAction={fetchTender}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">{tender.proposals.length} proposals received. Results will be announced after the deadline.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TenderDetail;
