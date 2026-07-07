import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Map, 
  BarChart3, 
  Briefcase, 
  Users, 
  ShieldAlert,
  Database,
  BrainCircuit,
  FileBarChart
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case 'citizen':
        return [
          { name: t('sidebar.dashboard'), path: '/citizen', icon: LayoutDashboard },
          { name: t('sidebar.reportIssue'), path: '/citizen/submit', icon: PlusCircle },
          { name: t('sidebar.mySubmissions'), path: '/citizen/submissions', icon: FileText },
        ];
      case 'officer':
        return [
          { name: t('sidebar.dashboard'), path: '/officer', icon: LayoutDashboard },
          { name: 'Account Management', path: '/officer/accounts', icon: Users },
          { name: t('sidebar.aiInsights'), path: '/officer/ai-insights', icon: BrainCircuit },
          { name: 'Submissions Map', path: '/officer/map', icon: Map },
          { name: 'All Submissions', path: '/officer/submissions', icon: FileText },
          { name: t('sidebar.manageProjects'), path: '/officer/projects', icon: Briefcase },
          { name: 'Analytics', path: '/officer/analytics', icon: BarChart3 },
        ];
      case 'department':
        return [
          { name: t('sidebar.dashboard'), path: '/department', icon: LayoutDashboard },
          { name: 'Account Management', path: '/department/accounts', icon: Users },
          { name: 'All Submissions', path: '/department/submissions', icon: FileText },
          { name: t('sidebar.manageProjects'), path: '/department/projects', icon: Briefcase },
          { name: 'Analytics', path: '/department/analytics', icon: BarChart3 },
        ];
      case 'ngo':
        return [
          { name: t('sidebar.dashboard'), path: '/ngo', icon: LayoutDashboard },
          { name: 'All Submissions', path: '/ngo/submissions', icon: FileText },
        ];
      case 'admin':
        return [
          { name: 'Overview', path: '/admin', icon: LayoutDashboard },
          { name: 'Account Management', path: '/admin/accounts', icon: Users },
          { name: t('sidebar.userManagement'), path: '/admin/users', icon: Users },
          { name: t('sidebar.manageProjects'), path: '/admin/projects', icon: Briefcase },
          { name: 'Content Moderation', path: '/admin/moderation', icon: ShieldAlert },
          { name: t('sidebar.systemReports'), path: '/admin/reports', icon: FileBarChart },
          { name: 'Open Datasets', path: '/admin/datasets', icon: Database },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isOpen ? 280 : 0,
        x: isOpen ? 0 : -280
      }}
      className={cn(
        "fixed lg:relative z-50 h-screen bg-surface border-r border-border flex flex-col transition-all duration-300 ease-in-out",
        "lg:w-64 lg:translate-x-0" // Always visible on desktop
      )}
    >
      <div className="p-4 md:p-6 flex-grow overflow-y-auto no-scrollbar">
        {/* Brand - Mobile only (desktop has it in navbar) */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <img src="/favicon.ico" className="w-8 h-8 object-contain rounded-md" />
          <span className="font-display font-bold text-xl tracking-tight">JanVikas AI</span>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
              Menu
            </p>
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" 
                        : "text-foreground hover:bg-surfaceHover"
                    )}
                  >
                    <Icon size={18} className={isActive ? "text-primary-500" : "text-gray-400 dark:text-gray-500"} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Storage/Plan Info (Decorative for Hackathon) */}
      <div className="p-4 border-t border-border bg-surfaceHover/50">
        <div className="bg-surface border border-border p-3 rounded-lg shadow-sm">
          <p className="text-xs font-medium mb-1">AI Usage Quota</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
            <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-[10px] text-gray-500 text-right">4.5M / 10M tokens</p>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
