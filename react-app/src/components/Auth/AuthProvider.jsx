import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '../../config/msalConfig';

const msalInstance = new PublicClientApplication(msalConfig);

export default function AuthProvider({ children }) {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
