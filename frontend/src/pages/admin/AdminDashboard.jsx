import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Database, ShieldAlert, Activity, ArrowRight, BarChart3, Settings } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

  if (loading) {
    return <div className="min-h-[60vh] flex justify-center items-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">System Overview</h1>
          <p className="text-gray-500 dark:text-gray-400">National level administration and monitoring dashboard.</p>
        </div>
        <Link 
          to="/admin/reports" 
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <BarChart3 size={18} />
          Generate System Report
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value={(stats?.users?.citizens || 0) + (stats?.users?.officials || 0)} 
          subValue={`${stats?.users?.officials || 0} Officials registered`}
          icon={<Users className="text-blue-500" />} 
        />
        <StatCard 
          title="Total Submissions" 
          value={stats?.submissions?.total || 0} 
          subValue={`${stats?.submissions?.resolutionRate || 0}% resolution rate`}
          icon={<FileText className="text-primary-500" />} 
        />
        <StatCard 
          title="Flagged Content" 
          value="24" 
          subValue="Requires moderation"
          icon={<ShieldAlert className="text-danger" />} 
          alert={true}
        />
        <StatCard 
          title="System Health" 
          value="99.9%" 
          subValue="All services operational"
          icon={<Activity className="text-success" />} 
        />
      </div>

      {/* Grid Layout for Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        
        <ModuleCard 
          title="User Management"
          description="Manage citizens, government officials, and system administrators. Handle verification and access control."
          icon={<Users size={24} className="text-blue-500" />}
          link="/admin/users"
          linkText="Manage Users"
          metrics={[
            { label: 'Active Citizens', value: stats?.users?.citizens || 0 },
            { label: 'Pending Approvals', value: '12' }
          ]}
        />
        
        <ModuleCard 
          title="Content Moderation"
          description="Review flagged submissions, manage spam, and enforce platform guidelines."
          icon={<ShieldAlert size={24} className="text-danger" />}
          link="/admin/moderation"
          linkText="Review Queue"
          metrics={[
            { label: 'Pending Reviews', value: '24' },
            { label: 'Auto-resolved (AI)', value: '156' }
          ]}
        />
        
        <ModuleCard 
          title="Open Datasets"
          description="Manage government data integrations used for cross-referencing citizen demands."
          icon={<Database size={24} className="text-purple-500" />}
          link="/admin/datasets"
          linkText="Manage Integrations"
          metrics={[
            { label: 'Active Sources', value: '4' },
            { label: 'Last Sync', value: '2 hrs ago' }
          ]}
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
        />

      </div>
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon, alert }) => (
  <div className={`glass-card p-5 rounded-xl border ${alert ? 'border-danger/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-border'}`}>
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${alert ? 'bg-danger/10' : 'bg-surface'}`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold mb-1">{value}</p>
    <p className={`text-xs font-medium ${alert ? 'text-danger' : 'text-gray-500'}`}>
      {subValue}
    </p>
  </div>
);

const ModuleCard = ({ title, description, icon, link, linkText, metrics }) => (
  <div className="glass-card p-6 rounded-xl flex flex-col h-full hover:shadow-md transition-shadow">
    <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-grow">{description}</p>
    
    <div className="bg-surface/50 rounded-lg p-3 mb-6 space-y-2">
      {metrics.map((m, i) => (
        <div key={i} className="flex justify-between items-center text-sm">
          <span className="text-gray-500">{m.label}</span>
          <span className="font-semibold">{m.value}</span>
        </div>
      ))}
    </div>
    
    <Link 
      to={link}
      className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors mt-auto group"
    >
      {linkText} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
    </Link>
  </div>
);

export default AdminDashboard;
