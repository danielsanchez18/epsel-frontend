import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = auth.isAuthenticated();

  return allowed ? true : router.createUrlTree(['/']);
};
