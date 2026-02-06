/**
 * Moderator Panel Theme Configuration
 * Centralized color and theme settings for the moderator interface
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

export interface ModeratorThemeConfig {
  gradientColors: {
    from: string;
    to: string;
  };
  textColors: ColorConfig;
}

export const MODERATOR_THEME: ModeratorThemeConfig = {
  gradientColors: {
    from: '#89D151', // Light green
    to: '#e8f5dd', // Very light green
  },
  textColors: {
    primary: '#2c5e1a', // Main text - dark green
    secondary: '#5a9e3f', // Secondary text/borders - medium green
    active: '#5a9e3f', // Active menu item background - medium green
    activeText: '#ffffff', // Active menu item text - white
    hover: '#c8e6a5', // Hover background - light green
    hoverText: '#1a3d0f', // Hover text - very dark green
    logout: '#dd3838', // Logout button - red
    logoutHover: '#b82e2e', // Logout hover - dark red
    border: 'rgba(90, 158, 63, 0.3)', // Border color - translucent green
  },
};

export const MODERATOR_USER_INFO = {
  name: 'Moderator User',
  email: 'moderator@example.com',
  role: 'Moderator Panel',
};
