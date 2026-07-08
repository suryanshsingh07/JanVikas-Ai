import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  Heart, Database, TrendingUp, Users, FileText,
  ArrowRight, CheckCircle, Clock, AlertTriangle, Activity, MapPin, PlusCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SkeletonCard } from '../../components/common/SkeletonCard';
import StatCounter from '../../components/ui/StatCounter';

const STATUS_COLORS = {
  pending:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  reviewing:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  resolved:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const NGODashboard = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [submissionStats, setSubmissionStats] = useState({
    total: 0, pending: 0, resolved: 0, inProgress: 0, resolutionRate: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get('/analytics/overview');
      const data = res.data; // { submissions, projects, citizens, system }
      setActiveCampaigns(data?.projects?.active || 0);
      setSubmissionStats({
        total: data?.submissions?.total || 0,
        pending: data?.submissions?.pending || 0,
        resolved: data?.submissions?.resolved || 0,
        inProgress: data?.submissions?.reviewing || 0,
        resolutionRate: data?.submissions?.resolutionRate || 0,
      });
    } catch (err) {
      console.error('Failed to load NGO stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    try {
      const res = await api.get('/submissions?limit=8&sortBy=createdAt&order=desc');
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to load NGO submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/submissions/${id}/status`, { status: newStatus });
      fetchSubmissions();
      fetchStats();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSubmissions();
  }, [fetchStats, fetchSubmissions]);

  const statCards = [
    {
      title: 'Active Campaigns', value: activeCampaigns, loading: statsLoading,
      icon: <Heart className="w-5 h-5" />, gradient: 'from-red-500/20 to-pink-500/10 text-red-500',
    },
    {
      title: 'Total Submissions', value: submissionStats.total, loading: statsLoading,
      icon: <FileText className="w-5 h-5" />, gradient: 'from-blue-500/20 to-indigo-500/10 text-blue-500',
    },
    {
      title: 'Pending Review', value: submissionStats.pending, loading: statsLoading,
      icon: <Clock className="w-5 h-5" />, gradient: 'from-orange-500/20 to-yellow-500/10 text-orange-500',
    },
    {
      title: 'Resolved', value: submissionStats.resolved, loading: statsLoading,
      icon: <CheckCircle className="w-5 h-5" />, gradient: 'from-green-500/20 to-emerald-500/10 text-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-400">
            NGO & Research Portal
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome, <span className="font-semibold text-foreground">{user?.name}</span> · Monitor citizen issues, track progress and support resolutions.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/ngo/submit"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shrink-0">
            <PlusCircle size={18} /> Report Issue
          </Link>
          <Link to="/ngo/submissions"
            className="flex items-center gap-2 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-4 py-2 rounded-lg font-medium transition-colors shrink-0">
            <FileText size={18} /> View Submissions
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-5 rounded-xl flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${s.gradient} bg-opacity-10`}>
              <span className={s.gradient.split(' ').pop()}>{s.icon}</span>
            </div>
            <div>
              {s.loading ? (
                <div className="h-7 w-16 bg-surfaceHover animate-pulse rounded mb-1" />
              ) : (
                <div className="text-2xl font-bold">
                  <StatCounter value={s.value} />
                </div>
              )}
              <div className="text-sm text-gray-500">{s.title}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Submissions Feed */}
        <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" /> Active Citizen Issues
            </h2>
            <Link to="/ngo/submissions" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {submissionsLoading ? (
              <div className="p-8 flex justify-center"><LoadingSpinner /></div>
            ) : submissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No submissions found.</div>
            ) : submissions.map(sub => (
              <div key={sub._id} className="p-4 hover:bg-surfaceHover/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{sub.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {sub.category} · {sub.location?.district || 'N/A'} · {sub.votes} votes
                    </p>
                    {sub.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-1">{sub.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[sub.status] || STATUS_COLORS.pending}`}>
                      {sub.status?.replace('_', ' ')}
                    </span>
                    {sub.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(sub._id, 'in_progress')}
                        className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-full hover:bg-blue-700 transition-colors font-medium">
                        Take Action
                      </button>
                    )}
                    {sub.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(sub._id, 'resolved')}
                        className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-full hover:bg-green-700 transition-colors font-medium">
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Impact Summary */}
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-xl">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Report Issue', to: '/ngo/submit', icon: <PlusCircle size={16} />, color: 'text-emerald-500' },
                { label: 'All Submissions', to: '/ngo/submissions', icon: <FileText size={16} />, color: 'text-blue-500' },
                { label: 'City Complaint Map', to: '/city-map', icon: <MapPin size={16} />, color: 'text-red-500' },
                { label: 'Tenders', to: '/tenders', icon: <Database size={16} />, color: 'text-purple-500' },
                { label: 'Impact Score', to: '/ngo/submissions', icon: <TrendingUp size={16} />, color: 'text-green-500' },
                { label: 'Community Reach', to: '/ngo/submissions', icon: <Users size={16} />, color: 'text-orange-500' },
              ].map(({ label, to, icon, color }) => (
                <Link key={label} to={to}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surfaceHover transition-colors group">
                  <div className={`flex items-center gap-3 text-sm font-medium ${color}`}>
                    {icon} <span className="text-foreground">{label}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Impact Visualization */}
          <div className="bg-gradient-to-br from-emerald-900 to-green-800 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl transform translate-x-6 -translate-y-6" />
            <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
              <Activity size={18} /> Community Impact
            </h3>
            <div className="space-y-3 relative z-10">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-emerald-200">Issues In Progress</span>
                  <span className="font-bold">{submissionStats.inProgress}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div className="bg-emerald-300 h-1.5 rounded-full" style={{
                    width: submissionStats.total > 0
                      ? `${Math.round((submissionStats.inProgress / submissionStats.total) * 100)}%`
                      : '0%'
                  }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-emerald-200">Resolution Rate</span>
                  <span className="font-bold">{submissionStats.resolutionRate}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: `${submissionStats.resolutionRate}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
