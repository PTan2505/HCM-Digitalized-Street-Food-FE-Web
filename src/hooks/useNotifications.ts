import { useEffect, useState } from 'react';
import { HubConnection } from '@microsoft/signalr';
import { signalRService } from '@config/signalIRService';
import { toast } from 'react-toastify';
import CustomNotification from '@components/CustomNotification';

export interface NotificationDto {
  notificationId: number;
  type: string;
  title: string;
  message: string;
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}

interface UseNotificationsReturn {
  connection: HubConnection | null;
  isConnected: boolean;
  connectionError: string | null;
  notifications: NotificationDto[];
  clearNotifications: () => void;
  markAsRead: (notificationId: number) => void;
}

export const useNotifications = (
  token: string | null
): UseNotificationsReturn => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const init = async (): Promise<void | (() => void)> => {
      const conn = await signalRService.connect();

      if (!conn || !isMounted) {
        setConnectionError('Connection failed');
        setIsConnected(false);
        return;
      }

      setConnection(conn);
      setIsConnected(true);

      // 🔥 handler
      const handler = (data: NotificationDto): void => {
        console.log('📬 New notification:', data);
        toast.info(CustomNotification, {
          data: {
            title: data.title,
            content: data.message,
          },
        });
        setNotifications((prev: NotificationDto[]) => [data, ...prev]);
      };

      signalRService.on<NotificationDto>('ReceiveNotification', handler);

      // 🔄 lifecycle
      conn.onreconnecting(() => {
        if (!isMounted) return;
        console.log('🔄 Reconnecting...');
        setIsConnected(false);
      });

      conn.onreconnected(() => {
        if (!isMounted) return;
        console.log('✅ Reconnected');
        setIsConnected(true);
        setConnectionError(null);
      });

      conn.onclose((err) => {
        if (!isMounted) return;
        console.log('❌ Connection closed');
        setIsConnected(false);
        if (err) setConnectionError(err.message);
      });

      // cleanup
      return () => {
        signalRService.off<NotificationDto>('ReceiveNotification', handler);
      };
    };

    const cleanupPromise = init();

    return () => {
      isMounted = false;

      cleanupPromise?.then((cleanup: void | (() => void)): void => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      });

      signalRService.disconnect();
    };
  }, [token]);

  const clearNotifications = (): void => {
    setNotifications([]);
  };

  const markAsRead = (id: number): void => {
    setNotifications((prev: NotificationDto[]) =>
      prev.map((n: NotificationDto) =>
        n.notificationId === id ? { ...n, isRead: true } : n
      )
    );
  };

  return {
    connection,
    isConnected,
    connectionError,
    notifications,
    clearNotifications,
    markAsRead,
  };
};
