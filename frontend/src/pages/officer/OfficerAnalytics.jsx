import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BackButton from '../../components/common/BackButton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

const OfficerAnalytics = () => {
  const { user } = useAuth();
  const [categoriesData, setCategoriesData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [districtsData, setDistrictsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [catRes, trendsRes, distRes] = await Promise.all([
          analyticsService.getCategories({ state: user?.state }),
          analyticsService.getTrends({ months: 6, state: user?.state }),
          analyticsService.getTopDistricts({ limit: 5 })
        ]);

        setCategoriesData(catRes.data);
        setTrendsData(trendsRes.data);
        setDistrictsData(distRes.data);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div className="min-h-[60vh] flex justify-center items-center"><LoadingSpinner size="lg" /></div>;
  }

  // Transform category data for pie chart
  const pieData = categoriesData.slice(0, 6).map(c => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    value: c.count
  }));

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold">Constituency Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">Deep dive into submission data, trends, and category breakdowns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Line Chart */}
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-6">Submission Trends (Last 6 Months)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="submissions" name="Total Issues" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-6">Issues by Category</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoriesData.slice(0, 7)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                <XAxis dataKey="category" stroke="#888" fontSize={12} tickLine={false} axisLine={false} 
                  tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)} 
                />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                />
                <Bar dataKey="count" name="Total Submissions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie */}
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-6">Top Issue Distribution</h2>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Districts/Constituencies Comparison */}
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-6">Top Affected Areas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surfaceHover">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg font-medium">District</th>
                  <th className="px-4 py-3 font-medium">Issues</th>
                  <th className="px-4 py-3 font-medium">Resolution %</th>
                  <th className="px-4 py-3 rounded-tr-lg font-medium">Avg Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {districtsData.map((dist, idx) => (
                  <tr key={idx} className="hover:bg-surface/50">
                    <td className="px-4 py-3 font-medium">{dist.district}</td>
                    <td className="px-4 py-3">{dist.count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{dist.resolutionRate}%</span>
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div 
                            className={`h-1.5 rounded-full ${dist.resolutionRate > 50 ? 'bg-success' : 'bg-warning'}`} 
                            style={{ width: `${dist.resolutionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${dist.avgScore > 7 ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                        {dist.avgScore.toFixed(1)} / 10
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OfficerAnalytics;

