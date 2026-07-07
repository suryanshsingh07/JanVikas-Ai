import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { User, Mail, MapPin, Phone, Shield, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BackButton from '../../components/common/BackButton';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      state: user?.state || '',
      district: user?.district || '',
      constituency: user?.constituency || '',
      language: user?.language || 'en'
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phone: user.phone || '',
        state: user.state,
        district: user.district,
        constituency: user.constituency || '',
        language: user.language || 'en'
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await authService.updateProfile(data);
      setUser(res.user);
      toast.success(res.message || 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setAvatarUploading(true);
    try {
      const res = await authService.uploadAvatar(file);
      setUser(res.user);
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BackButton className="mb-6" />
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Account Profile</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your personal information and preferences.</p>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-surfaceHover border-b border-border p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-background overflow-hidden bg-surface flex items-center justify-center shrink-0">
              {avatarUploading ? (
                <LoadingSpinner size="sm" />
              ) : user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
            </div>
            
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-primary-700 transition-colors shadow-sm border-2 border-background">
              <Camera size={14} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={avatarUploading} />
            </label>
          </div>
          
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <Mail size={14} /> {user?.email}
            </p>
            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                {user?.role} Account
              </span>
              {user?.isActive && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-success/10 text-success border border-success/20">
                  Active
                </span>
              )}
            </div>
          </div>

          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-background transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${!isEditing ? 'opacity-70 bg-surface' : ''} ${errors.name ? 'border-danger' : 'border-border'}`}
                    {...register('name', { required: 'Name is required' })}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all ${!isEditing ? 'opacity-70 bg-surface' : 'border-border'}`}
                    placeholder="Optional"
                    {...register('phone')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">State</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <MapPin size={16} />
                  </div>
                  <input
                    type="text"
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all ${!isEditing ? 'opacity-70 bg-surface' : 'border-border'} ${errors.state ? 'border-danger' : 'border-border'}`}
                    {...register('state', { required: 'State is required' })}
                  />
                </div>
                {errors.state && <p className="mt-1 text-xs text-danger">{errors.state.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">District</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <MapPin size={16} />
                  </div>
                  <input
                    type="text"
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all ${!isEditing ? 'opacity-70 bg-surface' : 'border-border'} ${errors.district ? 'border-danger' : 'border-border'}`}
                    {...register('district', { required: 'District is required' })}
                  />
                </div>
                {errors.district && <p className="mt-1 text-xs text-danger">{errors.district.message}</p>}
              </div>

            </div>

            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-sm font-medium hover:bg-surfaceHover rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <LoadingSpinner size="sm" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* Security Section (Placeholder) */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-primary-500" /> Security Settings
        </h3>
        <p className="text-sm text-gray-500 mb-4">Update your password to keep your account secure.</p>
        <button className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors">
          Change Password
        </button>
      </div>
    </div>
  );
};

export default Profile;
