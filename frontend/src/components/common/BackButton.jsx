import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/**
 * BackButton — renders on every page except the Landing page (/).
 * Shows a subtle "← Back" button that goes one step back in history.
 */
const BackButton = ({ className = '' }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Don't show on the landing/root page
  if (pathname === '/') return null;

  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className={`group inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400
        hover:text-foreground transition-colors duration-150 ${className}`}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full border border-border
          bg-surface/80 backdrop-blur-sm shadow-sm
          group-hover:border-primary-500/50 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20
          transition-all duration-150"
      >
        <ChevronLeft size={14} className="group-hover:text-primary-500 transition-colors" />
      </span>
      <span className="group-hover:text-primary-500 transition-colors">Back</span>
    </button>
  );
};

export default BackButton;
