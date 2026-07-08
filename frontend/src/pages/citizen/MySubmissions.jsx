import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Filter, Search, ArrowRight, MapPin, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubmissions } from '../../hooks/useSubmissions';
import { getCategory, getStatus } from '../../utils/helpers';
import { formatDate } from '../../utils/formatters';
import { CATEGORIES, SUBMISSION_STATUSES } from '../../constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { usePagination } from '../../hooks/usePagination';
import { submissionService } from '../../services/submissionService';
import BackButton from '../../components/common/BackButton';

const MySubmissions = () => {
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { page, limit, goToPage, pageNumbers } = usePagination(1, 10);
  const { data, pagination, loading, updateParams, refresh } = useSubmissions({
    page,
    limit,
    mine: true,
    ...filters
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    goToPage(1); // Reset to page 1 on filter change
    updateParams({ ...filters, page: 1 });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await submissionService.delete(deleteConfirm);
      toast.success('Report deleted successfully');
      setDeleteConfirm(null);
      refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">My Reports</h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage all your submitted reports.</p>
        </div>
        <Link 
          to="/citizen/submit" 
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Report a New Issue
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            onKeyDown={handleKeyPress}
            placeholder="Search your reports..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div className="flex gap-2">
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

          <button 
            onClick={applyFilters}
            className="px-4 py-2 bg-surfaceHover border border-border rounded-lg hover:bg-border transition-colors flex items-center justify-center"
            title="Apply Filters"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="glass-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any reports matching your current filters. Try adjusting them or report a new issue.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.map((sub) => {
              const category = getCategory(sub.category);
              const status = getStatus(sub.status);
              
              return (
                <div 
                  key={sub._id}
                  onClick={() => navigate(`/submissions/${sub._id}`)}
                  className="block p-4 sm:p-6 hover:bg-surfaceHover transition-colors group cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        {sub.aiAnalysis?.isDuplicate && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-warning/10 text-warning">
                            Duplicate Flagged
                          </span>
                        )}
                        <span className="text-xs text-gray-500 hidden sm:inline-block">
                          • {formatDate(sub.createdAt)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-primary-500 transition-colors truncate">
                        {sub.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                        {sub.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                          <span className="w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center">
                            {category.label.charAt(0)}
                          </span>
                          {category.label}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={12} />
                          {sub.location.district || 'Unknown Location'}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-3 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 pl-0 sm:pl-6">
                        <Link
                        to={`/submissions/${sub._id}`}
                        className="text-sm font-medium text-primary-500 inline-flex items-center gap-1 hover:underline"
                        title="View report details"
                      >
                        View Report <ArrowRight size={16} />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(sub._id);
                        }}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
                        title="Delete this report"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
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
                page === p 
                  ? 'bg-primary-500 text-white border-primary-500' 
                  : 'bg-surface border-border hover:bg-surfaceHover'
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Delete Report?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to permanently delete this report? All associated votes, comments, and feedback will also be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-surfaceHover transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySubmissions;
