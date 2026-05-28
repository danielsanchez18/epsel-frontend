import { Routes } from "@angular/router";

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/dashboard/billing/general/general').then(m => m.PageDashboardBillingGeneral),
  },
  {
    path: ':id',
    loadComponent: () => import('@pages/dashboard/billing/details/details').then(m => m.PageDashboardBillingDetails),
  }
];
