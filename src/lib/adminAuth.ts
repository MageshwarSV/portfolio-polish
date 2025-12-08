// Admin authentication utilities
export const ADMIN_CREDENTIALS = {
  username: 'mageshwar',
  password: 'AvInAsH@2003'
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const auth = localStorage.getItem('admin_auth');
  return auth === 'true';
};

export const login = (username: string, password: string): boolean => {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem('admin_auth', 'true');
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem('admin_auth');
};
