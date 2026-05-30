import { Routes } from "@angular/router";

export const COBRANZA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/dashboard/cobranza/general/general').then(m => m.PageDashboardCobranzaGeneral),
  },
  {
    path: ':id',
    loadComponent: () => import('@pages/dashboard/cobranza/details/details').then(m => m.PageDashboardCobranzaDetails),
  }
];
