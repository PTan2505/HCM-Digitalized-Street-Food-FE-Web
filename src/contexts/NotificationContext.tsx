import { createContext, useContext, type ReactNode, type JSX } from 'react';
import {
  useNotifications,
  type NotificationDto,
} from '@hooks/useNotifications';
import { useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';
import { tokenManagement } from '@utils/tokenManagement';

interface NotificationContextType {
  isConnected: boolean;
  connectionError: string | null;
  notifications: NotificationDto[];
  unreadCount: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const defaultNotificationContext: NotificationContextType = {
  isConnected: false,
  connectionError: null,
  notifications: [],
  unreadCount: 0,
  hasMore: false,
  loadMore: async (): Promise<void> => {},
  markAsRead: async (): Promise<void> => {},
  markAllAsRead: async (): Promise<void> => {},
};

const NotificationContext = createContext<NotificationContextType>(
  defaultNotificationContext
);

export const NotificationProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const user = useAppSelector(selectUser);
  const token = user ? tokenManagement.getAccessToken() : null;

  const {
    isConnected,
    connectionError,
    notifications,
    unreadCount,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications(token);

  return (
    <NotificationContext.Provider
      value={{
        isConnected,
        connectionError,
        notifications,
        unreadCount,
        hasMore,
        loadMore,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);

  if (context === defaultNotificationContext) {
    console.warn(
      'useNotificationContext fallback is being used because NotificationProvider is missing or not ready yet.'
    );
  }

  return context;
};
