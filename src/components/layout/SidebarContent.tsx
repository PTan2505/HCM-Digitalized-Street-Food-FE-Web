import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import logoImage from '@assets/lowca-logo.png';
import unionLogo from '@assets/logos/Union.png';
import type { JSX } from 'react';
import { useState } from 'react';
import { Avatar, Box, Tooltip, Typography } from '@mui/material';

export interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  children?: NavigationItem[];
  badgeText?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
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
  onNavigateItemClick?: () => void;
  onUserInfoClick?: () => void;
}

const SidebarContent = ({
  collapsed = false,
  navigation = [],
  userInfo = { name: 'User', email: 'user@example.com', role: 'Panel' },
  onLogout = (): void => {},
  onLogoClick,
  onNavigateItemClick,
  onUserInfoClick,
}: SidebarContentProps): JSX.Element => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  const isPathActive = (href?: string): boolean =>
    Boolean(href && location.pathname === href);

  const hasActiveChild = (item: NavigationItem): boolean =>
    Boolean(item.children?.some((child) => isPathActive(child.href)));

  const isGroupExpanded = (item: NavigationItem): boolean =>
    expandedGroups[item.name] ?? hasActiveChild(item);

  const toggleGroup = (groupName: string): void => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <Box className="bg-gradient-moderator flex min-h-0 flex-1 flex-col font-[var(--font-nunito)] shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
      <Box
        className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto pt-5 pb-4"
        sx={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
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
            const isActive = isPathActive(item.href);
            const isDropdown = Boolean(
              item.children && item.children.length > 0
            );
            const isChildActive = hasActiveChild(item);
            const isExpanded = isGroupExpanded(item);

            if (isDropdown) {
              return (
                <Box key={item.name} className="mb-1">
                  <Tooltip
                    title={collapsed ? item.name : ''}
                    placement="right"
                    disableHoverListener={!collapsed}
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() => toggleGroup(item.name)}
                      className={`flex w-full cursor-pointer items-center overflow-hidden rounded-lg border-none px-3 py-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ease-in-out ${
                        isChildActive
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
                      {!collapsed && (
                        <Box className="ml-auto flex h-4 w-4 items-center justify-center">
                          {isExpanded ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4" />
                          )}
                        </Box>
                      )}
                    </Box>
                  </Tooltip>

                  {!collapsed && isExpanded && (
                    <Box className="mt-1 ml-8 space-y-1">
                      {item.children?.map((child) => {
                        const isChildItemActive = isPathActive(child.href);

                        return (
                          <Link
                            key={child.name}
                            to={child.href ?? '#'}
                            onClick={() => onNavigateItemClick?.()}
                            className="block no-underline"
                          >
                            <Box
                              className={`flex cursor-pointer items-center overflow-hidden rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ease-in-out ${
                                isChildItemActive
                                  ? 'bg-moderator-active-bg text-moderator-active-text shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                                  : 'text-moderator-text-primary hover:bg-moderator-hover-bg hover:text-moderator-hover-text bg-transparent shadow-none'
                              }`}
                            >
                              <Box className="flex h-4 w-4 shrink-0 items-center justify-center">
                                <child.icon
                                  className="h-4 w-4"
                                  style={{ color: 'inherit' }}
                                />
                              </Box>
                              <Typography className="ml-2 overflow-hidden text-[0.85rem] font-medium whitespace-nowrap text-inherit">
                                {child.name}
                              </Typography>
                            </Box>
                          </Link>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              );
            }

            return (
              <Tooltip
                key={item.name}
                title={collapsed ? item.name : ''}
                placement="right"
                disableHoverListener={!collapsed}
              >
                <Link
                  to={item.href ?? '#'}
                  onClick={(event) => {
                    item.onClick?.(event);
                    onNavigateItemClick?.();
                  }}
                  className="no-underline"
                >
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
                    {!collapsed && item.badgeText && (
                      <Box className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                        {item.badgeText}
                      </Box>
                    )}
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
              <Box
                className="flex cursor-pointer items-center overflow-hidden rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
                onClick={onUserInfoClick}
              >
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
