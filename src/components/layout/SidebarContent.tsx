import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import logoImage from '@assets/lowca-logo.png';
import glassImage from '@assets/ios-light.png';

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
  textColors?: { primary: string; secondary: string; active: string };
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
  gradientColors = { from: '#06AA4C', to: '#06AA4C' },
  textColors = { primary: '#ffffff', secondary: '#e8f5e9', active: '#045a2e' },
  userInfo = { name: 'User', email: 'user@example.com', role: 'Panel' },
  onLogout = (): void => {},
}: SidebarContentProps): React.JSX.Element => {
  const location = useLocation();

  return (
    <div
      className="flex flex-1 flex-col shadow-xl"
      style={{
        background: `linear-gradient(to bottom, ${gradientColors.from}, ${gradientColors.to})`,
      }}
    >
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        {/* Logo/Brand */}
        <div className="mb-8 flex shrink-0 items-center px-4">
          <div className="flex w-full items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              <img
                src={glassImage}
                alt="Lowca Icon"
                className="h-full w-full object-contain"
              />
            </div>
            {!collapsed && (
              <div className="ml-4 flex flex-col justify-center">
                <img
                  src={logoImage}
                  alt="Lowca Logo"
                  className="h-8 object-contain"
                  style={{ maxWidth: '120px' }}
                />
                <p
                  className="mt-1 text-xs opacity-90"
                  style={{ color: textColors.primary }}
                >
                  {userInfo.role}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 space-y-2 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isActive ? 'text-white shadow-lg' : 'group-hover:text-white'
                } group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  collapsed ? 'justify-center' : ''
                }`}
                style={{
                  backgroundColor: isActive ? textColors.active : 'transparent',
                  color: isActive ? '#ffffff' : textColors.primary,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = gradientColors.to;
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = textColors.primary;
                  }
                }}
                title={collapsed ? item.name : ''}
              >
                <item.icon
                  className={`${
                    isActive ? 'text-white' : 'group-hover:text-white'
                  } h-6 w-6 shrink-0 transition-colors duration-200`}
                  style={{
                    color: isActive ? '#ffffff' : textColors.primary,
                  }}
                />
                {!collapsed && (
                  <span className="ml-3 transition-opacity duration-200">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto space-y-2 px-2">
          <button
            onClick={onLogout}
            className={`group flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
              collapsed ? 'justify-center' : ''
            }`}
            style={{ color: textColors.primary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d32f2f';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = textColors.primary;
            }}
            title={collapsed ? 'Đăng xuất' : ''}
          >
            <ArrowRightOnRectangleIcon
              className="h-6 w-6 shrink-0 transition-colors duration-200"
              style={{ color: textColors.primary }}
            />
            {!collapsed && <span className="ml-3">Đăng xuất</span>}
          </button>

          {/* User info in collapsed mode */}
          {collapsed && (
            <div
              className="pt-4"
              style={{ borderTop: `1px solid ${textColors.secondary}` }}
            >
              <div className="flex justify-center">
                <div
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full"
                  style={{ backgroundColor: textColors.active }}
                >
                  {userInfo?.avatarUrl ? (
                    <img
                      src={userInfo.avatarUrl}
                      alt="avatar"
                      className="h-8 w-8 object-cover"
                    />
                  ) : (
                    <UserCircleIcon
                      className="h-6 w-6"
                      style={{ color: textColors.primary }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* User info in expanded mode */}
          {!collapsed && (
            <div
              className="pt-4"
              style={{ borderTop: `1px solid ${textColors.secondary}` }}
            >
              <div className="flex items-center px-3 py-2">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
                  style={{ backgroundColor: textColors.active }}
                >
                  {userInfo?.avatarUrl ? (
                    <img
                      src={userInfo.avatarUrl}
                      alt="avatar"
                      className="h-8 w-8 object-cover"
                    />
                  ) : (
                    <UserCircleIcon
                      className="h-6 w-6"
                      style={{ color: textColors.primary }}
                    />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {userInfo.name}
                  </p>
                  <p className="text-xs" style={{ color: textColors.primary }}>
                    {userInfo.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarContent;
