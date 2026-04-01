/**
 * Admin Panel Theme Configuration
 * Centralized color and theme settings for the admin interface
 */

export interface ColorConfig {
  primary: string;
  secondary: string;
  active: string;
  activeText: string;
  hover: string;
  hoverText: string;
  logout: string;
  logoutHover: string;
  border: string;
}

export interface AdminThemeConfig {
  gradientColors: {
    from: string;
    to: string;
  };
  textColors: ColorConfig;
}

export const ADMIN_THEME: AdminThemeConfig = {
  gradientColors: {
    from: '#4A90E2', // Blue
    to: '#E3F2FD', // Very light blue
  },
  textColors: {
    primary: '#1A3A5C', // Main text - dark blue
    secondary: '#3B7DD6', // Secondary text/borders - medium blue
    active: '#3B7DD6', // Active menu item background - medium blue
    activeText: '#ffffff', // Active menu item text - white
    hover: '#BBD9F7', // Hover background - light blue
    hoverText: '#0F2642', // Hover text - very dark blue
    logout: '#dd3838', // Logout button - red
    logoutHover: '#b82e2e', // Logout hover - dark red
    border: 'rgba(59, 125, 214, 0.3)', // Border color - translucent blue
  },
};

export const ADMIN_USER_INFO = {
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'Admin',
};
