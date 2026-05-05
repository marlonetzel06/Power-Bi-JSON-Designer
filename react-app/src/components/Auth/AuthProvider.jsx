import { useState, useEffect } from 'react';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '../../config/msalConfig';

const msalInstance = new PublicClientApplication(msalConfig);

// Must run BEFORE React renders — otherwise the popup can't process the auth code
const msalReady = msalInstance.initialize().then(() =>
  msalInstance.handleRedirectPromise()
);

export default function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    msalReady.then(() => {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
      }
      msalInstance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
          msalInstance.setActiveAccount(event.payload.account);
        }
      });
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
