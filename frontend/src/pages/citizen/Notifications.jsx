import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, ArrowRight, X } from 'lucide-react';
import { NotificationContext } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BackButton from '../../components/common/BackButton';

const Notifications = () => {
  const { notifications, loading, markAllAsRead, markAsRead, deleteNotification } = useContext(NotificationContext);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const [selectedNotification, setSelectedNotification] = useState(null);
  const navigate = useNavigate();

  const filteredNotifs = notifications.filter(n => filter === 'all' || !n.isRead);

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead([notif._id]);
    }
    setSelectedNotification(notif);
  };

  const closeNotificationDetails = () => setSelectedNotification(null);

  const handleViewRelated = () => {
    if (!selectedNotification) return;
    if (selectedNotification.data?.submissionId) {
      navigate(`/submissions/${selectedNotification.data.submissionId}`);
      return;
    }
    if (selectedNotification.data?.link) {
      navigate(selectedNotification.data.link);
    }
  };

  const handleMarkAsSolved = () => {
    if (!selectedNotification) return;
    markAsRead([selectedNotification._id]);
    setSelectedNotification((prev) => prev ? { ...prev, isRead: true } : null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
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
                  className={`p-4 sm:p-6 transition-colors flex gap-4 cursor-pointer ${!notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : 'hover:bg-surfaceHover'}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="shrink-0 mt-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400' : 'bg-surface border border-border text-gray-500'}`}>
                      <Bell size={18} />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-3">
                      <div className="min-w-0">
                        <h3 className={`text-base font-semibold ${!notif.isRead ? 'text-foreground' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notif.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{notif.message}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleNotificationClick(notif); }}
                        className="text-xs font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1"
                      >
                        View Details <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); if (selectedNotification?._id === notif._id) setSelectedNotification(null); }}
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

        <aside className="glass-card rounded-xl border border-border p-6 min-h-[320px]">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div>
              <h2 className="text-lg font-semibold">Notification Details</h2>
              <p className="text-sm text-gray-500">Open a notification to see actions, links, and status.</p>
            </div>
            <button
              type="button"
              onClick={closeNotificationDetails}
              className="text-gray-400 hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          {selectedNotification ? (
            <div className="space-y-5">
              <div className="rounded-3xl bg-surface p-5 border border-border">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{selectedNotification.type.replace(/_/g, ' ')}</p>
                    <h3 className="text-2xl font-semibold mt-2">{selectedNotification.title}</h3>
                  </div>
                  <span className="text-xs text-gray-400">{formatRelativeTime(selectedNotification.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{selectedNotification.message}</p>
              </div>

              {selectedNotification.data && (
                <div className="rounded-3xl bg-background p-4 border border-border">
                  <h4 className="text-sm font-semibold mb-3">Related details</h4>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {selectedNotification.data.submissionId && (
                      <p><span className="font-medium">Submission:</span> {selectedNotification.data.submissionId}</p>
                    )}
                    {selectedNotification.data.projectId && (
                      <p><span className="font-medium">Project:</span> {selectedNotification.data.projectId}</p>
                    )}
                    {selectedNotification.data.tenderId && (
                      <p><span className="font-medium">Tender:</span> {selectedNotification.data.tenderId}</p>
                    )}
                    {selectedNotification.data.link && (
                      <p><span className="font-medium">Link:</span> {selectedNotification.data.link}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleMarkAsSolved}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  disabled={selectedNotification.isRead}
                >
                  <Check size={16} /> Mark as Solved
                </button>

                <button
                  type="button"
                  onClick={handleViewRelated}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium hover:bg-surfaceHover"
                >
                  View Related Item
                </button>

                <button
                  type="button"
                  onClick={() => {
                    deleteNotification(selectedNotification._id);
                    closeNotificationDetails();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 size={16} /> Delete Notification
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl p-6 bg-surface border border-border text-gray-500">
              <p className="text-sm">Select a notification to view the full message, related item, and actions.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Notifications;
