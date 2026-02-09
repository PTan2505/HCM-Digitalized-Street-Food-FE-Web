import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import logoImage from '@assets/lowca-logo.png';
import type { JSX } from 'react';
import { Box, Typography, Avatar, Tooltip } from '@mui/material';
import type { ColorConfig } from '@constants/moderatorTheme';
import { MODERATOR_THEME } from '@constants/moderatorTheme';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}

interface SidebarContentProps {
  collapsed?: boolean;
  navigation?: NavigationItem[];
  gradientColors?: { from: string; to: string };
  textColors?: ColorConfig;
  userInfo?: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
  settingsPath?: string;
  onLogout?: () => void;
}

const SidebarContent = ({
  collapsed = false,
  navigation = [],
  gradientColors = MODERATOR_THEME.gradientColors,
  textColors = MODERATOR_THEME.textColors,
  userInfo = { name: 'User', email: 'user@example.com', role: 'Panel' },
  onLogout = (): void => {},
}: SidebarContentProps): JSX.Element => {
  const location = useLocation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: `linear-gradient(to bottom, ${gradientColors.from}, ${gradientColors.to})`,
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflowY: 'auto',
          pt: 2.5,
          pb: 2,
        }}
      >
        {/* Logo/Brand */}
        <Box
          sx={{
            mb: 4,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {collapsed ? (
            <Tooltip title={userInfo.role} placement="right">
              <Box
                component="img"
                src={logoImage}
                alt="Lowca Logo"
                sx={{
                  height: 32,
                  width: 32,
                  objectFit: 'contain',
                }}
              />
            </Tooltip>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                width: '100%',
              }}
            >
              <Box
                component="img"
                src={logoImage}
                alt="Lowca Logo"
                sx={{
                  height: 32,
                  objectFit: 'contain',
                  maxWidth: '100px',
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: textColors.primary,
                  fontWeight: 800,
                  fontSize: '1rem',
                  letterSpacing: '0.02em',
                }}
              >
                {userInfo.role}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Navigation */}
        <Box component="nav" sx={{ mt: 2, flex: 1, px: 1 }}>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Tooltip
                key={item.name}
                title={collapsed ? item.name : ''}
                placement="right"
                disableHoverListener={!collapsed}
              >
                <Link to={item.href} style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      px: 1.5,
                      py: 1.5,
                      mb: 0.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      backgroundColor: isActive
                        ? textColors.active
                        : 'transparent',
                      color: isActive
                        ? textColors.activeText
                        : textColors.primary,
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      boxShadow: isActive
                        ? '0 2px 8px rgba(0,0,0,0.1)'
                        : 'none',
                      '&:hover': {
                        backgroundColor: isActive
                          ? textColors.active
                          : textColors.hover,
                        color: isActive
                          ? textColors.activeText
                          : textColors.hoverText,
                      },
                    }}
                  >
                    <item.icon
                      className="h-5 w-5"
                      style={{
                        color: 'inherit',
                        flexShrink: 0,
                      }}
                    />
                    {!collapsed && (
                      <Typography
                        sx={{
                          ml: 1.5,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: 'inherit',
                        }}
                      >
                        {item.name}
                      </Typography>
                    )}
                  </Box>
                </Link>
              </Tooltip>
            );
          })}
        </Box>

        {/* Bottom actions */}
        <Box sx={{ mt: 'auto', px: 1 }}>
          <Tooltip
            title={collapsed ? 'Đăng xuất' : ''}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <Box
              component="button"
              onClick={onLogout}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                width: '100%',
                px: 1.5,
                py: 1.5,
                mb: 1,
                borderRadius: 2,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                backgroundColor: 'transparent',
                color: textColors.logout,
                fontWeight: 500,
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: textColors.logout,
                  color: '#ffffff',
                },
              }}
            >
              <ArrowRightOnRectangleIcon
                className="h-5 w-5"
                style={{ color: 'inherit', flexShrink: 0 }}
              />
              {!collapsed && (
                <Typography
                  sx={{
                    ml: 1.5,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'inherit',
                  }}
                >
                  Đăng xuất
                </Typography>
              )}
            </Box>
          </Tooltip>

          {/* User info in collapsed mode */}
          {collapsed && (
            <Box
              sx={{
                pt: 2,
                borderTop: `1px solid ${textColors.border}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Tooltip
                  title={`${userInfo.name}\n${userInfo.email}`}
                  placement="right"
                >
                  <Avatar
                    src={userInfo?.avatarUrl ?? undefined}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: textColors.active,
                      color: textColors.activeText,
                    }}
                  >
                    {!userInfo?.avatarUrl && (
                      <UserCircleIcon className="h-5 w-5" />
                    )}
                  </Avatar>
                </Tooltip>
              </Box>
            </Box>
          )}

          {/* User info in expanded mode */}
          {!collapsed && (
            <Box
              sx={{
                pt: 2,
                borderTop: `1px solid ${textColors.border}`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 1,
                }}
              >
                <Avatar
                  src={userInfo?.avatarUrl ?? undefined}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: textColors.active,
                    color: textColors.activeText,
                  }}
                >
                  {!userInfo?.avatarUrl && (
                    <UserCircleIcon className="h-5 w-5" />
                  )}
                </Avatar>
                <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: textColors.primary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {userInfo.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: textColors.secondary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {userInfo.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarContent;
