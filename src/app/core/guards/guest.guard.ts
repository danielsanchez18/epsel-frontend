import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';

export const guestGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const authenticated = auth.isAuthenticated();

  return authenticated ? router.createUrlTree(['/dashboard']) : true;
};
