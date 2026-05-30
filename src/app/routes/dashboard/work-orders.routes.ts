import { Routes } from '@angular/router';

export const WORK_ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/dashboard/work-orders/general/general').then(
        (m) => m.PageDashboardWorkOrdersGeneral,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('@pages/dashboard/work-orders/details/details').then(
        (m) => m.PageDashboardWorkOrdersDetails,
      ),
  },
];
