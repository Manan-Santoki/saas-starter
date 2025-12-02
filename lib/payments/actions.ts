'use server';

import { withTeam } from '@/lib/auth/middleware';

export const checkoutAction = withTeam(async (formData, team) => {
  return;
});

export const customerPortalAction = withTeam(async (_, team) => {
  return;
});
