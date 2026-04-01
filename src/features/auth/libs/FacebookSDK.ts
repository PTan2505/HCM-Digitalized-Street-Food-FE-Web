interface FacebookSDK {
  init: (params: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }) => void;
  login: (
    callback: (response: { authResponse?: unknown }) => void,
    options?: { scope: string }
  ) => void;
  api: (
    path: string,
    params: Record<string, string>,
    callback: (response: unknown) => void
  ) => void;
}

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: FacebookSDK;
  }
}

import { ENV } from '@config/env';

export const initFacebookSDK = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.FB) {
      resolve(true);
      return;
    }
    // Initialize the SDK when it loads
    window.fbAsyncInit = function (): void {
      window.FB.init({
        appId: ENV.oauth.facebookAppId,
        cookie: true,
        xfbml: true,
        version: 'v21.0',
      });
      resolve(true);
    };
    // Load the Facebook SDK script
    (function (d: Document, s: string, id: string): void {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode?.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  });
};

export const loginWithFacebook = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error('Facebook SDK not initialized'));
      return;
    }

    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const accessToken = (response.authResponse as { accessToken: string })
            .accessToken;
          resolve(accessToken);
        } else {
          reject(new Error('User cancelled login or did not fully authorize.'));
        }
      },
      { scope: 'public_profile,email' }
    );
  });
};
