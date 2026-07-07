import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { Users, Search, MoreVertical, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import BackButton from '../../components/common/BackButton';

const ROLE_COLORS = {
  admin:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  department: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  officer:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ngo:        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  citizen:    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', search: '', isActive: '' });
  const debouncedSearch = useDebounce(filters.search, 300);

  const { page, limit, setTotal, totalPages, goToPage, pageNumbers } = usePagination(1, 15);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...filters, search: debouncedSearch };
      const res = await adminService.getUsers(params);
      setUsers(res.data);
      setTotal(res.pagination.total);
    } catch (error) {
      toast.error('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters.role, filters.isActive, debouncedSearch, setTotal]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    goToPage(1);
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await adminService.toggleUserStatus(userId);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <BackButton />

      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Users size={22} /> User Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View, search, and manage all platform users.</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name, email, or district..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select name="role" value={filters.role} onChange={handleFilterChange}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
            <option value="">All Roles</option>
            <option value="citizen">Citizen</option>
            <option value="officer">Officer</option>
            <option value="department">Department</option>
            <option value="ngo">NGO</option>
            <option value="admin">Admin</option>
          </select>
          <select name="isActive" value={filters.isActive} onChange={handleFilterChange}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
            <option value="">Any Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surfaceHover border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12"><LoadingSpinner /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-gray-500">No users found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`capitalize text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role] || ROLE_COLORS.citizen}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {user.district && user.state ? `${user.district}, ${user.state}` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleStatusToggle(user._id, user.isActive)}>
                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${user.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          {user.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="relative group inline-block">
                        <button className="p-2 rounded-full hover:bg-surfaceHover">
                          <MoreVertical size={16} />
                        </button>
                        <div className="absolute right-0 mt-1 w-40 bg-background border border-border rounded-lg shadow-lg z-10 hidden group-hover:block">
                          <button className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-surfaceHover text-sm">
                            <Edit size={14} /> Edit Role
                          </button>
                          <button className="w-full text-left flex items-center gap-2 px-3 py-2 text-danger hover:bg-danger/10 text-sm">
                            <Trash2 size={14} /> Delete User
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-center gap-2">
            <button onClick={() => goToPage(page - 1)} disabled={page === 1}
              className="px-3 py-1 rounded border border-border bg-surface hover:bg-surfaceHover disabled:opacity-50 text-sm">
              Prev
            </button>
            {pageNumbers.map((p, i) => (
              <button key={i} onClick={() => p !== '...' && goToPage(p)} disabled={p === '...'}
                className={`px-3 py-1 rounded border text-sm ${page === p ? 'bg-primary-500 text-white border-primary-500' : 'bg-surface border-border hover:bg-surfaceHover'} ${p === '...' ? 'cursor-default opacity-50' : ''}`}>
                {p}
              </button>
            ))}
            <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}
              className="px-3 py-1 rounded border border-border bg-surface hover:bg-surfaceHover disabled:opacity-50 text-sm">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;