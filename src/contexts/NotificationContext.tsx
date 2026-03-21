import { createContext, useContext, type ReactNode, type JSX } from 'react';
import { useNotifications, type NotificationDto } from '@hooks/useNotifications';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';
import { tokenManagement } from '@utils/tokenManagement';

interface NotificationContextType {
  isConnected: boolean;
  connectionError: string | null;
  notifications: NotificationDto[];
  clearNotifications: () => void;
  markAsRead: (id: number) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const user = useAppSelector(selectUser);
  const token = user ? tokenManagement.getAccessToken() : null;

  const { isConnected, connectionError, notifications, clearNotifications, markAsRead } =
    useNotifications(token);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        isConnected,
        connectionError,
        notifications,
        clearNotifications,
        markAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
