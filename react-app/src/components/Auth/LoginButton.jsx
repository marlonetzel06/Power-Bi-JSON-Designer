import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '../../config/msalConfig';
import Button from '../ui/Button';
import { LogIn, LogOut } from 'lucide-react';

export default function LoginButton() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  function handleLogin() {
    instance.loginRedirect(loginRequest);
  }

  function handleLogout() {
    instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
  }

  if (isAuthenticated) {
    const name = accounts[0]?.name || accounts[0]?.username || 'User';
    return (
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[var(--text-secondary)]">{name}</span>
        <Button onClick={handleLogout} variant="ghost" size="sm">
          <LogOut size={12} />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleLogin} variant="ghost">
      <LogIn size={14} />
      Sign In
    </Button>
  );
}
