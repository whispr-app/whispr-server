export const excludedRoutes = ['v1/users/*', 'v1/auth/*'];
export const includedRoutes = [
  'v1/auth/sign-out',
  'v1/auth/sign-out-all',
  'v1/users/update-key-pair',
];
export const refreshRoutes = [
  'v1/auth/generate-access-token',
  'v1/auth/generate-refresh-token',
];

export const matchRoute = (route: string) => {
  if (includedRoutes.includes(route)) return false;

  for (const r of excludedRoutes) {
    const parts = r.split('/');
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === '*') return true;
      if (part !== route.split('/')[i]) break;
    }
  }
  return false;
};
