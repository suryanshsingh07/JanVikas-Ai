import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, TrendingUp, Briefcase, ArrowRight, BrainCircuit, Activity, MapPin, FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { analyticsService } from '../../services/analyticsService';
import { aiService } from '../../services/aiService';
import { SkeletonCard, RecommendationSkeleton } from '../../components/common/SkeletonCard';
import StatCounter from '../../components/ui/StatCounter';
import { debounce } from 'lodash';

const OfficialDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(debounce(async () => {
    setLoading(true);
    try {
      const filters = { district: user?.district };
      const [statsRes, recsRes] = await Promise.all([
        analyticsService.getOverview(filters),
        aiService.getRecommendations({ ...filters, limit: 3 })
      ]);
      setStats(statsRes);
      setRecommendations(recsRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, 300), [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    return () => fetchDashboardData.cancel();
  }, [user, fetchDashboardData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">
            Welcome, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Here is the live intelligence overview for {user?.district}.
          </p>
        </div>
        <Link
          to="/official/projects"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Briefcase size={18} />
          Propose Project
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              title="Total Submissions"
              value={stats?.submissions?.total || 0}
              trend={`+${stats?.submissions?.growthRate || 0}% this month`}
              icon={<Users className="text-blue-500" />}
              trendUp={true}
            />
            <StatCard
              title="Pending Action"
              value={stats?.submissions?.pending || 0}
              trend="Needs attention"
              icon={<AlertTriangle className="text-warning" />}
              trendUp={false}
            />
            <StatCard
              title="Resolution Rate"
              value={stats?.submissions?.resolutionRate || 0}
              isPercentage={true}
              trend="Target: 80%"
              icon={<Activity className="text-success" />}
              trendUp={true}
            />
            <StatCard
              title="Active Projects"
              value={stats?.projects?.active || 0}
              trend="Under execution"
              icon={<Briefcase className="text-purple-500" />}
              trendUp={true}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Panel: AI Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BrainCircuit className="text-primary-500" />
              AI Priority Recommendations
            </h2>
            <Link to="/official/ai-insights" className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="glass-card rounded-xl overflow-hidden">
            <div className="bg-primary-50 dark:bg-primary-900/10 border-b border-border p-4 text-sm text-primary-700 dark:text-primary-300 font-medium">
              Submissions ranked by Urgency, Votes, Severity, Geo-Impact, and Category.
            </div>

            <div className="divide-y divide-border">
              {loading ? (
                <><RecommendationSkeleton /><RecommendationSkeleton /><RecommendationSkeleton /></>
              ) : recommendations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No active recommendations found.</div>
              ) : (
                recommendations.map((rec, idx) => (
                  <RecommendationCard key={rec._id} rec={rec} index={idx} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Side Panel: Quick Actions & Summary */}
        <div className="space-y-6">
          <div className="glass-card p-5 rounded-xl">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/official/map" className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surfaceHover transition-colors group">
                <div className="flex items-center gap-3 font-medium text-sm">
                  <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  Geospatial Map
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/official/submissions" className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surfaceHover transition-colors group">
                <div className="flex items-center gap-3 font-medium text-sm">
                  <div className="w-8 h-8 rounded bg-info/10 text-info flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  Citizen Requests
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/official/analytics" className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surfaceHover transition-colors group">
                <div className="flex items-center gap-3 font-medium text-sm">
                  <div className="w-8 h-8 rounded bg-warning/10 text-warning flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  Deep Analytics
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
            <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
              <FileText size={18} /> Executive Summary
            </h3>
            <p className="text-gray-300 text-sm mb-4 relative z-10">
              Generate a comprehensive LLM report of this week's constituent demands.
            </p>
            <Link
              to="/official/ai-insights"
              className="inline-block bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors relative z-10"
            >
              Generate Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon, trendUp, isPercentage = false }) => (
  <div className="glass-card p-5 rounded-xl">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center border border-border">
        {icon}
      </div>
    </div>
    <div className="text-3xl font-bold mb-1">
      <StatCounter value={value} />
      {isPercentage && '%'}
    </div>
    <p className={`text-xs font-medium ${trendUp ? 'text-success' : 'text-danger'}`}>
      {trend}
    </p>
  </div>
);

const RecommendationCard = ({ rec, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const factors = rec.rankingFactors ? Object.entries(rec.rankingFactors) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-5 hover:bg-surfaceHover transition-colors"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-surface border border-border rounded-lg min-w-[80px] h-fit">
          <span className="text-xs text-gray-500 mb-1">Score</span>
          <span className="text-2xl font-bold text-primary-600">{rec.priorityScore.toFixed(1)}</span>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{rec.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{rec.description}</p>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="font-medium px-2 py-1 rounded-md bg-background border border-border capitalize">{rec.category}</span>
            <span className="font-medium px-2 py-1 rounded-md bg-background border border-border">{rec.votes} Votes</span>
            <span className="font-medium px-2 py-1 rounded-md bg-background border border-border">{rec.location.district}</span>
          </div>
        </div>

        <div className="flex items-center sm:items-start justify-end sm:justify-center shrink-0 gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 bg-surface border border-border text-sm font-medium rounded-lg hover:bg-surfaceHover transition-opacity whitespace-nowrap"
          >
            <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          <Link
            to={`/official/submissions?id=${rec._id}`}
            className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Review
          </Link>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0, marginTop: 0 }}
          animate={{ height: 'auto', opacity: 1, marginTop: '16px' }}
          exit={{ height: 0, opacity: 0, marginTop: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-surface p-4 rounded-lg border border-border">
            <h4 className="font-semibold text-sm mb-3">Why is this a priority?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {factors.map(([key, factor]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-medium text-foreground">{factor.explanation}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OfficialDashboard;
