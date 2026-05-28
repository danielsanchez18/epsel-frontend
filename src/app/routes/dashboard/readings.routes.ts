import { Routes } from "@angular/router";

export const READINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/dashboard/readings/general/general').then(m => m.PageDashboardReadingsGeneral),
  },
  {
    path: ':id',
    loadComponent: () => import('@pages/dashboard/readings/details/details').then(m => m.PageDashboardReadingsDetails),
  }
];
