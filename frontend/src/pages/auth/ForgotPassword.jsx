import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Password reset link sent to your email');
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Send className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-4">Check your email</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          We've sent a password reset link to your email address. Please check your inbox and spam folder.
        </p>
        <Link 
          to="/login"
          className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium"
        >
          <ArrowLeft size={18} />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to login
        </Link>
        <h2 className="text-3xl font-display font-bold mb-2">Forgot Password</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
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
              className={`w-full pl-10 pr-4 py-2.5 bg-surface border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.email ? 'border-danger' : 'border-border'}`}
              placeholder="you@example.com"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' }
              })}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-sm text-danger">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <LoadingSpinner size="sm" /> : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
