import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  // Not logged in
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Role enforcement
  const expectedRole = route.data?.['role'];
  const userRole = auth.getRole();

  if (expectedRole && userRole !== expectedRole) {

    // Redirect to correct dashboard instead of login
    if (userRole) {
      router.navigate(['/' + userRole.toLowerCase()]);
    } else {
      router.navigate(['/login']);
    }

    return false;
  }

  return true;
};