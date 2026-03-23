/**
 * Environment variables - Centralized configuration
 * All env vars are loaded here for better management and type safety
 */

// API & Backend Services
export const ENV = {
  // API URLs
  api: {
    baseUrl: import.meta.env.VITE_API_URL as string,
  },

  // Authentication
  oauth: {
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
    facebookAppId:
      (import.meta.env.VITE_FACEBOOK_APP_ID as string) ?? '702936619420508',
  },

  // Real-time Communication
  signalr: {
    url: import.meta.env.VITE_SIGNALR_URL as string,
  },
  // WebSocket (Alternative real-time, currently using SignalR)
  // ws: {
  //   url: import.meta.env.VITE_WS_URL as string | undefined,
  // },

  // Third-party Services
  maps: {
    openMapApiKey: import.meta.env.VITE_OPENMAP_API_KEY as string | undefined,
  },
};

// Helper to validate required env vars on app startup
export function validateEnv(): void {
  const requiredVars = {
    VITE_API_URL: ENV.api.baseUrl,
    VITE_GOOGLE_CLIENT_ID: ENV.oauth.googleClientId,
    VITE_SIGNALR_URL: ENV.signalr.url,
    VITE_OPENMAP_API_KEY: ENV.maps.openMapApiKey,
    VITE_FACEBOOK_APP_ID: ENV.oauth.facebookAppId,
  };

  const missing = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
