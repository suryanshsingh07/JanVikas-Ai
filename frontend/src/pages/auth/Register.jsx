import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Remove confirmPassword from payload
    const { confirmPassword, ...payload } = data;
    
    // Default role citizen
    payload.role = 'citizen';
    
    const result = await registerUser(payload);
    setIsSubmitting(false);
    
    if (result.success) {
      navigate('/citizen');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold mb-2">Create Account</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Join JanVikas AI to voice your local issues.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5" htmlFor="name">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                id="name"
                type="text"
                className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.name ? 'border-danger' : 'border-border'}`}
                placeholder="John Doe"
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && <p className="mt-1.5 text-sm text-danger">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.email ? 'border-danger' : 'border-border'}`}
                placeholder="you@example.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' }
                })}
              />
            </div>
            {errors.email && <p className="mt-1.5 text-sm text-danger">{errors.email.message}</p>}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="state">State</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MapPin size={18} />
              </div>
              <input
                id="state"
                type="text"
                className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.state ? 'border-danger' : 'border-border'}`}
                placeholder="Maharashtra"
                {...register('state', { required: 'State is required' })}
              />
            </div>
            {errors.state && <p className="mt-1.5 text-sm text-danger">{errors.state.message}</p>}
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="district">District</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MapPin size={18} />
              </div>
              <input
                id="district"
                type="text"
                className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.district ? 'border-danger' : 'border-border'}`}
                placeholder="Pune"
                {...register('district', { required: 'District is required' })}
              />
            </div>
            {errors.district && <p className="mt-1.5 text-sm text-danger">{errors.district.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="password">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-10 py-2.5 bg-surface border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.password ? 'border-danger' : 'border-border'}`}
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters' }
                })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-sm text-danger">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.confirmPassword ? 'border-danger' : 'border-border'}`}
                placeholder="••••••••"
                {...register('confirmPassword', { 
                  required: 'Confirm password',
                  validate: value => value === password || 'Passwords do not match'
                })}
              />
            </div>
            {errors.confirmPassword && <p className="mt-1.5 text-sm text-danger">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              Create Account
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
