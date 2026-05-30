import { Routes } from "@angular/router";

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/dashboard/payments/general/general').then(m => m.PageDashboardPaymentsGeneral),
  },
  {
    path: ':id',
    loadComponent: () => import('@pages/dashboard/payments/details/details').then(m => m.PageDashboardPaymentsDetails),
  }
];
