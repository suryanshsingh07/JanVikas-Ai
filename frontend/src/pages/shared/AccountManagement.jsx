import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Power, User, Shield, Briefcase, Heart, Search } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import BackButton from '../../components/common/BackButton';

const roleRanks = {
  admin: 100,
  department: 80,
  officer: 60,
  ngo: 40,
  citizen: 20
};

const RoleIcon = ({ role }) => {
  switch (role) {
    case 'admin': return <Shield className="w-4 h-4 text-red-500" />;
    case 'department': return <Briefcase className="w-4 h-4 text-purple-500" />;
    case 'officer': return <Briefcase className="w-4 h-4 text-blue-500" />;
    case 'ngo': return <Heart className="w-4 h-4 text-green-500" />;
    default: return <User className="w-4 h-4 text-gray-500" />;
  }
};

const AccountManagement = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    phone: '',
    state: ''
  });

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.accounts || []);
    } catch (err) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounts', formData);
      toast.success('Account created successfully');
      setIsModalOpen(false);
      fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to create account');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/accounts/${id}/status`);
      toast.success('Status updated');
      fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await api.delete(`/accounts/${id}`);
      toast.success('Account deleted');
      fetchAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
    }
  };

  // Compute allowed roles for creation
  const myRank = roleRanks[currentUser.role];
  const allowedRoles = Object.keys(roleRanks).filter(r => roleRanks[r] < myRank);

  const filteredAccounts = accounts.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BackButton />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 mt-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
            Account Management
          </h1>
          <p className="text-gray-500 mt-1">Manage junior accounts and permissions hierarchically.</p>
        </div>
        
        {allowedRoles.length > 0 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Account
          </button>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-surfaceHover flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search accounts..."
            className="bg-transparent border-none focus:outline-none w-full text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-border text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading accounts...</td></tr>
              ) : filteredAccounts.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No accounts found.</td></tr>
              ) : (
                filteredAccounts.map(account => (
                  <tr key={account._id} className="hover:bg-surfaceHover/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{account.name}</div>
                      <div className="text-sm text-gray-500">{account.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surfaceHover w-max border border-border">
                        <RoleIcon role={account.role} />
                        <span className="text-xs font-medium capitalize">{account.role}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        account.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {account.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleToggleStatus(account._id)}
                        className={`p-2 rounded-lg border transition-colors ${
                          account.isActive ? 'border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-900/50' : 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900/50'
                        }`}
                        title={account.isActive ? 'Disable Account' : 'Enable Account'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(account._id)}
                        className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background border border-border p-6 rounded-2xl shadow-2xl max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4">Create New Account</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input required type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input required type="password" minLength="6" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select className="input-field capitalize" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  {allowedRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Account</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
