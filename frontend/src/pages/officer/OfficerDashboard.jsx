import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
  ShieldAlert, Users, Network, Activity, FileText, Briefcase,
  ArrowRight, TrendingUp, CheckCircle, Clock, AlertTriangle, BarChart3,
  BrainCircuit, MapPin, Bell
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SkeletonCard } from '../../components/common/SkeletonCard';
import StatCounter from '../../components/ui/StatCounter';
import BackButton from '../../components/common/BackButton';

const OfficerDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/analytics/overview', { params: { district: user?.district } });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load officer stats:', err);
    }
  }, [user]);

  const fetchSubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    try {
      const res = await api.get('/submissions', { 
        params: { limit: 10, sortBy: 'createdAt', order: 'desc', district: user?.district } 
      });
      const all = res.data || [];
      const actionable = all
        .filter(sub => sub.status !== 'resolved' && sub.status !== 'rejected')
        .slice(0, 5);
      setSubmissions(actionable);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  }, [user]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects', { 
        params: { limit: 5, sort: '-createdAt', district: user?.district } 
      });
      setProjects(res.data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }, [user]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.allSettled([fetchStats(), fetchSubmissions(), fetchProjects()]);
      setLoading(false);
    };
    if (user) {
      loadAll();
    }
  }, [user, fetchStats, fetchSubmissions, fetchProjects]);

  const STATUS_COLORS = {
    pending:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    reviewing:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    approved:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    in_progress: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    resolved:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const totalSub = stats?.submissions?.total ?? 0;
  const pendingSub = stats?.submissions?.pending ?? 0;
  const activeProjects = stats?.projects?.active ?? 0;
  const resolutionRate = stats?.submissions?.resolutionRate ?? 0;

  const statCards = [
    {
      title: 'Total Submissions', 
      value: totalSub,
      trend: `+${stats?.submissions?.growthRate || 0}% this month`,
      icon: <Users className="w-5 h-5" />, 
      color: 'blue',
      trendUp: true
    },
    {
      title: 'Pending Action', 
      value: pendingSub,
      trend: 'Needs attention',
      icon: <AlertTriangle className="w-5 h-5" />, 
      color: 'orange',
      trendUp: false
    },
    {
      title: 'Resolution Rate', 
      value: resolutionRate,
      isPercentage: true,
      trend: 'Target: 80%',
      icon: <Activity className="w-5 h-5" />, 
      color: 'green',
      trendUp: true
    },
    {
      title: 'Active Projects', 
      value: activeProjects,
      trend: 'Under execution',
      icon: <Briefcase className="w-5 h-5" />, 
      color: 'purple',
      trendUp: true
    },
  ];

  const colorMap = {
    blue:   'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    red:    'bg-red-500/10 text-red-600 dark:text-red-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    green:  'bg-green-500/10 text-green-600 dark:text-green-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-400">
            {t('dashboard.welcomeOfficer', { name: user?.name?.split(' ')[0] || '' })}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('dashboard.OfficerSubtitle', { district: user?.district || '' })}
          </p>
        </div>
        <Link
          to="/officer/projects"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Briefcase size={18} />
          {t('sidebar.manageProjects')}
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          statCards.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 rounded-xl flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${colorMap[s.color]}`}>{s.icon}</div>
              <div>
                <div className="text-2xl font-bold">
                  <StatCounter value={s.value} />{s.isPercentage ? '%' : ''}
                </div>
                <div className="text-sm text-gray-500">{s.title}</div>
                <p className={`text-xs font-medium mt-1 ${s.trendUp ? 'text-success' : 'text-danger'}`}>
                  {s.trend}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Panel: Recent Submissions */}
        <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText size={18} className="text-primary-500" /> Recent Citizen Submissions
            </h2>
            <Link to="/officer/submissions" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {submissionsLoading ? (
              <div className="p-8 flex justify-center"><LoadingSpinner /></div>
            ) : submissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No active submissions found in your district.</div>
            ) : submissions.map(sub => (
              <Link
                key={sub._id}
                to={`/officer/submissions?id=${sub._id}`}
                className="p-4 flex items-start gap-4 hover:bg-surfaceHover/50 transition-colors block"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{sub.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {sub.category} · {sub.location?.district || 'N/A'} · {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {sub.aiAnalysis?.priorityScore > 0 && (
                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                      sub.aiAnalysis.priorityScore >= 8 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      sub.aiAnalysis.priorityScore >= 6 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      P{Math.round(sub.aiAnalysis.priorityScore)}
                    </div>
                  )}
                  <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[sub.status] || STATUS_COLORS.pending}`}>
                    {sub.status?.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Side Panel: Quick Actions + Active Projects */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'View All Submissions', to: '/officer/submissions', icon: <FileText size={16} />, color: 'text-blue-500' },
                { label: 'Manage Projects', to: '/officer/projects', icon: <Briefcase size={16} />, color: 'text-purple-500' },
                { label: 'System Reports', to: '/officer/analytics', icon: <BarChart3 size={16} />, color: 'text-green-500' },
                { label: 'Submissions Map', to: '/officer/map', icon: <MapPin size={16} />, color: 'text-red-500' },
                { label: 'AI Insights', to: '/officer/ai-insights', icon: <BrainCircuit size={16} />, color: 'text-indigo-500' },
                { label: 'Notifications', to: '/officer/notifications', icon: <Bell size={16} />, color: 'text-sky-500' },
              ].map(({ label, to, icon, color }) => (
                <Link key={to} to={to}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surfaceHover transition-colors group">
                  <div className={`flex items-center gap-3 text-sm font-medium ${color}`}>
                    {icon} <span className="text-foreground">{label}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-500" /> Active Projects
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-10 bg-surfaceHover animate-pulse rounded" />)}
              </div>
            ) : projects.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No active projects.</p>
            ) : projects.map(p => (
              <div key={p._id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  p.status === 'ongoing' ? 'bg-green-500' :
                  p.status === 'approved' ? 'bg-blue-500' :
                  p.status === 'proposed' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{p.status?.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Executive Summary */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full blur-xl transform translate-x-6 -translate-y-6" />
            <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
              <BrainCircuit size={18} /> AI Overview
            </h3>
            <p className="text-blue-200 text-sm mb-4 relative z-10">
              {totalSub} submissions tracked · {resolutionRate}% resolved
            </p>
            <Link
              to="/officer/ai-insights"
              className="inline-block bg-white text-blue-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors relative z-10"
            >
              Generate Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
