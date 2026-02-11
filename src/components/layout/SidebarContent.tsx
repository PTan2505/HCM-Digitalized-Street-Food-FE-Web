import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import logoImage from '@assets/lowca-logo.png';
import type { JSX } from 'react';
import { Box, Typography, Avatar, Tooltip } from '@mui/material';

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
  userInfo?: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
  settingsPath?: string;
  onLogout?: () => void;
  onLogoClick?: () => void;
}

const SidebarContent = ({
  collapsed = false,
  navigation = [],
  userInfo = { name: 'User', email: 'user@example.com', role: 'Panel' },
  onLogout = (): void => {},
  onLogoClick,
}: SidebarContentProps): JSX.Element => {
  const location = useLocation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: 'var(--gradient-moderator)',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
        fontFamily: 'var(--font-nunito)',
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
                onClick={onLogoClick}
                sx={{
                  height: 32,
                  width: 32,
                  objectFit: 'contain',
                  cursor: onLogoClick ? 'pointer' : 'default',
                  '&:hover': onLogoClick ? { opacity: 0.8 } : {},
                }}
              />
            </Tooltip>
          ) : (
            <Box
              onClick={onLogoClick}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                width: '100%',
                cursor: onLogoClick ? 'pointer' : 'default',
                '&:hover': onLogoClick ? { opacity: 0.8 } : {},
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
                  color: 'var(--color-moderator-text-primary)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  letterSpacing: '0.02em',
                  fontFamily: 'var(--font-nunito)',
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
                        ? 'var(--color-moderator-active-bg)'
                        : 'transparent',
                      color: isActive
                        ? 'var(--color-moderator-active-text)'
                        : 'var(--color-moderator-text-primary)',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-nunito)',
                      boxShadow: isActive
                        ? '0 2px 8px rgba(0,0,0,0.1)'
                        : 'none',
                      '&:hover': {
                        backgroundColor: isActive
                          ? 'var(--color-moderator-active-bg)'
                          : 'var(--color-moderator-hover-bg)',
                        color: isActive
                          ? 'var(--color-moderator-active-text)'
                          : 'var(--color-moderator-hover-text)',
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
                          fontFamily: 'var(--font-nunito)',
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
                color: 'var(--color-moderator-logout)',
                fontWeight: 500,
                fontSize: '0.875rem',
                fontFamily: 'var(--font-nunito)',
                '&:hover': {
                  backgroundColor: 'var(--color-moderator-logout-hover)',
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
                    fontFamily: 'var(--font-nunito)',
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
                borderTop: '1px solid var(--color-moderator-border)',
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
                      bgcolor: 'var(--color-moderator-active-bg)',
                      color: 'var(--color-moderator-active-text)',
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
                borderTop: '1px solid var(--color-moderator-border)',
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
                    bgcolor: 'var(--color-moderator-active-bg)',
                    color: 'var(--color-moderator-active-text)',
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
                      color: 'var(--color-moderator-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontFamily: 'var(--font-nunito)',
                    }}
                  >
                    {userInfo.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: 'var(--color-moderator-text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontFamily: 'var(--font-nunito)',
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
