import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, Database, ShieldAlert, Activity, ArrowRight, BarChart3, Settings } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SkeletonCard } from '../../components/common/SkeletonCard';
import StatCounter from '../../components/ui/StatCounter';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStats();
        // API interceptor returns response.data directly, so res = { success, data }
        setStats(res.data);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users', 
      value: stats?.users?.total || 0,
      subValue: `${stats?.users?.officers || 0} Officers registered`,
      icon: <Users className="w-5 h-5" />, 
      color: 'blue'
    },
    {
      title: 'Total Submissions', 
      value: stats?.submissions?.total || 0,
      subValue: `${stats?.submissions?.resolutionRate || 0}% resolution rate`,
      icon: <FileText className="w-5 h-5" />, 
      color: 'purple'
    },
    {
      title: 'Flagged Content', 
      value: stats?.submissions?.flagged || 0,
      subValue: 'Requires moderation',
      icon: <ShieldAlert className="w-5 h-5" />, 
      color: 'red',
      alert: true
    },
    {
      title: 'System Health', 
      value: stats?.system?.health || 99.9,
      isPercentage: true,
      subValue: `${stats?.system?.activeSources || 4} active data sources`,
      icon: <Activity className="w-5 h-5" />, 
      color: 'green'
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-400">
            System Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">National level administration and monitoring dashboard.</p>
        </div>
        <Link 
          to="/admin/reports" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <BarChart3 size={18} />
          Generate System Report
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
              className={`glass-card p-5 rounded-xl flex items-center gap-4 ${s.alert ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''}`}
            >
              <div className={`p-3 rounded-xl ${colorMap[s.color]}`}>{s.icon}</div>
              <div>
                <div className="text-2xl font-bold">
                  <StatCounter value={s.value} />{s.isPercentage ? '%' : ''}
                </div>
                <div className="text-sm text-gray-500">{s.title}</div>
                <p className={`text-xs font-medium mt-1 ${s.alert ? 'text-red-500' : 'text-gray-500'}`}>
                  {s.subValue}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Grid Layout for Modules */}
      <div>
        <h2 className="text-xl font-bold mb-4">Administration Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModuleCard 
            title="User Management"
            description="Manage citizens, government officials, and system administrators. Handle verification and access control."
            icon={<Users size={24} className="text-blue-500" />}
            link="/admin/users"
            linkText="Manage Users"
            metrics={[
              { label: 'Active Citizens', value: stats?.users?.citizens || 0 },
              { label: 'Pending Approvals', value: stats?.users?.pendingApprovals || 0 }
            ]}
            delay={0.1}
          />
          
          <ModuleCard 
            title="Content Moderation"
            description="Review flagged submissions, manage spam, and enforce platform guidelines."
            icon={<ShieldAlert size={24} className="text-danger" />}
            link="/admin/moderation"
            linkText="Review Queue"
            metrics={[
              { label: 'Pending Reviews', value: stats?.submissions?.pendingReviews || 0 },
              { label: 'Auto-resolved (AI)', value: stats?.submissions?.autoResolved || 0 }
            ]}
            delay={0.2}
          />
          
          <ModuleCard 
            title="Open Datasets"
            description="Manage government data integrations used for cross-referencing citizen demands."
            icon={<Database size={24} className="text-purple-500" />}
            link="/admin/datasets"
            linkText="Manage Integrations"
            metrics={[
              { label: 'Active Sources', value: stats?.system?.activeSources || 4 },
              { label: 'Last Sync', value: '2 hrs ago' }
            ]}
            delay={0.3}
          />

          <ModuleCard 
            title="Project Oversight"
            description="National view of all active projects, budget allocations, and execution status."
            icon={<Settings size={24} className="text-warning" />}
            link="/admin/projects"
            linkText="View Projects"
            metrics={[
              { label: 'Total Projects', value: stats?.projects?.total || 0 },
              { label: 'Total Budget', value: `₹${((stats?.projects?.totalBudget || 0) / 10000000).toFixed(1)}Cr` }
            ]}
            delay={0.4}
          />
        </div>
      </div>
    </div>
  );
};

const ModuleCard = ({ title, description, icon, link, linkText, metrics, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-6 rounded-2xl flex flex-col h-full hover:shadow-lg transition-all border border-border hover:border-primary-200 dark:hover:border-primary-800"
  >
    <div className="w-14 h-14 rounded-xl bg-surface border border-border flex items-center justify-center mb-5 shadow-sm">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-grow leading-relaxed">{description}</p>
    
    <div className="bg-surface/50 rounded-xl p-4 mb-6 space-y-3 border border-border/50">
      {metrics.map((m, i) => (
        <div key={i} className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">{m.label}</span>
          <span className="font-bold text-foreground">{m.value}</span>
        </div>
      ))}
    </div>
    
    <Link 
      to={link}
      className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-lg bg-surfaceHover text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 transition-all group"
    >
      {linkText} 
      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
    </Link>
  </motion.div>
);

export default AdminDashboard;
