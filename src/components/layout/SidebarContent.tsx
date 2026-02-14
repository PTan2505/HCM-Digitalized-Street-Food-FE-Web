import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import logoImage from '@assets/lowca-logo.png';
import unionLogo from '@assets/logos/Union.png';
import type { JSX } from 'react';
import { Avatar, Box, Tooltip, Typography } from '@mui/material';

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
    <Box className="bg-gradient-moderator flex flex-1 flex-col font-[var(--font-nunito)] shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
      <Box className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto pt-5 pb-4">
        {/* Logo/Brand */}
        <Box
          onClick={onLogoClick}
          className={`mb-8 flex flex-col items-center gap-1 px-4 transition-all duration-300 ease-in-out ${
            onLogoClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
          }`}
        >
          <Box className="flex h-8 items-center justify-center">
            <Box
              component="img"
              src={collapsed ? unionLogo : logoImage}
              alt="Logo"
              className={`object-contain transition-all duration-300 ease-in-out ${
                collapsed
                  ? 'h-[18px] w-[18px] max-w-[18px]'
                  : 'h-8 w-auto max-w-[100px]'
              }`}
            />
          </Box>
          <Box className="h-6 overflow-hidden">
            <Typography
              className={`text-moderator-text-primary block text-base leading-6 font-extrabold tracking-[0.02em] whitespace-nowrap transition-opacity duration-300 ease-in-out ${
                collapsed ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {userInfo.role}
            </Typography>
          </Box>
        </Box>

        {/* Navigation */}
        <Box component="nav" className="mt-4 flex-1 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Tooltip
                key={item.name}
                title={collapsed ? item.name : ''}
                placement="right"
                disableHoverListener={!collapsed}
              >
                <Link to={item.href} className="no-underline">
                  <Box
                    className={`mb-1 flex cursor-pointer items-center overflow-hidden rounded-lg px-3 py-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ease-in-out ${
                      isActive
                        ? 'bg-moderator-active-bg text-moderator-active-text hover:bg-moderator-active-bg hover:text-moderator-active-text shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                        : 'text-moderator-text-primary hover:bg-moderator-hover-bg hover:text-moderator-hover-text bg-transparent shadow-none'
                    }`}
                  >
                    <Box className="flex h-5 w-5 shrink-0 items-center justify-center">
                      <item.icon
                        className="h-5 w-5"
                        style={{ color: 'inherit' }}
                      />
                    </Box>
                    <Typography
                      className={`ml-3 overflow-hidden text-[0.9rem] font-medium whitespace-nowrap text-inherit transition-[opacity,width] duration-300 ease-in-out ${
                        collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                      }`}
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
        <Box className="mt-auto px-2">
          <Tooltip
            title={collapsed ? 'Đăng xuất' : ''}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <Box
              component="button"
              onClick={onLogout}
              className="text-moderator-logout hover:bg-moderator-logout-hover mb-2 flex w-full cursor-pointer items-center overflow-hidden rounded-lg border-none bg-transparent px-3 py-3 text-sm font-medium transition-[background-color,color] duration-200 ease-in-out hover:text-white"
            >
              <Box className="flex h-5 w-5 shrink-0 items-center justify-center">
                <ArrowRightOnRectangleIcon
                  className="h-5 w-5"
                  style={{ color: 'inherit' }}
                />
              </Box>
              <Typography
                className={`ml-3 overflow-hidden text-sm font-medium whitespace-nowrap text-inherit transition-[opacity,width] duration-300 ease-in-out ${
                  collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                }`}
              >
                Đăng xuất
              </Typography>
            </Box>
          </Tooltip>

          {/* User info */}
          <Box className="border-moderator-border border-t pt-4">
            <Tooltip
              title={collapsed ? `${userInfo.name}\n${userInfo.email}` : ''}
              placement="right"
              disableHoverListener={!collapsed}
            >
              <Box className="flex items-center overflow-hidden px-3 py-2">
                <Avatar
                  src={userInfo?.avatarUrl ?? undefined}
                  className="shrink-0 bg-[var(--color-moderator-active-bg)] text-[var(--color-moderator-active-text)] transition-[width,height] duration-300 ease-in-out"
                  style={{
                    width: collapsed ? 32 : 36,
                    height: collapsed ? 32 : 36,
                  }}
                >
                  {!userInfo?.avatarUrl && (
                    <UserCircleIcon className="h-5 w-5" />
                  )}
                </Avatar>
                <Box
                  className={`ml-3 overflow-hidden transition-[opacity,width] duration-300 ease-in-out ${
                    collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  }`}
                >
                  <Typography className="text-moderator-text-primary overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap">
                    {userInfo.name}
                  </Typography>
                  <Typography className="text-moderator-text-secondary overflow-hidden text-xs text-ellipsis whitespace-nowrap">
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
