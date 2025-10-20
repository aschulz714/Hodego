let logoutFn: (() => void) | null = null;

export const authService = {
  setLogout: (fn: () => void) => {
    logoutFn = fn;
  },
  logout: () => {
    if (logoutFn) logoutFn();
  },
};