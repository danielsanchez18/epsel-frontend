import { Routes } from '@angular/router';

export const INCIDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/dashboard/incidents/general/general').then(
        (m) => m.PageDashboardIncidentsGeneral,
      ),
  },
  {
    path: 'crear',
    loadComponent: () =>
      import('@pages/dashboard/incidents/create/create').then(
        (m) => m.PageDashboardIncidentsCreate,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@pages/dashboard/incidents/details/details').then(
        (m) => m.PageDashboardIncidentsDetails,
      ),
  },
];
