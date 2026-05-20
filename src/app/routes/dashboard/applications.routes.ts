import { Routes } from "@angular/router";

export const APPLICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/dashboard/applications/general/general').then(m => m.PageDashboardApplicationsGeneral),
  },
  {
    path: ':id',
    loadComponent: () => import('@pages/dashboard/applications/details/details').then(m => m.PageDashboardApplicationsDetails),
  }
]
