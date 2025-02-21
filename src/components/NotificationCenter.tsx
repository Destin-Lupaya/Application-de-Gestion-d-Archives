import React from 'react';
import { Bell, X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotifications, NotificationType } from '../context/NotificationContext';

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-400" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-400" />;
  }
};

const getBackgroundColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50';
    case 'error':
      return 'bg-red-50';
    case 'warning':
      return 'bg-amber-50';
    case 'info':
      return 'bg-blue-50';
  }
};

const getBorderColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'border-green-400';
    case 'error':
      return 'border-red-400';
    case 'warning':
      return 'border-amber-400';
    case 'info':
      return 'border-blue-400';
  }
};

const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-4 max-w-sm w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getBackgroundColor(notification.type)} border-l-4 ${getBorderColor(
            notification.type
          )} p-4 shadow-lg rounded-lg`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">{getIcon(notification.type)}</div>
            <div className="ml-3 w-0 flex-1">
              {notification.title && (
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => removeNotification(notification.id)}
              >
                <span className="sr-only">Fermer</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;