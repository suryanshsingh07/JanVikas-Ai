import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { analyticsService } from '../../services/analyticsService';
import api from '../../services/api';
import {
  ShieldAlert, Users, Network, Activity, FileText, Briefcase,
  ArrowRight, TrendingUp, CheckCircle, Clock, AlertTriangle, BarChart3
} from 'lucide-react';
import BackButton from '../../components/common/BackButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatCard = ({ title, value, sub, icon, color = 'blue', loading }) => {
  const colorMap = {
    blue:   'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    red:    'bg-red-500/10 text-red-600 dark:text-red-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    green:  'bg-green-500/10 text-green-600 dark:text-green-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  };
  return (
    <div className="glass-card p-5 rounded-xl flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>{icon}</div>
      <div>
        {loading ? (
          <div className="h-7 w-16 bg-surfaceHover animate-pulse rounded mb-1" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <div className="text-sm text-gray-500">{title}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
};

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, submissionsRes, projectsRes] = await Promise.all([
        analyticsService.getOverview({ district: user?.district }),
        api.get('/submissions?limit=5&sort=-createdAt'),
        api.get('/projects?limit=5&sort=-createdAt'),
      ]);
      setStats(statsRes);
      setSubmissions(submissionsRes.submissions || []);
      setProjects(projectsRes.projects || []);
    } catch (err) {
      console.error('Failed to load department dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statCards = [
    { title: 'Total Submissions', value: stats?.submissions?.total ?? '—', icon: <FileText className="w-5 h-5" />, color: 'blue' },
    { title: 'Pending Review', value: stats?.submissions?.pending ?? '—', icon: <Clock className="w-5 h-5" />, color: 'orange' },
    { title: 'SLA Breaches', value: '12', icon: <ShieldAlert className="w-5 h-5" />, color: 'red' },
    { title: 'Active Projects', value: stats?.projects?.active ?? '—', icon: <Briefcase className="w-5 h-5" />, color: 'purple' },
    { title: 'Resolution Rate', value: `${stats?.submissions?.resolutionRate ?? 0}%`, icon: <CheckCircle className="w-5 h-5" />, color: 'green' },
    { title: 'Resource Utilization', value: '89%', icon: <Activity className="w-5 h-5" />, color: 'blue' },
    { title: 'Inter-Dept Transfers', value: '45', icon: <Network className="w-5 h-5" />, color: 'purple' },
    { title: 'Active Personnel', value: '1,204', icon: <Users className="w-5 h-5" />, color: 'green' },
  ];

  const STATUS_COLORS = {
    pending:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    resolved:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-400">
            Department Control Center
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome, {user?.name} · Cross-department issue routing, SLA tracking, and project management.
          </p>
        </div>
        <Link to="/department/projects"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shrink-0">
          <Briefcase size={18} /> Manage Projects
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <StatCard key={i} {...s} loading={loading} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Submissions */}
        <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText size={18} className="text-primary-500" /> Recent Citizen Submissions
            </h2>
            <Link to="/department/submissions" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 flex justify-center"><LoadingSpinner /></div>
            ) : submissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No submissions yet.</div>
            ) : submissions.map(sub => (
              <div key={sub._id} className="p-4 flex items-start gap-4 hover:bg-surfaceHover/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{sub.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sub.category} · {sub.location?.district || 'N/A'}</p>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[sub.status] || STATUS_COLORS.pending}`}>
                  {sub.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Active Projects */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="glass-card p-5 rounded-xl">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'View All Submissions', to: '/department/submissions', icon: <FileText size={16} />, color: 'text-blue-500' },
                { label: 'Manage Projects', to: '/department/projects', icon: <Briefcase size={16} />, color: 'text-purple-500' },
                { label: 'View Analytics', to: '/department/analytics', icon: <BarChart3 size={16} />, color: 'text-green-500' },
                { label: 'Account Management', to: '/department/accounts', icon: <Users size={16} />, color: 'text-orange-500' },
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
                {[1,2,3].map(i => <div key={i} className="h-10 bg-surfaceHover animate-pulse rounded" />)}
              </div>
            ) : projects.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No projects yet.</p>
            ) : projects.map(p => (
              <div key={p._id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{p.status?.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
