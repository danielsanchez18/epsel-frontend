import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/auth/login/login').then((m) => m.PageAuthLogin),
  },
  // {
  //   path: 'recuperar-clave',
  //   loadComponent: () => import('@pages/auth/forgot-password/forgot-password').then(m => m.PageAuthForgotPassword)
  // }
];
