export const excludedRoutes = [
  'v1/users/register',
  'v1/users/get-user-password-salt/*',
  'v1/auth/sign-in',
];
export const refreshRoutes = [
  'v1/auth/generate-access-token',
  'v1/auth/generate-refresh-token',
];

export const matchRoute = (route: string): boolean => {
  for (const r of excludedRoutes) {
    const parts = r.split('/');
    const routeParts = route.split('/');
    if (parts.length !== routeParts.length) continue;
    let match = true;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === '*') continue;
      if (part !== routeParts[i]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
};
