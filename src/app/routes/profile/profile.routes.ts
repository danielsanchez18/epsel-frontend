import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@layouts/profile/profile').then((m) => m.LayoutProfile),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@pages/profile/info/info').then((m) => m.PageProfileInfo),
      },
      {
        path: 'seguridad',
        loadComponent: () =>
          import('@pages/profile/security/security').then(
            (m) => m.PageProfileSecurity,
          ),
      },
    ],
  },
];
