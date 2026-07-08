import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Briefcase, Plus, Search, MapPin, IndianRupee, Users, Check, X } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../hooks/useAuth';
import { CATEGORIES, PROJECT_STATUSES } from '../../constants';
import { getCategory } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../../components/common/BackButton';

const OfficerProjects = () => {
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialProjectId = searchParams.get('id');

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectService.getAll({ district: user?.district });
      setProjects(res.data);
      
      if (initialProjectId && !showForm) {
        // Expand the specific project if passed via URL
        // Currently we don't have a specific expansion state, but this could trigger a modal in the future
      }
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const onSubmit = async (data) => {
    if (!user?.state || !user?.district) {
      toast.error('Your profile must include state and district before proposing a project.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        estimatedBudget: Number(data.estimatedBudget) || 0,
        location: {
          state: user.state,
          district: user.district,
          constituency: user.constituency || '',
        },
      };

      await projectService.create(payload);
      toast.success('Project created successfully');
      setShowForm(false);
      reset();
      fetchProjects();
    } catch (error) {
      const validationErrors = Array.isArray(error.errors)
        ? error.errors.map((err) => err.message).join('. ')
        : null;

      toast.error(validationErrors || error.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await projectService.updateStatus(id, status);
      toast.success('Status updated');
      setProjects(prev => prev.map(p => p._id === id ? { ...p, status } : p));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Project Planning</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage constituency development projects and budgets.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Propose Project</>}
        </button>
      </div>

      {/* New Project Form (Collapsible) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6 rounded-xl mb-6 border border-primary-200 dark:border-primary-800">
              <h2 className="text-lg font-semibold border-b border-border pb-3 mb-5">Propose New Project</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Project Title</label>
                    <input
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      {...register('title', { required: 'Title is required' })}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Description</label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      {...register('description', { required: 'Description is required' })}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Category</label>
                    <select
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      {...register('category', { required: 'Category is required' })}
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Estimated Budget (₹)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary-500"
                      {...register('estimatedBudget', { required: 'Budget is required', min: 0 })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <LoadingSpinner size="sm" /> : <Check size={18} />}
                    Save Project
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : projects.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center rounded-xl">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              There are no active projects in your constituency. Propose a new project to get started.
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Propose Project
            </button>
          </div>
        ) : (
          projects.map(project => {
            const category = getCategory(project.category);
            const statusColor = PROJECT_STATUSES.find(s => s.id === project.status)?.color || 'text-gray-500';
            
            return (
              <div key={project._id} className={`glass-card p-5 rounded-xl border ${initialProjectId === project._id ? 'border-primary-500 shadow-md' : 'border-border'}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface border border-border flex items-center gap-1 ${statusColor}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  {project.priorityScore && (
                    <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                      AI Score: {project.priorityScore.toFixed(1)}
                    </span>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-4 h-[60px]">{project.description}</p>
                
                <div className="space-y-2 pt-4 border-t border-border mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1"><IndianRupee size={14}/> Budget</span>
                    <span className="font-medium">₹{project.estimatedBudget?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1"><Users size={14}/> Linked Issues</span>
                    <span className="font-medium">{project.relatedSubmissions?.length || 0} Submissions</span>
                  </div>
                </div>

                {/* Status Updater */}
                <select
                  value={project.status}
                  onChange={(e) => handleStatusUpdate(project._id, e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded focus:ring-1 focus:ring-primary-500"
                >
                  {PROJECT_STATUSES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OfficerProjects;

