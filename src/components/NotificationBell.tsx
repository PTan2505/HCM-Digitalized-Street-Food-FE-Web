import { useState, type MouseEvent, type JSX } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import FeedbackIcon from '@mui/icons-material/Feedback';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { useNotificationContext } from '@contexts/NotificationContext';

interface NotificationBellProps {
  onFeedbackNotificationClick?: (feedbackId: number) => void;
  onOrderNotificationClick?: (orderId: number) => void;
}

export default function NotificationBell({
  onFeedbackNotificationClick,
  onOrderNotificationClick,
}: NotificationBellProps): JSX.Element {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    hasMore,
    loadMore,
    isConnected,
  } = useNotificationContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: {
    notificationId: number;
    type: string;
    isRead: boolean;
    referenceId: number | null;
  }): void => {
    handleClose();

    if (!notification.isRead) {
      void markAsRead(notification.notificationId);
    }

    if (
      notification.type === 'NewFeedback' &&
      notification.referenceId !== null
    ) {
      onFeedbackNotificationClick?.(notification.referenceId);
    } else if (
      notification.type === 'NewOrder' &&
      notification.referenceId !== null
    ) {
      onOrderNotificationClick?.(notification.referenceId);
    }
  };

  const handleMarkAllAsRead = async (): Promise<void> => {
    await markAllAsRead();
  };

  const handleLoadMore = async (): Promise<void> => {
    await loadMore();
  };

  const formatTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHour = Math.floor(diffMs / 3600000);
      const diffDay = Math.floor(diffMs / 86400000);

      if (diffMin < 1) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      if (diffHour < 24) return `${diffHour} giờ trước`;
      if (diffDay < 7) return `${diffDay} ngày trước`;
      return date.toLocaleString('vi-VN');
    } catch {
      return isoString;
    }
  };

  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={handleClick}
        className="relative"
        title={isConnected ? 'Đã kết nối' : 'Đã ngắt kết nối'}
      >
        <Badge badgeContent={unreadCount} color="warning" max={99}>
          <NotificationsIcon
            sx={{
              ...(isConnected
                ? {
                    color: 'primary.main',
                  }
                : {
                    color: 'error.main',
                  }),
            }}
          />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 460,
              width: 370,
              borderRadius: '14px',
              boxShadow:
                '0 8px 32px color-mix(in srgb, var(--color-primary-500) 15%, transparent), 0 2px 8px rgba(0,0,0,0.10)',
              border:
                '1px solid color-mix(in srgb, var(--color-primary-400) 30%, transparent)',
              overflow: 'hidden',
              // Xóa padding mặc định của Paper/List bên trong Menu
              '& .MuiList-root': {
                paddingTop: 0,
                paddingBottom: 0,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 460,
              },
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            px: 2,
            py: 1.5,
            background:
              'linear-gradient(90deg, color-mix(in srgb, var(--color-primary-500) 12%, transparent) 0%, color-mix(in srgb, var(--color-primary-500) 5%, transparent) 100%)',
            borderBottom:
              '1.5px solid color-mix(in srgb, var(--color-primary-400) 30%, transparent)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--color-primary-700)',
              letterSpacing: 0.2,
            }}
          >
            Thông báo
          </Typography>

          {unreadCount > 0 && (
            <Box sx={{ position: 'absolute', right: 12 }}>
              <Button
                size="small"
                startIcon={<DoneAllIcon sx={{ fontSize: 15 }} />}
                onClick={() => void handleMarkAllAsRead()}
                sx={{
                  color: 'var(--color-primary-700)',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  textTransform: 'none',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: '8px',
                  '&:hover': {
                    background:
                      'color-mix(in srgb, var(--color-primary-500) 15%, transparent)',
                  },
                }}
              >
                Đọc tất cả
              </Button>
            </Box>
          )}
        </Box>

        {/* Items */}
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {notifications.length === 0 ? (
            <MenuItem
              disabled
              sx={{
                py: 4,
                justifyContent: 'center',
                '&.Mui-disabled': { opacity: 1 },
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: '#aaa', fontSize: '0.85rem' }}
              >
                Không có thông báo
              </Typography>
            </MenuItem>
          ) : (
            [
              ...notifications.map((notification) => (
                <MenuItem
                  key={notification.notificationId}
                  onClick={() => handleNotificationClick(notification)}
                  sx={(theme) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    px: 2,
                    py: 1.4,
                    background: notification.isRead
                      ? '#fff'
                      : notification.type === 'NewFeedback'
                        ? `color-mix(in srgb, ${theme.palette.warning.main} 8%, transparent)`
                        : notification.type === 'BranchVerificationStatus'
                          ? `color-mix(in srgb, ${theme.palette.info.main} 8%, transparent)`
                          : 'color-mix(in srgb, var(--color-primary-500) 8%, transparent)',
                    borderLeft: notification.isRead
                      ? '3px solid transparent'
                      : notification.type === 'NewFeedback'
                        ? `3px solid ${theme.palette.warning.main}`
                        : notification.type === 'BranchVerificationStatus'
                          ? `3px solid ${theme.palette.info.main}`
                          : '3px solid var(--color-primary-500)',
                    transition: 'background 0.18s ease',
                    '&:hover': {
                      background: notification.isRead
                        ? notification.type === 'NewFeedback'
                          ? `color-mix(in srgb, ${theme.palette.warning.main} 6%, transparent)`
                          : notification.type === 'BranchVerificationStatus'
                            ? `color-mix(in srgb, ${theme.palette.info.main} 6%, transparent)`
                            : 'var(--color-primary-50)'
                        : notification.type === 'NewFeedback'
                          ? `color-mix(in srgb, ${theme.palette.warning.main} 15%, transparent)`
                          : notification.type === 'BranchVerificationStatus'
                            ? `color-mix(in srgb, ${theme.palette.info.main} 15%, transparent)`
                            : 'color-mix(in srgb, var(--color-primary-500) 15%, transparent)',
                    },
                  })}
                >
                  {/* Title row */}
                  <Box
                    sx={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: notification.isRead
                            ? '#374151'
                            : 'var(--color-primary-700)',
                          lineHeight: 1.4,
                        }}
                      >
                        {notification.title}
                      </Typography> */}
                      {notification.type === 'NewOrder' && (
                        <Chip
                          icon={<DeliveryDiningIcon />}
                          label="Đơn hàng mới"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                      {notification.type === 'NewFeedback' && (
                        <Chip
                          icon={<FeedbackIcon />}
                          label="Đánh giá mới"
                          variant="outlined"
                          color="warning"
                        />
                      )}
                      {notification.type === 'BranchVerificationStatus' && (
                        <Chip
                          icon={<FactCheckIcon />}
                          label="Trạng thái xác minh chi nhánh"
                          variant="outlined"
                          color="info"
                        />
                      )}
                    </Box>
                    {!notification.isRead && (
                      <Box
                        sx={(theme) => ({
                          flexShrink: 0,
                          mt: 0.5,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background:
                            notification.type === 'NewFeedback'
                              ? theme.palette.warning.main
                              : notification.type === 'BranchVerificationStatus'
                                ? theme.palette.info.main
                                : 'var(--color-primary-500)',
                          boxShadow:
                            notification.type === 'NewFeedback'
                              ? `0 0 0 2px color-mix(in srgb, ${theme.palette.warning.main} 35%, transparent)`
                              : notification.type === 'BranchVerificationStatus'
                                ? `0 0 0 2px color-mix(in srgb, ${theme.palette.info.main} 35%, transparent)`
                                : '0 0 0 2px color-mix(in srgb, var(--color-primary-500) 35%, transparent)',
                        })}
                      />
                    )}
                  </Box>

                  {/* Message */}
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.4,
                      width: '100%',
                      fontSize: '0.78rem',
                      color: '#6b7280',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      whiteSpace: 'normal',
                      lineHeight: 1.5,
                    }}
                  >
                    {notification.message}
                  </Typography>

                  {/* Footer row */}
                  <Box
                    sx={{
                      mt: 0.8,
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.7rem', color: '#9ca3af' }}
                    >
                      {formatTime(notification.createdAt)}
                    </Typography>

                    {(notification.type === 'NewFeedback' ||
                      notification.type === 'NewOrder') &&
                      notification.referenceId !== null && (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color:
                              notification.type === 'NewFeedback'
                                ? 'warning.main'
                                : 'var(--color-primary-600)',
                          }}
                        >
                          Xem chi tiết →
                        </Typography>
                      )}
                  </Box>
                </MenuItem>
              )),

              hasMore
                ? [
                    <Divider key="hasMore-divider" sx={{ my: 0 }} />,
                    <MenuItem
                      key="hasMore-button"
                      onClick={() => {
                        void handleLoadMore();
                      }}
                      sx={{
                        justifyContent: 'center',
                        py: 1.2,
                        transition: 'background 0.18s ease',
                        '&:hover': { background: 'var(--color-primary-50)' },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: 'var(--color-primary-600)',
                        }}
                      >
                        Xem thêm
                      </Typography>
                    </MenuItem>,
                  ]
                : null,
            ]
          )}
        </Box>
      </Menu>
    </Box>
  );
}
