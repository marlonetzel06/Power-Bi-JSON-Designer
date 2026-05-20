import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '../../config/msalConfig';
import Button from '../ui/Button';
import { User } from 'lucide-react';

const hasMsal = !!import.meta.env.VITE_MSAL_CLIENT_ID;

export default function LoginButton() {
  if (!hasMsal) {
    return null;
  }

  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(console.error);
  };

  const handleLogout = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin }).catch(console.error);
  };

  if (isAuthenticated) {
    const name = accounts[0]?.name || accounts[0]?.username || 'User';
    return (
      <Button variant="ghost" size="sm" onClick={handleLogout} title={`Sign out (${name})`}>
        <User size={14} />
        <span className="text-[10px] max-w-[80px] truncate">{name}</span>
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogin} title="Sign in">
      <User size={14} />
      <span className="text-[10px]">Sign in</span>
    </Button>
  );
}
