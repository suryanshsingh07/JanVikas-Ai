import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

const LoadingSpinner = ({ size = 'md', className, text }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16',
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-primary-500", sizeClasses[size])} />
      {text && <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
