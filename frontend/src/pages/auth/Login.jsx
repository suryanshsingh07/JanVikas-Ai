import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap, ShieldX, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BackButton from '../../components/common/BackButton';

const DEMO_CREDENTIALS = [
  { role: 'Citizen', email: 'citizen@janvikas.ai', password: 'password123', color: 'bg-success/10 text-success border-success/20 hover:bg-success/20' },
  { role: 'Officer', email: 'officer@janvikas.ai', password: 'password123', color: 'bg-primary-500/10 text-primary-600 border-primary-500/20 hover:bg-primary-500/20' },
  { role: 'Department', email: 'dept@janvikas.ai', password: 'password123', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20' },
  { role: 'NGO', email: 'ngo@janvikas.ai', password: 'password123', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20' },
  { role: 'Admin', email: 'admin@janvikas.ai', password: 'password123', color: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' },
];

/* ─── Account Disabled Screen ─────────────────────────────── */
const AccountDisabledScreen = ({ message, onBack }) => (
  <div className="text-center py-4">
    <div className="flex justify-center mb-6">
      <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <ShieldX size={40} className="text-red-500" />
      </div>
    </div>
    <h2 className="text-2xl font-display font-bold mb-3 text-red-600 dark:text-red-400">
      Account Disabled
    </h2>
    <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
      {message || 'Your account has been disabled by an administrator.'}
    </p>
    <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 mb-6 text-left">
      <p className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2">
        What to do next?
      </p>
      <ul className="text-sm text-orange-600 dark:text-orange-500 space-y-1.5 list-disc list-inside">
        <li>Contact your officer or department administrator</li>
        <li>Email support at <span className="font-medium">support@janvikas.ai</span></li>
        <li>Call helpline: <span className="font-medium">1800-XXX-XXXX</span></li>
      </ul>
    </div>
    <div className="flex gap-3">
      <button
        onClick={onBack}
        className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors"
      >
        ← Try Again
      </button>
      <a
        href="mailto:support@janvikas.ai"
        className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
      >
        <Phone size={14} /> Contact Support
      </a>
    </div>
  </div>
);

const Login = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const [accountDisabled, setAccountDisabled] = useState(false);
  const [disabledMsg, setDisabledMsg] = useState('');
  const { t } = useTranslation();
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
        else if (result.role === 'officer') navigate('/officer');
        else if (result.role === 'department') navigate('/department');
        else if (result.role === 'ngo') navigate('/ngo');
        else navigate('/citizen');
      } else {
        navigate(from, { replace: true });
      }
    } else if (result.accountDisabled) {
      setAccountDisabled(true);
      setDisabledMsg(result.message);
    }
  };

  if (accountDisabled) {
    return (
      <AccountDisabledScreen
        message={disabledMsg}
        onBack={() => setAccountDisabled(false)}
      />
    );
  }

  return (
    <div>
      <BackButton className="mb-6" />
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold mb-2">{t('login.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {t('login.subtitle')}
        </p>
      </div>

      {/* Quick Demo Login */}
      <div className="mb-6 p-4 rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-warning" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('login.demoTitle')}</span>
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
            ✓ {activeDemo} {t('login.demoFilled')}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="email">{t('login.emailLabel')}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              id="email"
              type="email"
              className={`w-full pl-10 pr-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${errors.email ? 'border-danger' : 'border-border'}`}
              placeholder={t('login.emailPlaceholder')}
              {...register('email', {
                required: t('login.validation.emailRequired'),
                pattern: { value: /\S+@\S+\.\S+/, message: t('login.validation.invalidEmail') }
              })}
            />
          </div>
          {errors.email && <p className="mt-1.5 text-sm text-danger">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium" htmlFor="password">{t('login.passwordLabel')}</label>
            <Link to="/forgot-password" className="text-xs text-primary-500 hover:text-primary-600 font-medium">
              {t('login.forgotPassword')}
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
              placeholder={t('login.passwordPlaceholder')}
              {...register('password', { required: t('login.validation.passwordRequired') })}
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
              {t('login.signInButton')}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        {t('login.noAccount')}{' '}
        <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
          {t('login.createAccount')}
        </Link>
      </div>
    </div>
  );
};

export default Login;
