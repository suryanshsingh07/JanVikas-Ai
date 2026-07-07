import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DEMO_CREDENTIALS = [
  { role: 'Citizen', email: 'citizen@test.com', password: 'Password123', color: 'bg-success/10 text-success border-success/20 hover:bg-success/20' },
  { role: 'Official', email: 'official@test.com', password: 'Password123', color: 'bg-primary-500/10 text-primary-600 border-primary-500/20 hover:bg-primary-500/20' },
  { role: 'Admin', email: 'admin@test.com', password: 'Password123', color: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' },
];

const Login = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const fillDemo = (cred) => {
    setValue('email', cred.email, { shouldValidate: true });
    setValue('password', cred.password, { shouldValidate: true });
    setActiveDemo(cred.role);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await login(data.email, data.password);
    setIsSubmitting(false);
    
    if (result.success) {
      if (from === '/') {
        if (result.role === 'admin') navigate('/admin');
        else if (result.role === 'official') navigate('/official');
        else navigate('/citizen');
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold mb-2">Welcome Back</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Sign in to access your JanVikas AI dashboard.
        </p>
      </div>

      {/* Quick Demo Login */}
      <div className="mb-6 p-4 rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-warning" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Demo Login</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_CREDENTIALS.map((cred) => (
            <button
              key={cred.role}
              type="button"
              onClick={() => fillDemo(cred)}
              className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all duration-200 ${cred.color} ${activeDemo === cred.role ? 'ring-2 ring-offset-1' : ''}`}
            >
              {cred.role}
            </button>
          ))}
        </div>
        {activeDemo && (
          <p className="mt-2 text-xs text-gray-400 text-center">
            ✓ {activeDemo} credentials filled — click Sign In
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              id="email"
              type="email"
              className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.email ? 'border-danger' : 'border-border'}`}
              placeholder="you@example.com"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' }
              })}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-sm text-danger">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium" htmlFor="password">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary-500 hover:text-primary-600 font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`w-full pl-10 pr-10 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.password ? 'border-danger' : 'border-border'}`}
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              Sign In
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default Login;
