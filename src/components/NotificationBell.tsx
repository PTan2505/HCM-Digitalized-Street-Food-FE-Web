import { useState, type MouseEvent, type JSX } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotificationContext } from '@contexts/NotificationContext';

export default function NotificationBell(): JSX.Element {
  const { notifications, unreadCount, markAsRead, isConnected } =
    useNotificationContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (id: number): void => {
    markAsRead(id);
    // Add navigation if tracking `referenceId`
  };

  const formatTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('vi-VN');
    } catch {
      return isoString;
    }
  };

  return (
    <Box>
      <IconButton color="inherit" onClick={handleClick} className="relative">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
          {/* Status Indicator */}
          <span
            className={`absolute top-1 right-1 h-3 w-3 rounded-full border-2 border-white ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 320,
          },
        }}
      >
        <Box className="px-4 py-2">
          <Typography variant="h6" className="font-semibold text-gray-800">
            Thông báo
          </Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled className="py-4 text-center">
            <Typography variant="body2" className="w-full text-gray-500">
              Không có thông báo mới
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.notificationId}
              onClick={() =>
                handleNotificationClick(notification.notificationId)
              }
              className={`flex flex-col items-start px-4 py-3 ${
                notification.isRead ? 'bg-white' : 'bg-blue-50'
              }`}
            >
              <Box className="flex w-full items-start justify-between">
                <Typography
                  variant="subtitle2"
                  className={`font-semibold ${
                    notification.isRead ? 'text-gray-700' : 'text-blue-800'
                  }`}
                >
                  {notification.title}
                </Typography>
                {!notification.isRead && (
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                )}
              </Box>
              <Typography
                variant="body2"
                className="mt-1 line-clamp-2 w-full text-sm whitespace-normal text-gray-600"
              >
                {notification.message}
              </Typography>
              <Typography
                variant="caption"
                className="mt-2 text-xs text-gray-400"
              >
                {formatTime(notification.createdAt)}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
}
