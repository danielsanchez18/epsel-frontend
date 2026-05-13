import { Routes } from "@angular/router";

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/dashboard/customers/general/general').then(m => m.PageDashboardCustomersGeneral),
  },
  {
    path: ':id',
    loadComponent: () => import('@pages/dashboard/customers/details/general/general').then(m => m.PageDashboardCustomersDetailsGeneral),
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/dashboard/customers/details/info/info').then(m => m.PageDashboardCustomersDetailsInfo),
      },
      {
        path: 'facturacion',
        loadComponent: () => import('@pages/dashboard/customers/details/billing/billing').then(m => m.PageDashboardCustomersDetailsBilling),
      },
      {
        path: 'pagos',
        loadComponent: () => import('@pages/dashboard/customers/details/payments/payments').then(m => m.PageDashboardCustomersDetailsPayments),
      },
      {
        path: 'reclamos',
        loadComponent: () => import('@pages/dashboard/customers/details/claims/claims').then(m => m.PageDashboardCustomersDetailsClaims),
      },
      {
        path: 'suministros',
        loadComponent: () => import('@pages/dashboard/customers/details/supplies/supplies').then(m => m.PageDashboardCustomerDetailsSupplies)
      }
    ]
  }
]
