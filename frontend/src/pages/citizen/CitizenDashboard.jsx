import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { PlusCircle, FileText, Activity, AlertTriangle, CheckCircle, ArrowRight, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { useSubmissions } from '../../hooks/useSubmissions';
import { getCategory, getStatus } from '../../utils/helpers';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BackButton from '../../components/common/BackButton';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, active: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  
  const { data: recentSubmissions, loading: subsLoading } = useSubmissions({ limit: 3, mine: true });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await authService.getUserStats('me');
        setStats(res.stats);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">{t('dashboard.welcomeCitizen', { name: user?.name?.split(' ')[0] || '' })}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('dashboard.citizenSubtitle', { district: user?.district || '' })}</p>
        </div>
        <Link 
          to="/citizen/submit" 
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <PlusCircle size={18} />
          {t('dashboard.reportIssue')}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Submitted" 
          value={stats.total} 
          icon={<FileText className="text-blue-500" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="In Progress" 
          value={stats.active} 
          icon={<Activity className="text-warning" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Resolved" 
          value={stats.resolved} 
          icon={<CheckCircle className="text-success" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Pending Action" 
          value={stats.pending} 
          icon={<AlertTriangle className="text-danger" />} 
          loading={statsLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('dashboard.recentSubmissions')}</h2>
            <Link to="/citizen/submissions" className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
              {t('dashboard.viewAll')} <ArrowRight size={16} />
            </Link>
          </div>

          {subsLoading ? (
            <div className="glass-card p-8 flex justify-center rounded-xl">
              <LoadingSpinner />
            </div>
          ) : recentSubmissions.length === 0 ? (
            <div className="glass-card p-8 text-center rounded-xl">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold mb-1">{t('dashboard.noSubmissions')}</h3>
              <p className="text-sm text-gray-500 mb-4">{t('dashboard.noSubmissionsDesc')}</p>
              <Link 
                to="/citizen/submit" 
                className="inline-block bg-surface border border-border hover:bg-surfaceHover px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {t('dashboard.reportIssueCTA')}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((sub, idx) => {
                const category = getCategory(sub.category);
                const status = getStatus(sub.status);
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={sub._id} 
                    className="glass-card p-4 rounded-xl hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <Link to={`/citizen/track/${sub._id}`} className="block">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            {formatRelativeTime(sub.createdAt)}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                          <MapPin size={12} /> {sub.location.district}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-500 transition-colors line-clamp-1">{sub.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{sub.description}</p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center">
                            {category.label.charAt(0)}
                          </span>
                          {category.label}
                        </div>
                        
                        <div className="text-xs font-medium text-primary-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Track Status <ArrowRight size={14} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info/Action Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary-600 to-info rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
            <h3 className="font-bold text-lg mb-2 relative z-10">{t('dashboard.makeVoiceHeard')}</h3>
            <p className="text-primary-100 text-sm mb-4 relative z-10">
              {t('dashboard.makeVoiceHeardDesc')}
            </p>
            <Link 
              to="/citizen/submit" 
              className="inline-block bg-white text-primary-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow relative z-10 transition-all"
            >
              {t('dashboard.reportIssueNow')}
            </Link>
          </div>

          <div className="glass-card p-5 rounded-xl">
            <h3 className="font-semibold mb-4">{t('dashboard.constituencyInfo')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-gray-500">{t('dashboard.state')}</span>
                <span className="text-sm font-medium">{user?.state || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-gray-500">{t('dashboard.district')}</span>
                <span className="text-sm font-medium">{user?.district || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">{t('dashboard.representative')}</span>
                <span className="text-sm font-medium text-primary-500">MP View Assigned</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, loading }) => (
  <div className="glass-card p-5 rounded-xl">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
        {icon}
      </div>
    </div>
    {loading ? (
      <div className="h-8 w-16 bg-surfaceHover animate-pulse rounded mt-1"></div>
    ) : (
      <p className="text-2xl font-bold">{value}</p>
    )}
  </div>
);

export default CitizenDashboard;
