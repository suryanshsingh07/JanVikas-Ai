import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Eye, CheckCircle2, Wrench, XCircle, Star,
  MapPin, Tag, Users, Calendar, AlertCircle, MessageSquare,
  ChevronDown, ChevronUp, Send, ThumbsUp, Image, Video, Trash2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { submissionService } from '../../services/submissionService';
import toast from 'react-hot-toast';

/* ─── Status Config ───────────────────────────────────────── */
const STATUSES = [
  { key: 'pending',     label: 'Pending',             icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-100 dark:bg-amber-900/30',   ring: 'ring-amber-400' },
  { key: 'reviewing',   label: 'Under Review',         icon: Eye,          color: 'text-blue-500',    bg: 'bg-blue-100 dark:bg-blue-900/30',     ring: 'ring-blue-400' },
  { key: 'approved',    label: 'Approved for Action',  icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30',ring: 'ring-emerald-400' },
  { key: 'in_progress', label: 'Work In Progress',     icon: Wrench,       color: 'text-violet-500',  bg: 'bg-violet-100 dark:bg-violet-900/30', ring: 'ring-violet-400' },
];
const TERMINAL_STATUSES = {
  resolved: { label: 'Resolved',  icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  rejected: { label: 'Rejected',  icon: XCircle,      color: 'text-red-500',   bg: 'bg-red-100 dark:bg-red-900/30' },
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

/* ─── Status Stepper ─────────────────────────────────────── */
const StatusStepper = ({ currentStatus }) => {
  const isTerminal = ['resolved', 'rejected'].includes(currentStatus);
  const terminalCfg = TERMINAL_STATUSES[currentStatus];
  const activeIdx = STATUSES.findIndex(s => s.key === currentStatus);

  return (
    <div className="relative">
      {/* Progress line */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-border z-0" />
      <div
        className="absolute top-5 left-5 h-0.5 bg-primary-500 z-0 transition-all duration-700"
        style={{ width: isTerminal ? '100%' : `${(activeIdx / (STATUSES.length - 1)) * 100}%` }}
      />

      <div className="relative z-10 flex justify-between">
        {STATUSES.map((step, i) => {
          const passed = isTerminal || i <= activeIdx;
          const isCurrent = step.key === currentStatus;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                passed
                  ? isCurrent
                    ? `${step.bg} border-current ${step.color} ring-4 ${step.ring} ring-opacity-30`
                    : 'bg-primary-500 border-primary-500 text-white'
                  : 'bg-surface border-border text-gray-400'
              }`}>
                <Icon size={16} />
              </div>
              <p className={`text-xs font-medium text-center leading-tight max-w-[60px] ${passed ? 'text-foreground' : 'text-gray-400'}`}>
                {step.label}
              </p>
            </div>
          );
        })}

        {/* Terminal status */}
        {isTerminal && terminalCfg && (
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${terminalCfg.bg} ${terminalCfg.color} ring-4 ring-current ring-opacity-20`}>
              <terminalCfg.icon size={16} />
            </div>
            <p className={`text-xs font-bold text-center leading-tight max-w-[60px] ${terminalCfg.color}`}>
              {terminalCfg.label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Star Rating ─────────────────────────────────────────── */
const StarRating = ({ value, onChange, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={readonly}
        onClick={() => !readonly && onChange && onChange(star)}
        className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
      >
        <Star
          size={24}
          className={star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}
        />
      </button>
    ))}
  </div>
);

/* ─── Status Update Panel ────────────────────────────────── */
const StatusUpdatePanel = ({ submission, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(submission.status);
  const [note, setNote] = useState('');
  const [evidenceImages, setEvidenceImages] = useState([]);
  const [evidenceVideos, setEvidenceVideos] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const validTransitions = {
    pending:     ['reviewing', 'rejected'],
    reviewing:   ['approved', 'rejected'],
    approved:    ['in_progress', 'rejected'],
    in_progress: ['resolved', 'rejected'],
    resolved:    [],
    rejected:    [],
  };

  const next = validTransitions[submission.status] || [];
  if (next.length === 0) return null;

  const STATUS_LABELS = {
    reviewing: '👀 Under Review',
    approved: '✅ Approved for Action',
    in_progress: '🔧 Work In Progress',
    resolved: '🎉 Resolved',
    rejected: '❌ Rejected',
  };

  const handleUpdate = async () => {
    if (!status || status === submission.status) return;
    setLoading(true);
    try {
      // If resolving, require at least one evidence file
      if (status === 'resolved') {
        if (evidenceImages.length === 0 && evidenceVideos.length === 0) {
          toast.error('Please attach at least one photo or video as evidence when marking resolved');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('note', note);
        if (rejectionReason) formData.append('rejectionReason', rejectionReason);
        evidenceImages.forEach((file) => formData.append('images', file));
        evidenceVideos.forEach((file) => formData.append('videos', file));
        await submissionService.updateStatus(submission._id, 'resolved', formData);
      } else {
        await api.put(`/submissions/${submission._id}/status`, {
          status, note,
          ...(status === 'rejected' && { rejectionReason }),
        });
      }
      toast.success('Status updated successfully');
      onUpdated();
    } catch {
      // error shown by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surfaceHover transition-colors"
      >
        <span className="font-semibold text-sm">Update Status</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-border space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">New Status</label>
                <div className="flex flex-wrap gap-2">
                  {next.map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        status === s
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'border-border hover:bg-surfaceHover'
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Note (optional)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Add a note about this status change…"
                />
              </div>
              {status === 'rejected' && (
                <div>
                  <label className="text-xs font-semibold text-red-500 uppercase mb-2 block">Rejection Reason *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-red-300 dark:border-red-700 rounded-lg text-sm focus:ring-2 focus:ring-red-400 resize-none"
                    placeholder="Explain why this submission is being rejected…"
                    required
                  />
                </div>
              )}
              {status === 'resolved' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Resolution Evidence (photos/videos) *</label>
                  <div className="flex gap-2 items-center">
                    <input type="file" accept="image/*" multiple onChange={(e) => setEvidenceImages(Array.from(e.target.files))} />
                    <input type="file" accept="video/*" multiple onChange={(e) => setEvidenceVideos(Array.from(e.target.files))} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Attach photos or videos proving the issue was resolved. At least one file required.</p>
                </div>
              )}
              <button
                onClick={handleUpdate}
                disabled={loading || status === submission.status || (status === 'rejected' && !rejectionReason)}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                Update Status
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Feedback Form ──────────────────────────────────────── */
const FeedbackForm = ({ submissionId, existingFeedback, onSubmitted }) => {
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [comment, setComment] = useState(existingFeedback?.comment || '');
  const [loading, setLoading] = useState(false);

  if (existingFeedback?.submittedAt) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
        <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">✅ Feedback Submitted</p>
        <StarRating value={existingFeedback.rating} readonly />
        {existingFeedback.comment && (
          <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-500">"{existingFeedback.comment}"</p>
        )}
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    setLoading(true);
    try {
      await api.post(`/submissions/${submissionId}/feedback`, { rating, comment });
      toast.success('Thank you for your feedback!');
      onSubmitted();
    } catch {
      // error shown by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
      <p className="font-semibold text-green-800 dark:text-green-400 mb-3">🎉 Issue Resolved! How satisfied are you?</p>
      <div className="mb-3">
        <StarRating value={rating} onChange={setRating} />
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg text-sm focus:ring-2 focus:ring-green-400 resize-none mb-3"
        placeholder="Share your experience (optional)…"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
        Submit Feedback
      </button>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────── */
const SubmissionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [govMatches, setGovMatches] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSubmission = async () => {
    try {
      const res = await api.get(`/submissions/${id}`);
      setSubmission(res.submission);
    } catch {
      toast.error('Report not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const fetchGovMatches = async () => {
    try {
      const res = await api.get(`/gov/compare`, { params: { submissionId: id, radiusMeters: 5000 } });
      setGovMatches(res.data || []);
    } catch (err) {
      // Gov data comparison is optional - silently fail if endpoint not available
      console.debug('Gov comparison unavailable:', err.message);
      setGovMatches([]);
    }
  };

  useEffect(() => { fetchSubmission(); }, [id]);
  useEffect(() => { if (submission) fetchGovMatches(); }, [submission]);

  const canUpdateStatus = ['officer', 'department', 'ngo', 'admin'].includes(user?.role);
  const isCitizenOwner = user?.role === 'citizen' && submission?.citizen?._id === user?._id;
  const canDelete = isCitizenOwner || user?.role === 'admin';

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/submissions/${id}`);
      toast.success('Report deleted successfully');
      const redirectRoute = user?.role === 'admin' ? '/admin/reports' : '/citizen/submissions';
      navigate(redirectRoute);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  if (!submission) return null;

  const statusCfg = TERMINAL_STATUSES[submission.status] ||
    STATUSES.find(s => s.key === submission.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header Card */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex flex-wrap items-start gap-3 mb-4 justify-between">
          <div className="flex flex-wrap gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusCfg?.bg} ${statusCfg?.color}`}>
              {statusCfg?.icon && <statusCfg.icon size={12} />}
              {statusCfg?.label}
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[submission.priority]}`}>
              {submission.priority?.toUpperCase()} Priority
            </span>
            <span className="px-2.5 py-1 bg-surface border border-border rounded-full text-xs text-gray-500">
              {submission.category}
            </span>
          </div>
          {canDelete && (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>

        <h1 className="text-2xl font-display font-bold mb-3">{submission.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{submission.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {submission.location?.address && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {submission.location.address}
              {submission.location.district && `, ${submission.location.district}`}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(submission.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <ThumbsUp size={14} />
            {submission.votes || 0} votes
          </span>
          {!submission.isAnonymous && submission.citizen && (
            <span className="flex items-center gap-1.5">
              <Users size={14} />
              {submission.citizen.name}
            </span>
          )}
        </div>
      </div>

      {/* Status Stepper */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Progress Tracker</h3>
        <StatusStepper currentStatus={submission.status} />
      </div>

      {/* Rejection Reason */}
      {submission.status === 'rejected' && submission.rejectionReason && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex gap-3">
          <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400 mb-1">Rejection Reason</p>
            <p className="text-sm text-red-600 dark:text-red-500">{submission.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Feedback (citizen owner + resolved) */}
      {submission.status === 'resolved' && isCitizenOwner && (
        <FeedbackForm
          submissionId={submission._id}
          existingFeedback={submission.feedback}
          onSubmitted={fetchSubmission}
        />
      )}

      {/* Feedback display for officials */}
      {submission.feedback?.submittedAt && !isCitizenOwner && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Citizen Feedback</p>
          <StarRating value={submission.feedback.rating} readonly />
          {submission.feedback.comment && (
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-500">"{submission.feedback.comment}"</p>
          )}
        </div>
      )}

      {/* Status Update (officials only) */}
      {canUpdateStatus && (
        <StatusUpdatePanel submission={submission} onUpdated={fetchSubmission} />
      )}

      {/* Status History */}
      {submission.statusHistory?.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Activity History</h3>
          <div className="space-y-3">
            {[...submission.statusHistory].reverse().map((entry, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    Status → <span className="text-primary-600 dark:text-primary-400">{entry.status?.replace('_', ' ')}</span>
                  </p>
                  {entry.note && <p className="text-gray-500 text-xs mt-0.5">{entry.note}</p>}
                  <p className="text-gray-400 text-xs mt-0.5">
                    {entry.changedBy?.name || 'System'} · {new Date(entry.changedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media */}
      {submission.media?.images?.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            <Image size={14} className="inline mr-1" />Attached Images
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {submission.media.images.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                className="aspect-video rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity">
                <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {submission.media?.videos?.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            <Video size={14} className="inline mr-1" />Attached Videos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {submission.media.videos.map((url, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-border bg-black">
                <video
                  src={url}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Government Data Comparison */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Government Data Comparison</h3>
        {govMatches.length === 0 ? (
          <p className="text-sm text-gray-500">No nearby government records found (within 5 km).</p>
        ) : (
          <div className="space-y-3">
            {govMatches.map((g, idx) => (
              <div key={idx} className="p-3 border border-border rounded-lg">
                <p className="text-sm font-semibold">{g.type.replace('_', ' ')} — {g.source}</p>
                <p className="text-xs text-gray-500">{g.location?.address || `${g.location?.district || ''}, ${g.location?.state || ''}`}</p>
                <pre className="text-xs mt-2 text-gray-700">{JSON.stringify(g.properties, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Delete Report?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to permanently delete this report? All associated votes, comments, and feedback will also be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-surfaceHover transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionDetail;
