import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '../../config/msalConfig';

export default function LoginButton() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  async function handleLogin() {
    try {
      await instance.loginPopup(loginRequest);
    } catch (e) {
      console.error('Login failed:', e);
    }
  }

  function handleLogout() {
    instance.logoutPopup();
  }

  if (isAuthenticated) {
    const name = accounts[0]?.name || accounts[0]?.username || 'User';
    return (
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#555] dark:text-[#a9b1d6]">{name}</span>
        <button
          onClick={handleLogout}
          className="text-[10px] px-2 py-1 rounded border border-[#c8d8ea] bg-white text-[#888] cursor-pointer hover:text-[#d44] hover:border-[#d44] dark:bg-[#24263e] dark:border-[#373963] dark:text-[#a9b1d6]"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="text-xs px-3 py-1.5 rounded-md border border-[#1f8ac0] bg-[#1f8ac0] text-white cursor-pointer font-semibold hover:bg-[#1a7aaa]"
    >
      Sign In (Azure AD)
    </button>
  );
}
