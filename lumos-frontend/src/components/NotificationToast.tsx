'use client';

import { useEffect, useState } from 'react';
import { useTimebank } from '@/contexts/TimebankContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function NotificationToast() {
  const { notifications, markNotificationRead } = useTimebank();
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  // Show new notifications
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
      const latestNotification = unreadNotifications[0];
      if (!visibleNotifications.includes(latestNotification.id)) {
        setVisibleNotifications(prev => [latestNotification.id, ...prev.slice(0, 2)]);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setVisibleNotifications(prev => prev.filter(id => id !== latestNotification.id));
          markNotificationRead(latestNotification.id);
        }, 5000);
      }
    }
  }, [notifications, visibleNotifications, markNotificationRead]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleDismiss = (notificationId: string) => {
    setVisibleNotifications(prev => prev.filter(id => id !== notificationId));
    markNotificationRead(notificationId);
  };

  const visibleNotifs = notifications.filter(n => visibleNotifications.includes(n.id));

  if (visibleNotifs.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifs.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full border rounded-xl p-4 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out transform animate-slide-in ${getStyles(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
