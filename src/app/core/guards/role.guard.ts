import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = (route.data?.['roles'] as string[]) || [];
  const userRole = authService.userRole();

  if (!userRole) {
    return router.createUrlTree(['/auth/login']);
  }

  const hasRole = expectedRoles.some(r => r.toLowerCase() === userRole.toLowerCase());
  if (hasRole) {
    return true;
  }

  // Not authorized for this specific role, redirect to their role dashboard
  const defaultRoute = authService.getDefaultRouteForRole();
  return router.createUrlTree([defaultRoute]);
};

