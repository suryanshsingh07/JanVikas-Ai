import { useState, useEffect } from 'react';
import { Search, MapPin, IndianRupee, Briefcase, Filter } from 'lucide-react';
import { projectService } from '../../services/projectService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PROJECT_STATUSES } from '../../constants';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: '', status: '', search: '' });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getAll(filters);
      setProjects(res.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []); // Fetch initially

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">National Project Oversight</h1>
          <p className="text-gray-500 dark:text-gray-400">Monitor development projects across all constituencies.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </form>
        
        <div className="flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full md:w-auto px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            {PROJECT_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <button 
            onClick={fetchProjects}
            className="px-4 py-2 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surfaceHover border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                    No projects found matching the criteria.
                  </td>
                </tr>
              ) : (
                projects.map(p => {
                  const statusObj = PROJECT_STATUSES.find(s => s.id === p.status);
                  
                  return (
                    <tr key={p._id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-4 min-w-[250px]">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 shrink-0 text-primary-500">
                            <Briefcase size={18} />
                          </div>
                          <div>
                            <p className="font-semibold">{p.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <MapPin size={14} />
                          <span>{p.location?.district || '-'}, {p.location?.state || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium">
                        ₹{p.estimatedBudget?.toLocaleString() || '0'}
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-surface border border-border ${statusObj?.color || 'text-gray-500'}`}>
                          {statusObj?.label || p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProjects;
