import { Routes } from "@angular/router";

export const WORKERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/dashboard/workers/general/general').then(m => m.PageDashboardWorkersGeneral),
  },
  {
    path: 'agregar',
    loadComponent: () => import('@pages/dashboard/workers/add/add').then(m => m.PageDashboardWorkersAdd),
  },
  {
    path: ':id',
    loadComponent: () => import('@pages/dashboard/workers/details/general/general').then(m => m.PageDashboardWorkersDetailsGeneral),
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/dashboard/workers/details/info/info').then(m => m.PageDashboardWorkersDetailsInfo)
      },
      {
        path: 'seguridad',
        loadComponent: () => import('@pages/dashboard/workers/details/security/security').then(m => m.PageDashboardWorkersDetailsSecurity)
      }
    ]
  }
]
