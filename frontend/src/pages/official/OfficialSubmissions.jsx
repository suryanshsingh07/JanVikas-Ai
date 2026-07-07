import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Filter, Search, ArrowRight, CheckCircle, AlertTriangle, MessageSquare, MapPin } from 'lucide-react';
import { useSubmissions } from '../../hooks/useSubmissions';
import { getCategory, getStatus } from '../../utils/helpers';
import { formatDate } from '../../utils/formatters';
import { CATEGORIES, SUBMISSION_STATUSES } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { usePagination } from '../../hooks/usePagination';
import { submissionService } from '../../services/submissionService';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const OfficialSubmissions = () => {
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialId = searchParams.get('id');

  const [filters, setFilters] = useState({ 
    category: '', 
    status: '', 
    search: '',
    state: user?.state || '',
    district: user?.district || '',
    isDuplicate: ''
  });
  
  const { page, limit, goToPage, pageNumbers } = usePagination(1, 15);
  
  const { data, pagination, loading, updateParams, refresh } = useSubmissions({
    page,
    limit,
    ...filters
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    goToPage(1);
    updateParams({ ...filters, page: 1 });
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await submissionService.updateStatus(id, newStatus, `Status updated to ${newStatus} by Official office.`);
      toast.success('Status updated successfully');
      refresh();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">All Submissions</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage and review all issues reported by citizens in your area.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            placeholder="Search by title, description, or ID..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-full sm:w-auto px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full sm:w-auto px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            {SUBMISSION_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>

          <select
            name="isDuplicate"
            value={filters.isDuplicate}
            onChange={handleFilterChange}
            className="w-full sm:w-auto px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Show All (Incl. Duplicates)</option>
            <option value="false">Unique Issues Only</option>
            <option value="true">Duplicates Only</option>
          </select>

          <button 
            onClick={applyFilters}
            className="px-4 py-2 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surfaceHover border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Issue Detail</th>
                <th className="px-4 py-3 font-medium">Citizen</th>
                <th className="px-4 py-3 font-medium">AI Priority</th>
                <th className="px-4 py-3 font-medium">Votes</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                    No submissions found matching criteria.
                  </td>
                </tr>
              ) : (
                data.map(sub => {
                  const category = getCategory(sub.category);
                  const statusObj = getStatus(sub.status);
                  const isHighlighted = initialId === sub._id;
                  
                  return (
                    <tr key={sub._id} className={`hover:bg-surface/50 transition-colors ${isHighlighted ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                      <td className="px-4 py-4 min-w-[300px]">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-8 h-8 rounded bg-surface border border-border flex items-center justify-center shrink-0">
                            {category.label.charAt(0)}
                          </div>
                          <div>
                            <Link to={`/citizen/track/${sub._id}`} className="font-semibold text-base hover:text-primary-500 transition-colors line-clamp-1">
                              {sub.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>{formatDate(sub.createdAt)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><MapPin size={10} /> {sub.location.district}</span>
                            </div>
                            {sub.aiAnalysis?.isDuplicate && (
                              <span className="inline-block mt-1 text-[10px] uppercase font-bold bg-warning/10 text-warning px-1.5 py-0.5 rounded border border-warning/20">
                                Duplicate
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap">
                        {sub.isAnonymous ? (
                          <span className="text-gray-500 italic">Anonymous</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                              {sub.citizen?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-medium">{sub.citizen?.name || 'Unknown User'}</span>
                          </div>
                        )}
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${sub.aiAnalysis?.priorityScore >= 7 ? 'text-danger' : sub.aiAnalysis?.priorityScore >= 4 ? 'text-warning' : 'text-info'}`}>
                            {sub.aiAnalysis?.priorityScore || 0}/10
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-medium flex items-center gap-1">
                          {sub.votes}
                        </span>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={sub.status}
                          onChange={(e) => handleStatusUpdate(sub._id, e.target.value)}
                          className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border-0 cursor-pointer focus:ring-2 ${statusObj.bg} ${statusObj.color}`}
                        >
                          {SUBMISSION_STATUSES.map(s => (
                            <option key={s.id} value={s.id} className="bg-background text-foreground">{s.label}</option>
                          ))}
                        </select>
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <Link 
                          to={`/citizen/track/${sub._id}`}
                          className="p-2 inline-flex items-center justify-center rounded hover:bg-surfaceHover text-gray-500 hover:text-primary-500 transition-colors"
                          title="View Details"
                        >
                          <ArrowRight size={18} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && pagination?.pages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-center gap-2">
            <button
              onClick={() => { goToPage(page - 1); updateParams({ page: page - 1 }); }}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-border bg-surface hover:bg-surfaceHover disabled:opacity-50"
            >
              Prev
            </button>
            {pageNumbers.map((p, i) => (
              <button
                key={i}
                onClick={() => p !== '...' && (goToPage(p), updateParams({ page: p }))}
                disabled={p === '...'}
                className={`px-3 py-1 rounded border ${
                  page === p ? 'bg-primary-500 text-white border-primary-500' : 'bg-surface border-border hover:bg-surfaceHover'
                } ${p === '...' ? 'cursor-default opacity-50' : ''}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => { goToPage(page + 1); updateParams({ page: page + 1 }); }}
              disabled={page === pagination.pages}
              className="px-3 py-1 rounded border border-border bg-surface hover:bg-surfaceHover disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficialSubmissions;
