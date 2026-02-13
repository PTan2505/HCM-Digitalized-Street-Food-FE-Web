import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import logoImage from '@assets/lowca-logo.png';
import unionLogo from '@assets/logos/Union.png';
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
          overflowX: 'hidden',
          pt: 2.5,
          pb: 2,
        }}
      >
        {/* Logo/Brand */}
        <Box
          onClick={onLogoClick}
          sx={{
            mb: 4,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            cursor: onLogoClick ? 'pointer' : 'default',
            '&:hover': onLogoClick ? { opacity: 0.8 } : {},
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <Box
            sx={{
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={collapsed ? unionLogo : logoImage}
              alt="Logo"
              sx={{
                height: collapsed ? 18 : 32,
                width: collapsed ? 18 : 'auto',
                objectFit: 'contain',
                maxWidth: collapsed ? 18 : '100px',
                transition: 'all 0.3s ease-in-out',
              }}
            />
          </Box>
          <Box
            sx={{
              height: '24px',
              overflow: 'hidden',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-moderator-text-primary)',
                fontWeight: 800,
                fontSize: '1rem',
                letterSpacing: '0.02em',
                fontFamily: 'var(--font-nunito)',
                opacity: collapsed ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out',
                whiteSpace: 'nowrap',
                lineHeight: '24px',
              }}
            >
              {userInfo.role}
            </Typography>
          </Box>
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
                      px: 1.5,
                      py: 1.5,
                      mb: 0.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition:
                        'background-color 0.2s ease-in-out, color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
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
                      overflow: 'hidden',
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
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 20,
                        height: 20,
                        flexShrink: 0,
                      }}
                    >
                      <item.icon
                        className="h-5 w-5"
                        style={{
                          color: 'inherit',
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        ml: 1.5,
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: 'inherit',
                        fontFamily: 'var(--font-nunito)',
                        opacity: collapsed ? 0 : 1,
                        width: collapsed ? 0 : 'auto',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        transition:
                          'opacity 0.3s ease-in-out, width 0.3s ease-in-out',
                      }}
                    >
                      {item.name}
                    </Typography>
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
                width: '100%',
                px: 1.5,
                py: 1.5,
                mb: 1,
                borderRadius: 2,
                border: 'none',
                cursor: 'pointer',
                transition:
                  'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
                backgroundColor: 'transparent',
                color: 'var(--color-moderator-logout)',
                fontWeight: 500,
                fontSize: '0.875rem',
                fontFamily: 'var(--font-nunito)',
                overflow: 'hidden',
                '&:hover': {
                  backgroundColor: 'var(--color-moderator-logout-hover)',
                  color: '#ffffff',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                }}
              >
                <ArrowRightOnRectangleIcon
                  className="h-5 w-5"
                  style={{ color: 'inherit' }}
                />
              </Box>
              <Typography
                sx={{
                  ml: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'inherit',
                  fontFamily: 'var(--font-nunito)',
                  opacity: collapsed ? 0 : 1,
                  width: collapsed ? 0 : 'auto',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  transition:
                    'opacity 0.3s ease-in-out, width 0.3s ease-in-out',
                }}
              >
                Đăng xuất
              </Typography>
            </Box>
          </Tooltip>

          {/* User info */}
          <Box
            sx={{
              pt: 2,
              borderTop: '1px solid var(--color-moderator-border)',
            }}
          >
            <Tooltip
              title={collapsed ? `${userInfo.name}\n${userInfo.email}` : ''}
              placement="right"
              disableHoverListener={!collapsed}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 1,
                  overflow: 'hidden',
                }}
              >
                <Avatar
                  src={userInfo?.avatarUrl ?? undefined}
                  sx={{
                    width: collapsed ? 32 : 36,
                    height: collapsed ? 32 : 36,
                    bgcolor: 'var(--color-moderator-active-bg)',
                    color: 'var(--color-moderator-active-text)',
                    flexShrink: 0,
                    transition:
                      'width 0.3s ease-in-out, height 0.3s ease-in-out',
                  }}
                >
                  {!userInfo?.avatarUrl && (
                    <UserCircleIcon className="h-5 w-5" />
                  )}
                </Avatar>
                <Box
                  sx={{
                    ml: 1.5,
                    overflow: 'hidden',
                    opacity: collapsed ? 0 : 1,
                    width: collapsed ? 0 : 'auto',
                    transition:
                      'opacity 0.3s ease-in-out, width 0.3s ease-in-out',
                  }}
                >
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
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarContent;
