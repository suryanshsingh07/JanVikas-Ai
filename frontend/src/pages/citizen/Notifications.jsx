import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, ArrowRight } from 'lucide-react';
import { NotificationContext } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BackButton from '../../components/common/BackButton';

const Notifications = () => {
  const { notifications, loading, markAllAsRead, markAsRead, deleteNotification } = useContext(NotificationContext);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const navigate = useNavigate();

  const filteredNotifs = notifications.filter(n => filter === 'all' || !n.isRead);

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead([notif._id]);
    }
    
    // Route based on type
    if (notif.type.includes('submission') && notif.data?.submissionId) {
      navigate(`/citizen/track/${notif.data.submissionId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackButton className="mb-6" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400">Stay updated on your submissions and area news.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-surface border border-border rounded-lg p-1 flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-background shadow-sm' : 'text-gray-500 hover:text-foreground'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'unread' ? 'bg-background shadow-sm' : 'text-gray-500 hover:text-foreground'}`}
            >
              Unread
            </button>
          </div>
          
          <button 
            onClick={markAllAsRead}
            disabled={notifications.every(n => n.isRead)}
            className="flex items-center gap-2 bg-surface hover:bg-surfaceHover border border-border px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Check size={16} /> Mark all read
          </button>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner /></div>
        ) : filteredNotifs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You don't have any {filter === 'unread' ? 'unread' : ''} notifications at the moment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNotifs.map((notif) => (
              <div 
                key={notif._id} 
                className={`p-4 sm:p-6 transition-colors flex gap-4 ${!notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : 'hover:bg-surfaceHover'}`}
              >
                <div className="shrink-0 mt-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'bg-surface border border-border text-gray-500'}`}>
                    <Bell size={18} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-base font-semibold ${!notif.isRead ? 'text-foreground' : 'text-gray-700 dark:text-gray-300'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{notif.message}</p>
                  
                  <div className="flex items-center gap-3">
                    {notif.data?.submissionId && (
                      <button 
                        onClick={() => handleNotificationClick(notif)}
                        className="text-xs font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1"
                      >
                        View Details <ArrowRight size={14} />
                      </button>
                    )}
                    
                    <button 
                      onClick={() => deleteNotification(notif._id)}
                      className="text-xs font-medium text-gray-400 hover:text-danger flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
                
                {!notif.isRead && (
                  <div className="shrink-0 flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
