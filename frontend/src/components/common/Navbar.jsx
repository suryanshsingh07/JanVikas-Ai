import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useContext, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationContext } from '../../context/NotificationContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { truncateText, formatRelativeTime } from '../../utils/formatters';

const Navbar = ({ toggleSidebar, isPublic = false }) => {
  const { user, logout } = useAuth();
  const { unreadCount, notifications, markAsRead } = useContext(NotificationContext) || { unreadCount: 0, notifications: [], markAsRead: () => { } };
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'officer') return '/officer';
    if (user.role === 'department') return '/department';
    if (user.role === 'ngo') return '/ngo';
    return '/citizen';
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead([notif._id]);
    }
    setShowNotifications(false);

    // Route based on notification type
    if (notif.type.includes('submission') && notif.data?.submissionId) {
      if (user.role === 'citizen') {
        navigate(`/submissions/${notif.data.submissionId}`);
      } else {
        navigate(`/${user.role}/submissions?id=${notif.data.submissionId}`);
      }
    } else {
      navigate(`/${user.role}/notifications`);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-surface/80 backdrop-blur-md border-b border-border h-16 flex items-center px-4 md:px-6">
      <div className="flex items-center justify-between w-full">

        {/* Left Side: Back Button, Logo & Menu Toggle */}
        <div className="flex items-center gap-4">
          {!isPublic && toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md hover:bg-surfaceHover text-foreground"
            >
              <Menu size={20} />
            </button>
          )}

          <Link to={getRoleRoute()} className="flex items-center gap-2 group">
            <img src="/favicon.ico" className="w-8 h-8 object-contain transition-transform group-hover:scale-105" />
            <span className="font-display font-bold text-xl hidden sm:block tracking-tight text-foreground">
              JanVikas <span className="text-primary-500">AI</span>
            </span>
          </Link>
        </div>

        {/* Middle Links (Public Only) */}
        {isPublic && (
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <a href="#features" className="text-sm font-medium hover:text-primary-500 transition-colors">Features</a>
            <a href="#tenders" className="text-sm font-medium hover:text-primary-500 transition-colors">Open Tenders</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-primary-500 transition-colors">How it Works</a>
          </div>
        )}

        {/* Right Side: Language, Theme, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher />
          <ThemeToggle />

          {!user ? (
            <div className="flex items-center gap-2 sm:gap-4 ml-2">
              <Link to="/login" className="text-sm font-medium hover:text-primary-500 transition-colors hidden sm:block">
                {t('navbar.login')}
              </Link>
              <Link to="/register" className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                {t('navbar.signup')}
              </Link>
            </div>
          ) : (
            <>
              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full hover:bg-surfaceHover transition-colors"
                >
                  <Bell size={20} className="text-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-surface"></span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="fixed left-4 right-4 top-[70px] sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-80 bg-background border border-border shadow-lg rounded-xl overflow-hidden z-50"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/50">
                        <h3 className="font-semibold text-sm">{t('navbar.notifications')}</h3>
                        {unreadCount > 0 && (
                          <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map(notif => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3 border-b border-border last:border-0 cursor-pointer hover:bg-surfaceHover transition-colors ${!notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-sm font-medium ${!notif.isRead ? 'text-foreground' : 'text-gray-600 dark:text-gray-300'}`}>
                                  {notif.title}
                                </h4>
                                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 mt-1 flex-shrink-0"></div>}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2 mb-1">{notif.message}</p>
                              <span className="text-[10px] text-gray-400">{formatRelativeTime(notif.createdAt)}</span>
                            </div>
                          ))
                        )}
                      </div>

                      <Link
                        to={`/${user.role}/notifications`}
                        onClick={() => setShowNotifications(false)}
                        className="block w-full text-center text-xs font-medium text-primary-500 hover:text-primary-600 p-3 border-t border-border bg-surfaceHover/50"
                      >
                        {t('navbar.viewAllNotifications')}
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-surfaceHover transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center border border-primary-200 dark:border-primary-800">
                      <User size={16} className="text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-background border border-border shadow-lg rounded-xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-border bg-surface/50">
                        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <div className="mt-1 flex items-center">
                          <span className="text-[10px] uppercase font-bold bg-surface text-foreground px-2 py-0.5 rounded border border-border">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to={`/${user.role}/profile`}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surfaceHover transition-colors"
                        >
                          <Settings size={16} />
                          {t('navbar.accountSettings')}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
                        >
                          <LogOut size={16} />
                          {t('navbar.logout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
