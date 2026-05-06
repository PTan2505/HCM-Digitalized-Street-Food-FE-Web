import { useCallback, useEffect, useRef, useState } from 'react';
import { signalRService } from '@config/signalRService';
import { axiosApi } from '@lib/api/apiInstance';
import { toast } from 'react-toastify';
import CustomNotification from '@components/CustomNotification';
import type { NotificationDto } from '@custom-types/notification';
import { playNotificationSound } from '@utils/notificationSound';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { addNewOrder } from '@slices/order';
import {
  getMyVendor,
  updateBranchVerificationStatusRealtime,
} from '@slices/vendor';
import { updateBalance } from '@slices/payment';
import { loadUserFromStorage, selectUser } from '@slices/auth';
import { ROLES } from '@constants/role';
import { tokenManagement } from '@utils/tokenManagement';

export type { NotificationDto } from '@custom-types/notification';

const BRANCH_NAME_REGEX = /chi nhánh\s+'([^']+)'/i;
const REJECT_REASON_REGEX = /Lý do:\s*(.+)$/i;
const REFUND_AMOUNT_REGEX = /Số tiền ([\d,.]+)\s*VNĐ/i;

const parseBranchVerificationNotification = (
  message: string
): {
  branchName: string | null;
  status: 'Accept' | 'Reject' | null;
  rejectReason: string | null;
} => {
  const trimmedMessage = message.trim();
  const nameMatch = trimmedMessage.match(BRANCH_NAME_REGEX);
  const branchName = nameMatch?.[1]?.trim() ?? null;

  if (trimmedMessage.includes('đã được xác minh thành công')) {
    return {
      branchName,
      status: 'Accept',
      rejectReason: null,
    };
  }

  if (trimmedMessage.includes('đã bị từ chối')) {
    const reasonMatch = trimmedMessage.match(REJECT_REASON_REGEX);
    return {
      branchName,
      status: 'Reject',
      rejectReason: reasonMatch?.[1]?.trim() ?? null,
    };
  }

  return {
    branchName,
    status: null,
    rejectReason: null,
  };
};

interface UseNotificationsReturn {
  isConnected: boolean;
  connectionError: string | null;
  notifications: NotificationDto[];
  unreadCount: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotifications = (
  token: string | null
): UseNotificationsReturn => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isMountedRef = useRef(true);

  // Fetch initial notifications + unread count
  const fetchInitialData = useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        axiosApi.notificationApi.getNotifications(1, 20),
        axiosApi.notificationApi.getUnreadCount(),
      ]);
      if (!isMountedRef.current) return;
      setNotifications(notifRes.items);
      setUnreadCount(countRes.unreadCount);
      setPage(1);
      setHasMore(notifRes.hasNext);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Load more notifications (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    try {
      const nextPage = page + 1;
      const res = await axiosApi.notificationApi.getNotifications(nextPage, 20);
      if (!isMountedRef.current) return;
      setNotifications((prev) => [...prev, ...res.items]);
      setPage(nextPage);
      setHasMore(res.hasNext);
    } catch (error) {
      console.error('Failed to load more notifications:', error);
    }
  }, [hasMore, page]);

  // Mark single notification as read (API + local state)
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await axiosApi.notificationApi.markAsRead(notificationId);
      if (!isMountedRef.current) return;
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all as read (API + local state)
  const markAllAsRead = useCallback(async () => {
    try {
      await axiosApi.notificationApi.markAllAsRead();
      if (!isMountedRef.current) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  const refreshAccessTokenOnVerifiedBranch = useCallback(async () => {
    if (user?.role !== ROLES.USER) return;

    const currentRefreshToken = tokenManagement.getRefreshToken();
    if (!currentRefreshToken) return;

    try {
      const refreshResult = await axiosApi.loginApi.refreshToken({
        refreshToken: currentRefreshToken,
      });

      tokenManagement.setTokens({
        newAccessToken: refreshResult.token,
      });

      await dispatch(loadUserFromStorage());
    } catch (error) {
      console.error(
        'Failed to refresh token after branch verification:',
        error
      );
    }
  }, [dispatch, user?.role]);

  // SignalR connection + event listener
  useEffect(() => {
    if (!token) return;

    isMountedRef.current = true;

    const init = async (): Promise<(() => void) | void> => {
      // Fetch initial data from REST API
      await fetchInitialData();

      // Connect SignalR
      const conn = await signalRService.connect();

      if (!conn || !isMountedRef.current) {
        setConnectionError('Connection failed');
        setIsConnected(false);
        return;
      }

      setIsConnected(true);
      setConnectionError(null);

      // Handle incoming real-time notifications (NewFeedback, NewOrder, BranchVerificationStatus, SystemCampaignCreated, CampaignCancelledRefund)
      const handler = (data: NotificationDto): void => {
        if (
          data.type !== 'NewFeedback' &&
          data.type !== 'NewOrder' &&
          data.type !== 'BranchVerificationStatus' &&
          data.type !== 'SystemCampaignCreated' &&
          data.type !== 'CampaignCancelledRefund'
        )
          return;

        void (async (): Promise<void> => {
          console.log('📬 New notification:', data);
          // await Promise.resolve(playNotificationSound(data.type, data.message));
          playNotificationSound(data.type, data.message).catch(console.error);
          toast.info(CustomNotification, {
            data: {
              title: data.title,
              content: data.message,
            },
          });
          setNotifications((prev) => [data, ...prev]);
          setUnreadCount((prev) => prev + 1);

          if (data.type === 'CampaignCancelledRefund') {
            const amountStr = data.message
              .match(REFUND_AMOUNT_REGEX)?.[1]
              ?.replace(/[,.]/g, '');
            if (amountStr) {
              const amount = parseInt(amountStr, 10);
              if (!isNaN(amount)) {
                dispatch(updateBalance(amount));
              }
            }
          }

          if (data.type === 'NewOrder' && data.referenceId) {
            axiosApi.orderApi
              .getOrderDetails(data.referenceId)
              .then((order) => {
                dispatch(addNewOrder(order));
              })
              .catch((err) => {
                console.error('Failed to fetch new order detail:', err);
              });
          }

          if (data.type === 'BranchVerificationStatus') {
            const parsed = parseBranchVerificationNotification(data.message);
            if (!parsed.status) return;

            dispatch(
              updateBranchVerificationStatusRealtime({
                branchId: data.referenceId,
                branchName: parsed.branchName,
                status: parsed.status,
                rejectReason: parsed.rejectReason,
              })
            );

            // Fetch the updated vendor details to get properties like tierName
            void dispatch(getMyVendor());

            if (parsed.status === 'Accept') {
              await refreshAccessTokenOnVerifiedBranch();
            }
          }
        })();
      };

      signalRService.on<NotificationDto>('ReceiveNotification', handler);

      conn.onreconnecting(() => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
      });

      conn.onreconnected(() => {
        if (!isMountedRef.current) return;
        setIsConnected(true);
        setConnectionError(null);
      });

      conn.onclose((err) => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
        if (err) setConnectionError(err.message);
      });

      return () => {
        signalRService.off<NotificationDto>('ReceiveNotification', handler);
      };
    };

    const cleanupPromise = init();

    return (): void => {
      isMountedRef.current = false;
      cleanupPromise?.then((cleanup: (() => void) | void): void => {
        if (typeof cleanup === 'function') cleanup();
      });
      signalRService.disconnect();
    };
  }, [token, fetchInitialData, dispatch, refreshAccessTokenOnVerifiedBranch]);

  return {
    isConnected,
    connectionError,
    notifications,
    unreadCount,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
  };
};
