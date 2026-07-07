import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../constants';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated || !token) return;
    
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark specific notification as read
  const markAsRead = async (ids) => {
    if (!isAuthenticated || !token) return;
    
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => 
        ids.includes(n._id) ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - ids.length));
      
      await axios.put(`${API_URL}/notifications/read`, { ids }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      // Revert on error
      fetchNotifications();
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!isAuthenticated || !token || unreadCount === 0) return;
    
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      await axios.put(`${API_URL}/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      fetchNotifications();
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    if (!isAuthenticated || !token) return;
    
    try {
      const target = notifications.find(n => n._id === id);
      
      // Optimistic update
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (target && !target.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      fetchNotifications();
    }
  };

  // Poll for new notifications every 60 seconds if authenticated
  useEffect(() => {
    let intervalId;
    
    if (isAuthenticated) {
      fetchNotifications();
      intervalId = setInterval(fetchNotifications, 60000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
